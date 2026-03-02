import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { VideoProcessingJobRepository } from '@api/application/repositories/video-processing-job';
import { VideoProcessingPublisherJob } from '@api/application/publishers/video-processing.publisher';
import { FileManager } from '@file-manager';
import { InMemoryVideoProcessingJobRepository } from '@test/repositories/in-memory-video-processing-job-repository';
import { VideoProcessingPublisherJobMock } from '@test/mocks/video-processing-publisher.mock';
import { FileManagerMock } from '@test/mocks/file-manager.mock';
import * as fs from 'fs';
import * as path from 'path';

describe('VideoProcessingJobs E2E (Mocked)', () => {
  let app: INestApplication;
  let videoProcessingJobRepository: InMemoryVideoProcessingJobRepository;
  const testVideoPath = path.join(__dirname, 'test-video.mp4');

  beforeAll(async () => {
    // Create a test video file
    fs.writeFileSync(testVideoPath, Buffer.from('fake video content for testing'));

    // Create in-memory repository and mocks
    videoProcessingJobRepository = new InMemoryVideoProcessingJobRepository();
    const fileManagerMock = new FileManagerMock();
    const publisherMock = new VideoProcessingPublisherJobMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(VideoProcessingJobRepository)
      .useValue(videoProcessingJobRepository)
      .overrideProvider(FileManager)
      .useValue(fileManagerMock)
      .overrideProvider(VideoProcessingPublisherJob)
      .useValue(publisherMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    // Clean up test file
    if (fs.existsSync(testVideoPath)) {
      fs.unlinkSync(testVideoPath);
    }
    await app.close();
  });

  describe('POST /video-processing-jobs', () => {
    it('should create a video processing job with valid file', async () => {
      const response = await request(app.getHttpServer())
        .post('/video-processing-jobs')
        .field('name', 'Test Video Job')
        .attach('file', testVideoPath)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('pending');
    });

    it('should reject file larger than 20MB', async () => {
      const largeBuffer = Buffer.alloc(21 * 1024 * 1024); // 21MB
      
      await request(app.getHttpServer())
        .post('/video-processing-jobs')
        .field('name', 'Large Video')
        .attach('file', largeBuffer, {
          filename: 'large-video.mp4',
          contentType: 'video/mp4',
        })
        .expect(400);
    });

    it('should reject request without file', async () => {
      await request(app.getHttpServer())
        .post('/video-processing-jobs')
        .field('name', 'No File Test')
        .expect(400);
    });

    it('should reject request with invalid name (too short)', async () => {
      await request(app.getHttpServer())
        .post('/video-processing-jobs')
        .field('name', 'Test') // Less than 5 characters
        .attach('file', testVideoPath)
        .expect(400);
    });
  });

  describe('GET /video-processing-jobs', () => {
    it('should list video processing jobs for the user', async () => {
      // First create a job
      await request(app.getHttpServer())
        .post('/video-processing-jobs')
        .field('name', 'List Test Video')
        .attach('file', testVideoPath)
        .expect(201);

      // Then list jobs
      const response = await request(app.getHttpServer())
        .get('/video-processing-jobs')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const job = response.body[0];
      expect(job).toHaveProperty('id');
      expect(job).toHaveProperty('status');
    });
  });

  describe('Integration Flow', () => {
    it('should complete full upload and list flow', async () => {
      // Step 1: Upload a video
      const uploadResponse = await request(app.getHttpServer())
        .post('/video-processing-jobs')
        .field('name', 'Integration Test Video')
        .attach('file', testVideoPath)
        .expect(201);

      const jobId = uploadResponse.body.id;
      expect(jobId).toBeDefined();
      expect(uploadResponse.body.status).toBe('pending');

      // Step 2: List jobs and verify the uploaded job is present
      const listResponse = await request(app.getHttpServer())
        .get('/video-processing-jobs')
        .expect(200);

      const uploadedJob = listResponse.body.find((job: any) => job.id === jobId);
      expect(uploadedJob).toBeDefined();
      expect(uploadedJob.status).toBe('pending');
    });
  });
});
