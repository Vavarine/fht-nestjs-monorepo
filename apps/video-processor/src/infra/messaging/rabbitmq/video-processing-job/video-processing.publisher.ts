import { VideoProcessingPublisherJob } from "@video-processor/application/publishers/video-processing.publisher";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class RabbitMQVideoProcessingPublisherJob implements VideoProcessingPublisherJob {
  constructor(
    @Inject("VIDEO_PROCESSING_SERVICE") private readonly client: ClientProxy,
  ) {}

  async publish(
    status: string,
    videoProcessingJobId: string,
    fileName: string,
  ): Promise<void> {
    try {
      this.client.emit("change_video_status", {
        status,
        videoProcessingJobId,
        fileName,
      });
    } catch (error) {
      console.error("Error submitting video processing job:", error);

      throw error;
    }
  }
}
