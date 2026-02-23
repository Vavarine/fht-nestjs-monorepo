import { Module } from "@nestjs/common";
import { FileManagerModule } from "@file-manager";
import { MessagingModule } from "@video-processor/infra/messaging/messaging.module";
import { ProcessVideoController } from "@video-processor/infra/controllers/process-video.controller";
import { ProcessVideo } from "./application/use-cases/video-processing-jobs/process-video";
import { VideoProcessorModule } from "./infra/video-processor/video-processor.module";

@Module({
  imports: [FileManagerModule, MessagingModule, VideoProcessorModule],
  controllers: [ProcessVideoController],
  providers: [ProcessVideo],
})
export class AppModule {}
