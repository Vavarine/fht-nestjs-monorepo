import { CreateVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/create";
import { ListVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/list";
import { UpdateVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/update";
import { MessagingModule } from "@api/infra/messaging/messaging.module";
import { FileManagerModule } from "@file-manager";
import { AuthModule, AuthService } from "@auth";
import { CognitoAuthService } from "@auth/infra/cognito/cognito-auth.service";

import { Module } from "@nestjs/common";
import { AppCacheModule } from "../cache/cache.module";
import { DatabaseModule } from "../database/database.module";
import { VideoProcessingJobsController } from "./controllers/video-processing-job.controller";

@Module({
  imports: [
    AppCacheModule,
    DatabaseModule,
    FileManagerModule,
    MessagingModule,
    AuthModule,
  ],
  controllers: [VideoProcessingJobsController],
  providers: [
    CreateVideoProcessingJob,
    UpdateVideoProcessingJob,
    ListVideoProcessingJob,
    { provide: AuthService, useClass: CognitoAuthService },
  ],
})
export class HttpModule {}
