import { InMemoryVideoProcessingJobRepository } from '@test/repositories/in-memory-video-processing-job-repository';
import { ListVideoProcessingJob } from './list';
import { VideoProcessingJob, VideoProcessingJobStatus } from '@api/application/entities/video-processing-job';

describe('ListVideoProcessingJob', () => {
    let listVideoProcessingJob: ListVideoProcessingJob;
    let videoProcessingJobRepository: InMemoryVideoProcessingJobRepository;

    beforeEach(() => {
        videoProcessingJobRepository = new InMemoryVideoProcessingJobRepository();
        listVideoProcessingJob = new ListVideoProcessingJob(
            videoProcessingJobRepository,
        );
    });

    describe('list video processing jobs', () => {
        it('should list all jobs for a specific user', async () => {
            const userId = 'user-123';
            const job1 = new VideoProcessingJob({
                status: VideoProcessingJobStatus.PENDING,
                videoFile: 'video1.mp4',
                userId,
            });
            const job2 = new VideoProcessingJob({
                status: VideoProcessingJobStatus.COMPLETED,
                videoFile: 'video2.mp4',
                userId,
            });
            await videoProcessingJobRepository.create(job1);
            await videoProcessingJobRepository.create(job2);

            const response = await listVideoProcessingJob.execute({ userId });

            expect(response.videoProcessingJobs).toHaveLength(2);
            expect(response.videoProcessingJobs[0].userId).toBe(userId);
            expect(response.videoProcessingJobs[1].userId).toBe(userId);
        });

        it('should return only jobs for the specified user', async () => {
            const user1 = 'user-123';
            const user2 = 'user-456';
            
            const job1 = new VideoProcessingJob({
                status: VideoProcessingJobStatus.PENDING,
                videoFile: 'video1.mp4',
                userId: user1,
            });
            const job2 = new VideoProcessingJob({
                status: VideoProcessingJobStatus.COMPLETED,
                videoFile: 'video2.mp4',
                userId: user2,
            });
            const job3 = new VideoProcessingJob({
                status: VideoProcessingJobStatus.PROCESSING,
                videoFile: 'video3.mp4',
                userId: user1,
            });
            
            await videoProcessingJobRepository.create(job1);
            await videoProcessingJobRepository.create(job2);
            await videoProcessingJobRepository.create(job3);

            const response = await listVideoProcessingJob.execute({ userId: user1 });

            expect(response.videoProcessingJobs).toHaveLength(2);
            expect(response.videoProcessingJobs.every(job => job.userId === user1)).toBe(true);
        });

        it('should throw error when no jobs found for user', async () => {
            const userId = 'user-without-jobs';

            await expect(listVideoProcessingJob.execute({ userId })).rejects.toThrow(
                'No video processing jobs found for the given user ID',
            );
        });

        it('should return jobs with different statuses', async () => {
            const userId = 'user-123';
            
            await videoProcessingJobRepository.create(new VideoProcessingJob({
                status: VideoProcessingJobStatus.PENDING,
                videoFile: 'video1.mp4',
                userId,
            }));
            
            await videoProcessingJobRepository.create(new VideoProcessingJob({
                status: VideoProcessingJobStatus.PROCESSING,
                videoFile: 'video2.mp4',
                userId,
            }));
            
            await videoProcessingJobRepository.create(new VideoProcessingJob({
                status: VideoProcessingJobStatus.COMPLETED,
                videoFile: 'video3.mp4',
                userId,
            }));
            
            await videoProcessingJobRepository.create(new VideoProcessingJob({
                status: VideoProcessingJobStatus.FAILED,
                videoFile: 'video4.mp4',
                userId,
            }));

            const response = await listVideoProcessingJob.execute({ userId });

            expect(response.videoProcessingJobs).toHaveLength(4);
            
            const statuses = response.videoProcessingJobs.map(job => job.status);
            expect(statuses).toContain(VideoProcessingJobStatus.PENDING);
            expect(statuses).toContain(VideoProcessingJobStatus.PROCESSING);
            expect(statuses).toContain(VideoProcessingJobStatus.COMPLETED);
            expect(statuses).toContain(VideoProcessingJobStatus.FAILED);
        });

        it('should return an empty error for user with no jobs', async () => {
            const userId = 'new-user';

            await expect(listVideoProcessingJob.execute({ userId })).rejects.toThrow();
        });

        it('should handle listing jobs after updates', async () => {
            const userId = 'user-123';
            const job = new VideoProcessingJob({
                status: VideoProcessingJobStatus.PENDING,
                videoFile: 'video1.mp4',
                userId,
            });
            
            await videoProcessingJobRepository.create(job);
            
            // Update the job
            job.status = VideoProcessingJobStatus.COMPLETED;
            job.processedFile = 'processed.zip';
            await videoProcessingJobRepository.update(job);

            const response = await listVideoProcessingJob.execute({ userId });

            expect(response.videoProcessingJobs).toHaveLength(1);
            expect(response.videoProcessingJobs[0].status).toBe(VideoProcessingJobStatus.COMPLETED);
            expect(response.videoProcessingJobs[0].processedFile).toBe('processed.zip');
        });
    });
});
