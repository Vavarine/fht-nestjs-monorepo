// This test requires full infrastructure running (PostgreSQL, RabbitMQ, RustFS)
// To run: pnpm docker:dev:up && pnpm test:e2e:full
// For faster tests without infrastructure, see video-processing-jobs-mocked.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

describe('VideoProcessingJobs (E2E)', () => {
  let app: INestApplication;
  let createdJobId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /video-processing-jobs', () => {
    it('should create a video processing job with valid file', async () => {
      // Create a small test video file (or use a dummy buffer)
      const testVideoBuffer = Buffer.from('fake video content for testing');
      
      const response = await request(app.getHttpServer())
        .post('/video-processing-jobs')
        .attach('file', testVideoBuffer, 'test-video.mp4')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('pending');
      
      // Save job ID for next tests
      createdJobId = response.body.id;
    });

    it('should reject file larger than 20MB', async () => {
      // Create a buffer larger than 20MB
      const largeBuffer = Buffer.alloc(21 * 1024 * 1024); // 21MB
      
      await request(app.getHttpServer())
        .post('/video-processing-jobs')
        .attach('file', largeBuffer, 'large-video.mp4')
        .expect(400);
    });

    it('should reject non-video file types', async () => {
      const textBuffer = Buffer.from('This is a text file, not a video');
      
      await request(app.getHttpServer())
        .post('/video-processing-jobs')
        .attach('file', textBuffer, 'document.txt')
        .expect(400);
    });

    it('should reject request without file', async () => {
      await request(app.getHttpServer())
        .post('/video-processing-jobs')
        .expect(400);
    });
  });

  describe('GET /video-processing-jobs', () => {
    it('should list video processing jobs for the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/video-processing-jobs')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        const job = response.body[0];
        expect(job).toHaveProperty('id');
        expect(job).toHaveProperty('status');
        expect(job).toHaveProperty('createdAt');
      }
    });

    it('should return jobs with correct structure', async () => {
      // First create a job to ensure we have data
      const testVideoBuffer = Buffer.from('test video for list');
      await request(app.getHttpServer())
        .post('/video-processing-jobs')
        .attach('file', testVideoBuffer, 'list-test-video.mp4');

      const response = await request(app.getHttpServer())
        .get('/video-processing-jobs')
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      
      const job = response.body[0];
      expect(job).toHaveProperty('id');
      expect(job).toHaveProperty('status');
      expect(['pending', 'processing', 'completed', 'failed']).toContain(job.status);
    });
  });

  describe('Integration Flow', () => {
    it('should complete full upload and list flow', async () => {
      // Step 1: Upload a video
      const testVideoBuffer = Buffer.from('integration test video');
      const uploadResponse = await request(app.getHttpServer())
        .post('/video-processing-jobs')
        .attach('file', testVideoBuffer, 'integration-test.mp4')
        .expect(201);

      const jobId = uploadResponse.body.id;
      expect(jobId).toBeDefined();

      // Step 2: List jobs and verify the uploaded job is present
      const listResponse = await request(app.getHttpServer())
        .get('/video-processing-jobs')
        .expect(200);

      const uploadedJob = listResponse.body.find((job: any) => job.id === jobId);
      expect(uploadedJob).toBeDefined();
      expect(uploadedJob.status).toBe('pending');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      await request(app.getHttpServer())
        .post('/video-processing-jobs')
        .send({ invalid: 'data' })
        .expect(400);
    });

    it('should return proper error for invalid endpoints', async () => {
      await request(app.getHttpServer())
        .get('/video-processing-jobs/invalid-endpoint')
        .expect(404);
    });
  });
});
