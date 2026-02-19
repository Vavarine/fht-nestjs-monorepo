import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from "@api/application/entities/video-processing-job";
import { VideoProcessingJobRepository } from "@api/application/repositories/video-processing-job";
import { Injectable } from "@nestjs/common";

interface UpdateVideoProcessingJobRequest {
  videoProcessingJobId: string;
  status: VideoProcessingJobStatus;
  fileName: string;
}

interface UpdateVideoProcessingJobResponse {
  videoProcessingJob: VideoProcessingJob;
}

@Injectable()
export class UpdateVideoProcessingJob {
  constructor(
    private videoProcessingJobRepository: VideoProcessingJobRepository,
  ) {}

  async execute(
    request: UpdateVideoProcessingJobRequest,
  ): Promise<UpdateVideoProcessingJobResponse> {
    const { videoProcessingJobId, status, fileName } = request;
    const videoProcessingJob =
      await this.videoProcessingJobRepository.findById(videoProcessingJobId);

    if (!videoProcessingJob) {
      throw new Error("Video processing job not found");
    }

    videoProcessingJob.status = status;
    videoProcessingJob.processedFile = fileName;

    const updatedVideoProcessingJob =
      await this.videoProcessingJobRepository.update(videoProcessingJob);

    return { videoProcessingJob: updatedVideoProcessingJob };
  }
}
