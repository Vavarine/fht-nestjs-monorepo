import { Injectable, Logger } from "@nestjs/common";
import {
  NotificationPayload,
  NotificationService,
} from "@user-notifier/application/notification-service/notification-service";

@Injectable()
export class ConsoleNotificationService implements NotificationService {
  private readonly logger = new Logger(ConsoleNotificationService.name);

  async send(payload: NotificationPayload): Promise<void> {
    const fileLabel = payload.fileName ? ` file ${payload.fileName}` : "";

    this.logger.log(
      `Notifying user ${payload.userId} with status ${payload.status} for job ${payload.videoProcessingJobId}${fileLabel}`,
    );
  }
}
