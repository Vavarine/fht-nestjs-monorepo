import { Module } from "@nestjs/common";
import { RabbitmqService } from "./rabbitmq/rabbitmq.service";

@Module({
  imports: [RabbitmqService],
  exports: [RabbitmqService],
})
export class MessagingModule {}
