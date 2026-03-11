import { CreateVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/create";
import { ListVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/list";
import { UpdateVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/update";
import { MessagingModule } from "@api/infra/messaging/messaging.module";
import { FileManagerModule } from "@file-manager";
import { Module } from "@nestjs/common";
import { AppCacheModule } from "../cache/cache.module";
import { DatabaseModule } from "../database/database.module";
import { VideoProcessingJobsController } from "./controllers/video-processing-job.controller";

@Module({
  imports: [AppCacheModule, DatabaseModule, FileManagerModule, MessagingModule],
  controllers: [VideoProcessingJobsController],
  providers: [
    CreateVideoProcessingJob,
    UpdateVideoProcessingJob,
    ListVideoProcessingJob,
  ],
})
export class HttpModule {}
