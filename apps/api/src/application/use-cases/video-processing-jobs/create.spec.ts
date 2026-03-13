import { InMemoryVideoProcessingJobRepository } from '@test/repositories/in-memory-video-processing-job-repository';
import { FileManagerMock } from '@test/mocks/file-manager.mock';
import { VideoProcessingPublisherJobMock } from '@test/mocks/video-processing-publisher.mock';
import { CreateVideoProcessingJob } from './create';
import { VideoProcessingJob, VideoProcessingJobStatus } from '@api/application/entities/video-processing-job';

describe('CreateVideoProcessingJob', () => {
    let createVideoProcessingJob: CreateVideoProcessingJob;
    let videoProcessingJobRepository: InMemoryVideoProcessingJobRepository;
    let fileManager: FileManagerMock;
    let videoProcessingPublisher: VideoProcessingPublisherJobMock;

    beforeEach(() => {
        videoProcessingJobRepository = new InMemoryVideoProcessingJobRepository();
        fileManager = new FileManagerMock();
        videoProcessingPublisher = new VideoProcessingPublisherJobMock();
        createVideoProcessingJob = new CreateVideoProcessingJob(
            videoProcessingJobRepository,
            fileManager as any,
            videoProcessingPublisher as any,
        );
    });

    describe('video processing job creation', () => {
        it('should create a video processing job with PENDING status', async () => {
            const buffer = Buffer.from('test video content');
            const request = {
                buffer,
                originalFileName: 'test-video.mp4',
                mimeType: 'video/mp4',
                userId: 'user-123',
            };

            const response = await createVideoProcessingJob.execute(request);

            expect(response).toHaveProperty('videoProcessingJob');
            expect(response.videoProcessingJob).toBeInstanceOf(VideoProcessingJob);
            expect(response.videoProcessingJob.status).toBe(VideoProcessingJobStatus.PENDING);
            expect(response.videoProcessingJob.userId).toBe('user-123');
            expect(response.videoProcessingJob.videoFile).toBeTruthy();
        });

        it('should save the video file using FileManager', async () => {
            const buffer = Buffer.from('test video content');
            const request = {
                buffer,
                originalFileName: 'test-video.mp4',
                mimeType: 'video/mp4',
                userId: 'user-123',
            };

            const response = await createVideoProcessingJob.execute(request);

            expect(fileManager.savedFiles.size).toBe(1);
            const savedFileName = Array.from(fileManager.savedFiles.keys())[0];
            expect(savedFileName).toMatch(/^mocked-\d+-.*\.mp4$/);
            expect(fileManager.savedFiles.get(savedFileName)).toBe(buffer);
            expect(response.videoProcessingJob.videoFile).toBe(savedFileName);
        });

        it('should store the job in the repository', async () => {
            const buffer = Buffer.from('test video content');
            const request = {
                buffer,
                originalFileName: 'test-video.mp4',
                mimeType: 'video/mp4',
                userId: 'user-123',
            };

            const response = await createVideoProcessingJob.execute(request);

            const savedJob = await videoProcessingJobRepository.findById(response.videoProcessingJob.id);
            expect(savedJob).not.toBeNull();
            expect(savedJob?.id).toBe(response.videoProcessingJob.id);
            expect(savedJob?.status).toBe(VideoProcessingJobStatus.PENDING);
        });

        it('should publish a message to the video processing queue', async () => {
            const buffer = Buffer.from('test video content');
            const request = {
                buffer,
                originalFileName: 'test-video.mp4',
                mimeType: 'video/mp4',
                userId: 'user-123',
            };

            const response = await createVideoProcessingJob.execute(request);

            expect(videoProcessingPublisher.publishedMessages.length).toBe(1);
            const publishedMessage = videoProcessingPublisher.getLastPublishedMessage();
            expect(publishedMessage?.jobId).toBe(response.videoProcessingJob.id);
            expect(publishedMessage?.videoFile).toBe(response.videoProcessingJob.videoFile);
        });

        it('should throw error if video file was not saved correctly', async () => {
            // Mock fileManager to return empty string
            fileManager.save = jest.fn().mockResolvedValue('');
            
            const buffer = Buffer.from('test video content');
            const request = {
                buffer,
                originalFileName: 'test-video.mp4',
                mimeType: 'video/mp4',
                userId: 'user-123',
            };

            await expect(createVideoProcessingJob.execute(request)).rejects.toThrow('Video file was not saved correctly');
        });

        it('should create multiple jobs with different IDs', async () => {
            const buffer = Buffer.from('test video content');
            const request1 = {
                buffer,
                originalFileName: 'video1.mp4',
                mimeType: 'video/mp4',
                userId: 'user-123',
            };
            const request2 = {
                buffer,
                originalFileName: 'video2.mp4',
                mimeType: 'video/mp4',
                userId: 'user-456',
            };

            const response1 = await createVideoProcessingJob.execute(request1);
            const response2 = await createVideoProcessingJob.execute(request2);

            expect(response1.videoProcessingJob.id).not.toBe(response2.videoProcessingJob.id);
            expect(response1.videoProcessingJob.userId).toBe('user-123');
            expect(response2.videoProcessingJob.userId).toBe('user-456');
        });

        it('should associate the correct userId with the job', async () => {
            const buffer = Buffer.from('test video content');
            const userId = 'cognito-sub-12345';
            const request = {
                buffer,
                originalFileName: 'test-video.mp4',
                mimeType: 'video/mp4',
                userId,
            };

            const response = await createVideoProcessingJob.execute(request);

            expect(response.videoProcessingJob.userId).toBe(userId);
            
            const savedJob = await videoProcessingJobRepository.findById(response.videoProcessingJob.id);
            expect(savedJob?.userId).toBe(userId);
        });
    });
});
