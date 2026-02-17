import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from "@api/application/entities/video-processing-job";
import { VideoProcessingPublisherJob } from "@api/application/publishers/video-processing.publisher";
import { VideoProcessingJobRepository } from "@api/application/repositories/video-processing-job";
import { Injectable } from "@nestjs/common";
import { FileManager } from "@file-manager";
import { create } from "domain";

interface CreateVideoProcessingJobRequest {
  buffer: Buffer<ArrayBufferLike>;
  originalFileName: string;
  mimeType: string;
}

interface CreateVideoProcessingJobResponse {
  videoProcessingJob: VideoProcessingJob;
}

@Injectable()
export class CreateVideoProcessingJob {
  constructor(
    private videoProcessingJobRepository: VideoProcessingJobRepository,
    private fileManager: FileManager,
    private VideoProcessingPublisherJob: VideoProcessingPublisherJob,
  ) {}

  async execute(
    request: CreateVideoProcessingJobRequest,
  ): Promise<CreateVideoProcessingJobResponse> {
    const { buffer, originalFileName } = request;
    const fileName = await this.fileManager.save(buffer, originalFileName);

    const videoProcessingJob = new VideoProcessingJob({
      status: VideoProcessingJobStatus.PENDING,
      videoFile: fileName,
    });

    const createdVideoProcessingJob =
      await this.videoProcessingJobRepository.create(videoProcessingJob);

    if (!createdVideoProcessingJob.videoFile) {
      throw new Error("Video file was not saved correctly");
    }

    await this.VideoProcessingPublisherJob.publish(
      createdVideoProcessingJob.id,
      createdVideoProcessingJob.videoFile,
    );

    return { videoProcessingJob: createdVideoProcessingJob };
  }
}
