import { VideoProcessingJobStatus } from "@api/application/entities/video-processing-job";

export abstract class UserNotifierPublisher {
  abstract publish(
    userId: string,
    videoProcessingJobId: string,
    status: VideoProcessingJobStatus,
    fileName?: string,
  ): Promise<void>;
}
