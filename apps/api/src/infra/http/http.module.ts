import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { CreateVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/create";
import { VideoProcessingJobsController } from "./controllers/video-processing-job.controller";
import { MessagingModule } from "@api/infra/messaging/messaging.module";
import { FileManagerModule } from "@file-manager";
import { UpdateVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/update";
import { ListVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/list";
import { AuthModule, AuthService } from "@auth";
import { CognitoAuthService } from "@auth/infra/cognito/cognito-auth.service";

@Module({
  imports: [DatabaseModule, FileManagerModule, MessagingModule, AuthModule],
  controllers: [VideoProcessingJobsController],
  providers: [
    CreateVideoProcessingJob,
    UpdateVideoProcessingJob,
    ListVideoProcessingJob,
    { provide: AuthService, useClass: CognitoAuthService },
  ],
})
export class HttpModule {}
