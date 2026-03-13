import { Injectable, Logger } from "@nestjs/common";
import { NotificationService } from "@user-notifier/application/notification-service/notification-service";
import { CustomerGateway } from "@user-notifier/application/customer-gateway/customer-gateway";

export interface NotifyVideoStatusRequest {
  userId: string;
  videoProcessingJobId: string;
  status: string;
  fileName?: string;
}

@Injectable()
export class NotifyVideoStatus {
  private readonly logger = new Logger(NotifyVideoStatus.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly customerGateway: CustomerGateway,
  ) {}

  async execute(request: NotifyVideoStatusRequest): Promise<void> {
    const customer = await this.customerGateway.getById(request.userId);

    await this.notificationService.send({
      userId: request.userId,
      userEmail: customer.email,
      userName: customer.name,
      videoProcessingJobId: request.videoProcessingJobId,
      status: request.status,
      fileName: request.fileName,
    });

    this.logger.log(
      `Notification sent to user ${request.userId} for job ${request.videoProcessingJobId} with status ${request.status}`,
    );
  }
}
