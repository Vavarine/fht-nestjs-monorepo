import { VideoProcessingJob } from "@api/application/entities/video-processing-job";
import { VideoProcessingJobRepository } from "@api/application/repositories/video-processing-job";

export class InMemoryVideoProcessingJobRepository extends VideoProcessingJobRepository {
  public items: VideoProcessingJob[] = [];

  async create(videoProcessingJob: VideoProcessingJob): Promise<VideoProcessingJob> {
    this.items.push(videoProcessingJob);
    return videoProcessingJob;
  }

  async update(videoProcessingJob: VideoProcessingJob): Promise<VideoProcessingJob> {
    const itemIndex = this.items.findIndex((item) => item.id === videoProcessingJob.id);

    if (itemIndex === -1) {
      throw new Error("Video processing job not found");
    }

    this.items[itemIndex] = videoProcessingJob;
    return videoProcessingJob;
  }

  async findById(id: string): Promise<VideoProcessingJob | null> {
    const videoProcessingJob = this.items.find((item) => item.id === id);
    return videoProcessingJob || null;
  }

  async findByUserId(userId: string): Promise<VideoProcessingJob[]> {
    return this.items.filter((item) => item.userId === userId);
  }
}
