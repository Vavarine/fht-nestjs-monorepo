import { Module } from "@nestjs/common";
import { MessagingModule } from "@user-notifier/infra/messaging/messaging.module";
import { NotificationServiceModule } from "@user-notifier/infra/notification-service/notification-service.module";
import { CustomerGatewayModule } from "@user-notifier/infra/customer-gateway/customer-gateway.module";
import { NotifyVideoStatusController } from "@user-notifier/infra/controllers/notify-video-status.controller";
import { NotifyVideoStatus } from "@user-notifier/application/use-cases/notifications/notify-video-status";
import { MetricsModule } from "@user-notifier/infra/metrics/metrics.module";

@Module({
  imports: [
    MessagingModule,
    NotificationServiceModule,
    MetricsModule,
    CustomerGatewayModule,
  ],
  controllers: [NotifyVideoStatusController],
  providers: [NotifyVideoStatus],
})
export class AppModule {}
