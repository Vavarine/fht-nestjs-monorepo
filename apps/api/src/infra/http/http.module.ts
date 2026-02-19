import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { CreateVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/create";
import { VideoProcessingJobsController } from "./controllers/video-processing-job.controller";
import { MessagingModule } from "@api/infra/messaging/messaging.module";
import { FileManagerModule } from "@file-manager";
import { UpdateVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/update";

@Module({
  imports: [DatabaseModule, FileManagerModule, MessagingModule],
  controllers: [VideoProcessingJobsController],
  providers: [CreateVideoProcessingJob, UpdateVideoProcessingJob],
})
export class HttpModule {}
