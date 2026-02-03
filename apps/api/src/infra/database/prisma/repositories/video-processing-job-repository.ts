import { VideoProcessingJob } from '@api/application/entities/video-processing-job';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { VideoProcessingJobRepository } from '@api/application/repositories/video-processing-job';
import { PrismaVideoProcessingJobMapper } from '../mappers/prisma-processing-job-mapper';

@Injectable()
export class PrismaVideoProcessingJobRepository implements VideoProcessingJobRepository {
  constructor(private prisma: PrismaService) {}

  async create(job: VideoProcessingJob) {
    const createdVideoProcessingJob = await this.prisma.videoProcessingJob.create({
      data: {
        videoFile: job.videoFile,
        status: job.status,
      }
    });

    return PrismaVideoProcessingJobMapper.toDomain(createdVideoProcessingJob);
  }

  async findById(id: string): Promise<VideoProcessingJob | null> {
    const videoProcessingJob = await this.prisma.videoProcessingJob.findUnique({
      where: {
        id,
      },
    });

    if (!videoProcessingJob) {
      return null;
    }

    return PrismaVideoProcessingJobMapper.toDomain(videoProcessingJob);
  }

  async updateStatus(id: string, status: string): Promise<VideoProcessingJob> {
    const updatedVideoProcessingJob = await this.prisma.videoProcessingJob.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return PrismaVideoProcessingJobMapper.toDomain(updatedVideoProcessingJob);
  }
}
