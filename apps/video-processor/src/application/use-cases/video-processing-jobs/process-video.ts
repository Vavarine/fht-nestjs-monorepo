import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from "@api/application/entities/video-processing-job";
import { FileManager } from "@file-manager";
import { Injectable, Logger } from "@nestjs/common";
import { VideoProcessingPublisherJob } from "@video-processor/application/publishers/video-processing.publisher";
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
    private videoProcessingPublisherJob: VideoProcessingPublisherJob,
  ) {}

  async execute(request: ProcessVideoRequest): Promise<any> {
    try {
      this.videoProcessingPublisherJob.publish(
        VideoProcessingJobStatus.PROCESSING,
        request.videoProcessingJobId,
      );

      const fileUrl = await this.fileManager.getFileUrl(
        request.fileId,
        process.env.FS_ENDPOINT_URL_PUBLIC || "http://localhost:9000",
      );

      const zipBuffer = await this.videoProcessor.process(
        fileUrl,
        request.videoProcessingJobId,
      );

      const fileName = `${request.videoProcessingJobId}.zip`;

      await this.fileManager.save(zipBuffer, fileName);

      this.videoProcessingPublisherJob.publish(
        VideoProcessingJobStatus.COMPLETED,
        request.videoProcessingJobId,
        fileName,
      );

      await this.fileManager.deleteById(request.fileId);

      this.logger.log(`Frames zip size: ${zipBuffer.length} bytes`);
    } catch (error) {
      this.logger.error("Error processing video:", error);
      this.videoProcessingPublisherJob.publish(
        VideoProcessingJobStatus.FAILED,
        request.videoProcessingJobId,
      );
    }
  }
}
