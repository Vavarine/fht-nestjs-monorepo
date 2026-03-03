import { Injectable, Logger } from "@nestjs/common";
import { NotificationService } from "@user-notifier/application/notification-service/notification-service";

export interface NotifyVideoStatusRequest {
  userId: string;
  videoProcessingJobId: string;
  status: string;
  fileName?: string;
}

@Injectable()
export class NotifyVideoStatus {
  private readonly logger = new Logger(NotifyVideoStatus.name);

  constructor(private readonly notificationService: NotificationService) {}

  async execute(request: NotifyVideoStatusRequest): Promise<void> {
    await this.notificationService.send(request);

    this.logger.log(
      `Notification sent to user ${request.userId} for job ${request.videoProcessingJobId} with status ${request.status}`,
    );
  }
}
