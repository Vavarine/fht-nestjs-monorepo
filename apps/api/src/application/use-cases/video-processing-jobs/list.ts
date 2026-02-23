import { VideoProcessingJob } from "@api/application/entities/video-processing-job";
import { VideoProcessingJobRepository } from "@api/application/repositories/video-processing-job";
import { Injectable } from "@nestjs/common";

interface ListVideoProcessingJobRequest {
  userId: string;
}

interface ListVideoProcessingJobResponse {
  videoProcessingJobs: VideoProcessingJob[];
}

@Injectable()
export class ListVideoProcessingJob {
  constructor(
    private videoProcessingJobRepository: VideoProcessingJobRepository,
  ) {}

  async execute(
    request: ListVideoProcessingJobRequest,
  ): Promise<ListVideoProcessingJobResponse> {
    const { userId } = request;
    const videoProcessingJobs =
      await this.videoProcessingJobRepository.findByUserId(userId);

    if (!videoProcessingJobs || videoProcessingJobs.length === 0) {
      throw new Error("No video processing jobs found for the given user ID");
    }

    return { videoProcessingJobs };
  }
}
