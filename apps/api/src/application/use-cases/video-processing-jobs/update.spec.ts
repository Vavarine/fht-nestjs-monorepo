import { InMemoryVideoProcessingJobRepository } from '@test/repositories/in-memory-video-processing-job-repository';
import { UpdateVideoProcessingJob } from './update';
import { VideoProcessingJob, VideoProcessingJobStatus } from '@api/application/entities/video-processing-job';

describe('UpdateVideoProcessingJob', () => {
    let updateVideoProcessingJob: UpdateVideoProcessingJob;
    let videoProcessingJobRepository: InMemoryVideoProcessingJobRepository;

    beforeEach(() => {
        videoProcessingJobRepository = new InMemoryVideoProcessingJobRepository();
        updateVideoProcessingJob = new UpdateVideoProcessingJob(
            videoProcessingJobRepository,
        );
    });

    describe('update video processing job', () => {
        it('should update a video processing job status to COMPLETED', async () => {
            const job = new VideoProcessingJob({
                status: VideoProcessingJobStatus.PROCESSING,
                videoFile: 'original-video.mp4',
                userId: 'user-123',
            });
            await videoProcessingJobRepository.create(job);

            const request = {
                videoProcessingJobId: job.id,
                status: VideoProcessingJobStatus.COMPLETED,
                fileName: 'processed-video.zip',
            };

            const response = await updateVideoProcessingJob.execute(request);

            expect(response.videoProcessingJob.status).toBe(VideoProcessingJobStatus.COMPLETED);
            expect(response.videoProcessingJob.processedFile).toBe('processed-video.zip');
        });

        it('should update the job in the repository', async () => {
            const job = new VideoProcessingJob({
                status: VideoProcessingJobStatus.PROCESSING,
                videoFile: 'original-video.mp4',
                userId: 'user-123',
            });
            await videoProcessingJobRepository.create(job);

            const request = {
                videoProcessingJobId: job.id,
                status: VideoProcessingJobStatus.COMPLETED,
                fileName: 'processed-video.zip',
            };

            await updateVideoProcessingJob.execute(request);

            const updatedJob = await videoProcessingJobRepository.findById(job.id);
            expect(updatedJob?.status).toBe(VideoProcessingJobStatus.COMPLETED);
            expect(updatedJob?.processedFile).toBe('processed-video.zip');
        });

        it('should throw error if job not found', async () => {
            const request = {
                videoProcessingJobId: 'non-existent-id',
                status: VideoProcessingJobStatus.COMPLETED,
                fileName: 'processed-video.zip',
            };

            await expect(updateVideoProcessingJob.execute(request)).rejects.toThrow(
                'Video processing job not found',
            );
        });

        it('should update job status to FAILED', async () => {
            const job = new VideoProcessingJob({
                status: VideoProcessingJobStatus.PROCESSING,
                videoFile: 'original-video.mp4',
                userId: 'user-123',
            });
            await videoProcessingJobRepository.create(job);

            const request = {
                videoProcessingJobId: job.id,
                status: VideoProcessingJobStatus.FAILED,
                fileName: '',
            };

            const response = await updateVideoProcessingJob.execute(request);

            expect(response.videoProcessingJob.status).toBe(VideoProcessingJobStatus.FAILED);
        });

        it('should handle multiple job updates', async () => {
            const job1 = new VideoProcessingJob({
                status: VideoProcessingJobStatus.PENDING,
                videoFile: 'video1.mp4',
                userId: 'user-123',
            });
            const job2 = new VideoProcessingJob({
                status: VideoProcessingJobStatus.PENDING,
                videoFile: 'video2.mp4',
                userId: 'user-456',
            });
            await videoProcessingJobRepository.create(job1);
            await videoProcessingJobRepository.create(job2);

            await updateVideoProcessingJob.execute({
                videoProcessingJobId: job1.id,
                status: VideoProcessingJobStatus.PROCESSING,
                fileName: '',
            });

            await updateVideoProcessingJob.execute({
                videoProcessingJobId: job2.id,
                status: VideoProcessingJobStatus.COMPLETED,
                fileName: 'processed2.zip',
            });

            const updatedJob1 = await videoProcessingJobRepository.findById(job1.id);
            const updatedJob2 = await videoProcessingJobRepository.findById(job2.id);

            expect(updatedJob1?.status).toBe(VideoProcessingJobStatus.PROCESSING);
            expect(updatedJob2?.status).toBe(VideoProcessingJobStatus.COMPLETED);
            expect(updatedJob2?.processedFile).toBe('processed2.zip');
        });
    });
});
