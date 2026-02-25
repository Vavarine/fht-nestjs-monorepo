import { UserNotifierPublisher } from "@api/application/publishers/user-notifier.publisher";
import { VideoProcessingPublisherJob } from "@api/application/publishers/video-processing.publisher";
import { Module } from "@nestjs/common";
import { RabbitMQUserNotifierPublisher } from "./rabbitmq/user-notifier/user-notifier.publisher";
import { RabbitMQVideoProcessingPublisherJob } from "./rabbitmq/video-processing-job/video-processing.publisher";
import { RabbitmqService } from "./rabbitmq/rabbitmq.service";

@Module({
  imports: [RabbitmqService],
  providers: [
    {
      provide: VideoProcessingPublisherJob,
      useClass: RabbitMQVideoProcessingPublisherJob,
    },
    {
      provide: UserNotifierPublisher,
      useClass: RabbitMQUserNotifierPublisher,
    },
  ],
  exports: [VideoProcessingPublisherJob, UserNotifierPublisher, RabbitmqService],
})
export class MessagingModule {}
