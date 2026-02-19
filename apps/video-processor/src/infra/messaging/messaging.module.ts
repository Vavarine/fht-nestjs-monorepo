import { VideoProcessingPublisherJob } from "@video-processor/application/publishers/video-processing.publisher";
import { Module } from "@nestjs/common";
import { RabbitMQVideoProcessingPublisherJob } from "./rabbitmq/video-processing-job/video-processing.publisher";
import { RabbitmqService } from "./rabbitmq/rabbitmq.service";

@Module({
  imports: [RabbitmqService],
  providers: [
    {
      provide: VideoProcessingPublisherJob,
      useClass: RabbitMQVideoProcessingPublisherJob,
    },
  ],
  exports: [VideoProcessingPublisherJob, RabbitmqService],
})
export class MessagingModule {}
