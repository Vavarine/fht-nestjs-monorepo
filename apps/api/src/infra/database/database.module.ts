import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { VideoProcessingJobRepository } from '@api/application/repositories/video-processing-job';
import { PrismaVideoProcessingJobRepository } from './prisma/repositories/video-processing-job-repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: VideoProcessingJobRepository,
      useClass: PrismaVideoProcessingJobRepository,
    }
  ],
  exports: [VideoProcessingJobRepository, PrismaService]
})
export class DatabaseModule { }

