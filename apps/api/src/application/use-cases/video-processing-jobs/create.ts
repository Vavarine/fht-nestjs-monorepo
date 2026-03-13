import {
  VideoProcessingJob,
  VideoProcessingJobStatus,
} from "@api/application/entities/video-processing-job";
import { VideoProcessingPublisherJob } from "@api/application/publishers/video-processing.publisher";
import { VideoProcessingJobRepository } from "@api/application/repositories/video-processing-job";
import { Injectable, Logger } from "@nestjs/common";
import { FileManager } from "@file-manager";
import { generateRandomFileName } from "@file-manager/utils/generate-random-file-name";

interface CreateVideoProcessingJobRequest {
  buffer: Buffer<ArrayBufferLike>;
  originalFileName: string;
  mimeType: string;
  userId: string;
}

interface CreateVideoProcessingJobResponse {
  videoProcessingJob: VideoProcessingJob;
}

@Injectable()
export class CreateVideoProcessingJob {
  private readonly logger = new Logger(CreateVideoProcessingJob.name);

  constructor(
    private videoProcessingJobRepository: VideoProcessingJobRepository,
    private fileManager: FileManager,
    private VideoProcessingPublisherJob: VideoProcessingPublisherJob,
  ) {}

  async execute(
    request: CreateVideoProcessingJobRequest,
  ): Promise<CreateVideoProcessingJobResponse> {
    const { buffer, originalFileName } = request;

    const randomFileName = generateRandomFileName(originalFileName);

    const fileName = await this.fileManager.save(buffer, randomFileName);

    const videoProcessingJob = new VideoProcessingJob({
      status: VideoProcessingJobStatus.PENDING,
      videoFile: fileName,
      userId: request.userId,
    });

    const createdVideoProcessingJob =
      await this.videoProcessingJobRepository.create(videoProcessingJob);

    if (!createdVideoProcessingJob.videoFile) {
      throw new Error("Video file was not saved correctly");
    }

    this.logger.debug(
      `Created video processing job with ID: ${createdVideoProcessingJob.id} and video file: ${createdVideoProcessingJob.videoFile}`,
    );

    await this.VideoProcessingPublisherJob.publish(
      createdVideoProcessingJob.id,
      createdVideoProcessingJob.videoFile,
    );

    return { videoProcessingJob: createdVideoProcessingJob };
  }
}
