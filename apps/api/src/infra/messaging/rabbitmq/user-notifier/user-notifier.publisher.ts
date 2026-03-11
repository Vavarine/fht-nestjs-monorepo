import { UserNotifierPublisher } from "@api/application/publishers/user-notifier.publisher";
import { VideoProcessingJobStatus } from "@api/application/entities/video-processing-job";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class RabbitMQUserNotifierPublisher implements UserNotifierPublisher, OnModuleInit {
  constructor(
    @Inject("USER_NOTIFIER_SERVICE") private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.client.connect();
  }

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
