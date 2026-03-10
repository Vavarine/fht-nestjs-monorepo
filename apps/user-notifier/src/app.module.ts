import { Module } from "@nestjs/common";
import { MessagingModule } from "@user-notifier/infra/messaging/messaging.module";
import { NotificationServiceModule } from "@user-notifier/infra/notification-service/notification-service.module";
import { CustomerGatewayModule } from "@user-notifier/infra/customer-gateway/customer-gateway.module";
import { NotifyVideoStatusController } from "@user-notifier/infra/controllers/notify-video-status.controller";
import { NotifyVideoStatus } from "@user-notifier/application/use-cases/notifications/notify-video-status";

@Module({
  imports: [MessagingModule, NotificationServiceModule, CustomerGatewayModule],
  controllers: [NotifyVideoStatusController],
  providers: [NotifyVideoStatus],
})
export class AppModule {}
