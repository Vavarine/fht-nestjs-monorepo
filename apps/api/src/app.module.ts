import { Module } from "@nestjs/common";
import { HttpModule } from "@api/infra/http/http.module";
import { MessagingModule } from "./infra/messaging/messaging.module";
import { MetricsModule } from "./infra/metrics/metrics.module";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { MetricsInterceptor } from "./infra/metrics/metrics.interceptor";

@Module({
  imports: [HttpModule, MessagingModule, MetricsModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
