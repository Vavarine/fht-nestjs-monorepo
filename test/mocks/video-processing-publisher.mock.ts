import { VideoProcessingJobStatus } from "@api/application/entities/video-processing-job";

interface PublishedMessage {
  jobId: string;
  videoFile?: string;
  status?: VideoProcessingJobStatus;
  fileName?: string;
  timestamp: Date;
}

export class VideoProcessingPublisherJobMock {
  public publishedMessages: PublishedMessage[] = [];

  async publish(
    jobIdOrStatus: string | VideoProcessingJobStatus,
    videoFileOrJobId?: string,
    fileName?: string,
  ): Promise<void> {
    // Handle both signatures: (jobId, videoFile, fileName) and (status, jobId, fileName)
    if (typeof jobIdOrStatus === 'string' && jobIdOrStatus.includes('-')) {
      // First signature: (jobId, videoFile, fileName)
      this.publishedMessages.push({
        jobId: jobIdOrStatus,
        videoFile: videoFileOrJobId,
        fileName,
        timestamp: new Date(),
      });
    } else {
      // Second signature: (status, jobId, fileName)
      this.publishedMessages.push({
        status: jobIdOrStatus as VideoProcessingJobStatus,
        jobId: videoFileOrJobId || '',
        fileName,
        timestamp: new Date(),
      });
    }
  }

  getLastPublishedMessage(): PublishedMessage | undefined {
    return this.publishedMessages[this.publishedMessages.length - 1];
  }

  reset(): void {
    this.publishedMessages = [];
  }
}
