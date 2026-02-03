export abstract class VideoProcessingPublisherJob {
  abstract publish(
    videoProcessingJobId: string,
    filePath: string
  ): Promise<void>;
}