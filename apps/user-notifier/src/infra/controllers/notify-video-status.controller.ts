import { Controller, Logger } from "@nestjs/common";
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
import { NotifyVideoStatus } from "@user-notifier/application/use-cases/notifications/notify-video-status";

@Controller()
export class NotifyVideoStatusController {
  private readonly logger = new Logger(NotifyVideoStatusController.name);
  private readonly requeueOnError =
    process.env.RABBITMQ_REQUEUE_ON_ERROR !== "false";

  constructor(private readonly notifyVideoStatus: NotifyVideoStatus) {}

  @MessagePattern("notify_video_status")
  async handleNotification(@Payload() data, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.notifyVideoStatus.execute(data);
      channel.ack(originalMsg);
      return data;
    } catch (error) {
      this.logger.error(
        `Error sending notification for job id: ${data.videoProcessingJobId}`,
        error instanceof Error ? error.stack : String(error),
      );

      channel.nack(originalMsg, false, this.requeueOnError);
    }
  }
}
