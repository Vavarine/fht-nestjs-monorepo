import { VideoProcessingJob } from "@api/application/entities/video-processing-job";

export abstract class VideoProcessingJobRepository {
    abstract create(videoProcessingJob: VideoProcessingJob): Promise<VideoProcessingJob>;
    abstract updateStatus(id: string, status: string): Promise<VideoProcessingJob>;
    abstract findById(id: string): Promise<VideoProcessingJob | null>;
  }