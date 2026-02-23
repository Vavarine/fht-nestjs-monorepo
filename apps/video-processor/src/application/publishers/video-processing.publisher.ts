export abstract class VideoProcessingPublisherJob {
  abstract publish(
    status: string,
    videoProcessingJobId: string,
    fileName?: string,
  ): Promise<void>;
}
