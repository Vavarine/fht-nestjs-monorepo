import { FileManager } from "@file-manager";
import { CreateVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/create";
import {
  Body,
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
  Get,
  Req,
  Inject,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from "@nestjs/swagger";
import { CreateVideoProcessingJobDTO } from "../dtos/video-processing";
import { VideoProcessingView } from "../view-models/video-process-view-module";
import { Ctx, MessagePattern, Payload } from "@nestjs/microservices";
import { UpdateVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/update";
import { ListVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/list";
import { MetricsService } from "../../metrics/metrics.service";
import { VideoFileTypeValidator } from "../validators/video-file-type.validator";
import { CACHE_MANAGER, CacheInterceptor } from "@nestjs/cache-manager";

@Controller("video-processing-jobs")
@ApiBearerAuth("jwt")
export class VideoProcessingJobsController {
  private readonly logger = new Logger(VideoProcessingJobsController.name);

  constructor(
    private createVideoProcessingJob: CreateVideoProcessingJob,
    private updateVideoProcessingJob: UpdateVideoProcessingJob,
    private listVideoProcessingJob: ListVideoProcessingJob,
    private fileManager: FileManager,
    private metricsService: MetricsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @ApiOperation({
    summary: "Adicionar video a fila de processamento",
    description:
      "Adiciona um video a fila de processamento para ser processado.",
  })
  @Post("")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  async create(
    @Req() req: Request,
    @Body() _body: CreateVideoProcessingJobDTO,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
          new VideoFileTypeValidator({ fileType: /^video\// }), // Aceita qualquer tipo de video (video/mp4, video/avi, etc.)
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const { buffer, originalname, mimetype } = file;
    const fileSizeMb = buffer.length / (1024 * 1024); // Convert to MB
    const userId = req["customerId"]; // TODO: Get from JWT token

    // Record upload attempt
    this.metricsService.recordVideoUploadAttempt(userId);

    try {
      const response = await this.createVideoProcessingJob.execute({
        buffer,
        originalFileName: originalname,
        mimeType: mimetype,
        userId,
      });

      // Record successful upload and job creation
      this.metricsService.recordVideoUploadSuccess(userId);
      this.metricsService.recordVideoJobCreated(userId);

      return VideoProcessingView.toHTTP(
        response.videoProcessingJob,
        this.fileManager,
      );
    } catch (error) {
      this.logger.error("Error creating video processing job:", error);
      const errorType = error instanceof Error ? error.name : "creation_error";
      this.metricsService.recordVideoJobFailed(userId, errorType);
      throw error;
    }
  }

  @ApiOperation({
    summary: "Lista videos de um usuario",
    description: "Lista os videos de um usuario",
  })
  @Get("")
  @UseInterceptors(CacheInterceptor)
  async list(@Req() req: Request) {
    try {
      const response = await this.listVideoProcessingJob.execute({
        userId: req["customerId"],
      });

      return Promise.allSettled(
        response.videoProcessingJobs.map((job) => {
          this.logger.log(
            `Processing job ID: ${job.id} with status: ${job.status} and processed file: ${job.processedFile} `,
          );
          return VideoProcessingView.toHTTP(job, this.fileManager);
        }),
      ).then((results) =>
        results.filter((r) => r.status === "fulfilled").map((r) => r.value),
      );
    } catch (error) {
      this.logger.error("Error listing video processing jobs:", error);
      throw error;
    }
  }

  @MessagePattern("change_video_status")
  async status(@Payload() data, @Ctx() context) {
    this.logger.log(
      "change status message received for job id: " + data.videoProcessingJobId,
    );

    try {
      await this.updateVideoProcessingJob.execute({
        videoProcessingJobId: data.videoProcessingJobId,
        status: data.status,
        fileName: data.fileName,
      });

      // Record metrics based on status
      const userId = data.userId || "unknown";
      if (data.status === "completed") {
        this.metricsService.recordVideoJobProcessed(userId);

        // If processing time is available, record it
        if (data.processingDuration) {
          this.metricsService.recordVideoProcessingDuration(
            data.processingDuration,
            userId,
            data.videoSizeMb,
          );
        }
      } else if (data.status === "failed") {
        this.metricsService.recordVideoJobFailed(
          userId,
          data.errorType || "processing_error",
        );
      }

      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error("Error updating video processing job status:", error);
      throw error;
    }
  }
}
