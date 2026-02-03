import { Module } from '@nestjs/common';
import { FileManagerModule } from '@file-manager';
import { MessagingModule } from '@worker/infra/messaging/messaging.module';
import { ProcessingJobsController } from '@worker/infra/controllers/video-processing-job.controller';

@Module({
   imports: [
      FileManagerModule,
      MessagingModule
    ],
    controllers: [
      ProcessingJobsController
    ],
    providers: [
    ],
})
export class AppModule { }
