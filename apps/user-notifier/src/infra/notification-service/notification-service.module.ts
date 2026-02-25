import { Module } from "@nestjs/common";
import { NotificationService } from "@user-notifier/application/notification-service/notification-service";
import { ConsoleNotificationService } from "./console/notification-service";

@Module({
  providers: [
    {
      provide: NotificationService,
      useClass: ConsoleNotificationService,
    },
  ],
  exports: [NotificationService],
})
export class NotificationServiceModule {}
