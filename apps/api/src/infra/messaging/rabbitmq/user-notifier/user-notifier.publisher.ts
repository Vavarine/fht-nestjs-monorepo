import { UserNotifierPublisher } from "@api/application/publishers/user-notifier.publisher";
import { VideoProcessingJobStatus } from "@api/application/entities/video-processing-job";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class RabbitMQUserNotifierPublisher implements UserNotifierPublisher {
  constructor(
    @Inject("USER_NOTIFIER_SERVICE") private readonly client: ClientProxy,
  ) {}

  async publish(
    userId: string,
    videoProcessingJobId: string,
    status: VideoProcessingJobStatus,
    fileName?: string,
  ): Promise<void> {
    this.client.emit("notify_video_status", {
      userId,
      videoProcessingJobId,
      status,
      fileName,
    });
  }
}
