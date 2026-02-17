export abstract class VideoProcessingPublisherJob {
  abstract publish(
    videoProcessingJobId: string,
    fileId: string
  ): Promise<void>;
}