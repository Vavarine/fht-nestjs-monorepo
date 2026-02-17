import { VideoProcessingJob } from "@api/application/entities/video-processing-job";
import { FileManager } from "@file-manager";
import { Injectable, Logger } from "@nestjs/common";
import { VideoProcessor } from "@video-processor/application/video-processor/video-processor";

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

    const zipBuffer = await this.videoProcessor.process(
      fileUrl,
      request.videoProcessingJobId,
    );
    await this.fileManager.save(
      zipBuffer,
      `${request.videoProcessingJobId}.zip`,
    );

    await this.fileManager.deleteById(request.fileId);

    this.logger.log(`Frames zip size: ${zipBuffer.length} bytes`);
  }
}
