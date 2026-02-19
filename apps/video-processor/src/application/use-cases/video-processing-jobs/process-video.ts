import { FileManager } from "@file-manager";
import { Injectable, Logger } from "@nestjs/common";
import { VideoProcessor } from "@video-processor/application/video-processor/video-processor";
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
  ) {}

  async execute(request: ProcessVideoRequest): Promise<any> {
    const fileUrl = await this.fileManager.getFileUrl(
      request.fileId,
      process.env.FS_ENDPOINT_URL_PUBLIC || "http://localhost:9000",
    );

    const artifact = await this.videoProcessor.process(
      fileUrl,
      request.videoProcessingJobId,
    );

    try {
      await this.fileManager.save(
        createReadStream(artifact.zipFilePath),
        `${request.videoProcessingJobId}.zip`,
      );

      await this.fileManager.deleteById(request.fileId);

      this.logger.log(
        `Processed and uploaded video job id: ${request.videoProcessingJobId}`,
      );
    } finally {
      await rm(artifact.outputDirPath, { recursive: true, force: true });
      await rm(artifact.zipFilePath, { force: true });
    }
  }
}
