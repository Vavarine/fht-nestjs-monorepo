import { Controller, Logger } from "@nestjs/common";
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
import { NotifyVideoStatus } from "@user-notifier/application/use-cases/notifications/notify-video-status";
import { MetricsService } from "@user-notifier/infra/metrics/metrics.service";

@Controller()
export class NotifyVideoStatusController {
  private readonly logger = new Logger(NotifyVideoStatusController.name);
  private readonly requeueOnError =
    process.env.RABBITMQ_REQUEUE_ON_ERROR !== "false";

  constructor(
    private readonly notifyVideoStatus: NotifyVideoStatus,
    private readonly metricsService: MetricsService,
  ) {}

  @MessagePattern("notify_video_status")
  async handleNotification(@Payload() data, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    // Record notification received
    this.metricsService.recordNotificationReceived(data.status);

    // Start timer
    const endTimer = this.metricsService.startNotificationTimer();

    try {
      await this.notifyVideoStatus.execute(data);
      
      // Record success metrics
      endTimer({ status: data.status });
      this.metricsService.recordNotificationSent(data.userId, data.status);
      
      channel.ack(originalMsg);
      return data;
    } catch (error) {
      // Record failure metrics
      endTimer({ status: data.status });
      const errorType = error instanceof Error ? error.name : 'UnknownError';
      this.metricsService.recordNotificationFailed(data.userId, data.status, errorType);
      
      this.logger.error(
        `Error sending notification for job id: ${data.videoProcessingJobId}`,
        error instanceof Error ? error.stack : String(error),
      );

      channel.nack(originalMsg, false, this.requeueOnError);
    }
  }
}
