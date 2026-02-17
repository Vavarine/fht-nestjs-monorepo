export abstract class VideoProcessor {
  abstract process(
    videoPath: string,
    videoProcessingJobId: string,
  ): Promise<Buffer>;
}
