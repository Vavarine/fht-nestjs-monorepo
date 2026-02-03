import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CreateVideoProcessingJob } from '@api/application/use-cases/video-processing-jobs/create';
import { VideoProcessingJobsController } from './controllers/video-processing-job.controller';
import { MessagingModule } from '@api/infra/messaging/messaging.module';
import { FileManagerModule } from '@file-manager';
  
@Module({
  imports: [
    DatabaseModule,
    FileManagerModule,
    MessagingModule
  ],
  controllers: [
    VideoProcessingJobsController
  ],
  providers: [
    CreateVideoProcessingJob
  ],
})
export class HttpModule {}
