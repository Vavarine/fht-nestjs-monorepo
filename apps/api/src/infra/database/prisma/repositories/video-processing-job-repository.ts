import { VideoProcessingJob } from "@api/application/entities/video-processing-job";
import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { VideoProcessingJobRepository } from "@api/application/repositories/video-processing-job";
import { PrismaVideoProcessingJobMapper } from "../mappers/prisma-processing-job-mapper";

@Injectable()
export class PrismaVideoProcessingJobRepository implements VideoProcessingJobRepository {
  constructor(private prisma: PrismaService) {}

  async create(job: VideoProcessingJob) {
    const createdVideoProcessingJob =
      await this.prisma.videoProcessingJob.create({
        data: {
          videoFile: job.videoFile,
          status: job.status,
          userId: job.userId,
        },
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

  async update(job: VideoProcessingJob): Promise<VideoProcessingJob> {
    const updatedVideoProcessingJob =
      await this.prisma.videoProcessingJob.update({
        where: {
          id: job.id,
        },
        data: {
          status: job.status,
          processedFile: job.processedFile,
        },
      });
    return PrismaVideoProcessingJobMapper.toDomain(updatedVideoProcessingJob);
  }

  async findByUserId(userId: string): Promise<VideoProcessingJob[]> {
    const videoProcessingJobs = await this.prisma.videoProcessingJob.findMany({
      where: {
        userId,
      },
    });

    console.log(videoProcessingJobs);

    return videoProcessingJobs.map((job) =>
      PrismaVideoProcessingJobMapper.toDomain(job),
    );
  }
}
