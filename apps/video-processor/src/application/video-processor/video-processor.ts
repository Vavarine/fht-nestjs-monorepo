export interface ProcessedVideoArtifact {
  zipFilePath: string;
  outputDirPath: string;
}

export abstract class VideoProcessor {
  abstract process(
    videoPath: string,
    videoProcessingJobId: string,
  ): Promise<ProcessedVideoArtifact>;
}
