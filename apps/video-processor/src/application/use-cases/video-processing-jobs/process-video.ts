import { VideoProcessingJobStatus } from "@api/application/entities/video-processing-job";
import { FileManager } from "@file-manager";
import { Injectable, Logger } from "@nestjs/common";
import { VideoProcessingPublisherJob } from "@video-processor/application/publishers/video-processing.publisher";
import {
  ProcessedVideoArtifact,
  VideoProcessor,
} from "@video-processor/application/video-processor/video-processor";
import { createReadStream } from "node:fs";
import { rm } from "node:fs/promises";

interface ProcessVideoRequest {
  videoProcessingJobId: string;
  fileId: string;
}

@Injectable()
export class ProcessVideo {
  private readonly logger = new Logger(ProcessVideo.name);

  constructor(
    private fileManager: FileManager,
    private videoProcessor: VideoProcessor,
    private videoProcessingPublisherJob: VideoProcessingPublisherJob,
  ) {}

  async execute(request: ProcessVideoRequest): Promise<any> {
    this.videoProcessingPublisherJob.publish(
      VideoProcessingJobStatus.PROCESSING,
      request.videoProcessingJobId,
    );

    let artifact: ProcessedVideoArtifact | undefined;

    const fileUrl = await this.fileManager.getFileUrl(request.fileId);

    try {
      artifact = await this.videoProcessor.process(
        fileUrl,
        request.videoProcessingJobId,
      );

      const zipFileName = `${request.videoProcessingJobId}.zip`;

      await this.fileManager.save(
        createReadStream(artifact.zipFilePath),
        zipFileName,
      );

      await this.fileManager.deleteById(request.fileId);

      this.logger.log(
        `Processed and uploaded video job id: ${request.videoProcessingJobId}`,
      );

      this.videoProcessingPublisherJob.publish(
        VideoProcessingJobStatus.COMPLETED,
        request.videoProcessingJobId,
        zipFileName,
      );
    } catch (error) {
      this.logger.error("Error processing video:", error);
      this.videoProcessingPublisherJob.publish(
        VideoProcessingJobStatus.FAILED,
        request.videoProcessingJobId,
      );
    } finally {
      if (!artifact) return;
      await rm(artifact.outputDirPath, { recursive: true, force: true });
      await rm(artifact.zipFilePath, { force: true });
    }
  }
}
