import { VideoProcessingJob } from "@api/application/entities/video-processing-job";
import { VideoProcessingJobModel } from "@api/prisma/models";

export class PrismaVideoProcessingJobMapper {
  static toDomain(raw: VideoProcessingJobModel): VideoProcessingJob {
    return new VideoProcessingJob(
      {
        videoFile: raw.videoFile,
        processedFile: raw.processedFile ?? undefined,
        status: raw.status as VideoProcessingJob["status"],
        userId: raw.userId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }
}
