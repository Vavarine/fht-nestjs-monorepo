import { VideoProcessingJob } from "@api/application/entities/video-processing-job";
import { VideoProcessingJobCreateInput, VideoProcessingJobModel } from "../../../../../generated/prisma/models";

export class PrismaVideoProcessingJobMapper {
  static toDomain(raw: VideoProcessingJobModel): VideoProcessingJob {
    return new VideoProcessingJob({
      videoFile: raw.videoFile,
      status: raw.status as VideoProcessingJob["status"],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }, raw.id);
  }
}