import { VideoProcessingPublisherJob } from "@api/application/publishers/video-processing.publisher";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQVideoProcessingPublisherJob implements VideoProcessingPublisherJob {
  constructor(@Inject('VIDEO_PROCESSING_SERVICE') private readonly client: ClientProxy) {}

  async publish(videoProcessingJobId: string, fileId: string): Promise<void> {
    try {
      this.client.emit('process_video', { videoProcessingJobId, fileId });
    } catch (error) {
      console.error('Error submitting video processing job:', error);
      
      throw error;
    }
  }
}