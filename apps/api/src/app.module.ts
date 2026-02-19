import { Module } from "@nestjs/common";
import { HttpModule } from "@api/infra/http/http.module";
import { MessagingModule } from "./infra/messaging/messaging.module";

@Module({
  imports: [HttpModule, MessagingModule],
})
export class AppModule {}
