import { FileManager } from "@file-manager";
import { CreateVideoProcessingJob } from "@api/application/use-cases/video-processing-jobs/create";
import {
  Body,
  Controller,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
  Get,
  Req,
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

@Controller("video-processing-jobs")
@ApiBearerAuth("jwt")
export class VideoProcessingJobsController {
  private readonly logger = new Logger(VideoProcessingJobsController.name);

  constructor(
    private createVideoProcessingJob: CreateVideoProcessingJob,
    private updateVideoProcessingJob: UpdateVideoProcessingJob,
    private listVideoProcessingJob: ListVideoProcessingJob,
    private fileManager: FileManager,
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
    @Body() body: CreateVideoProcessingJobDTO,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
          new FileTypeValidator({ fileType: "video/*" }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const { buffer, originalname, mimetype } = file;

    const response = await this.createVideoProcessingJob.execute({
      buffer,
      originalFileName: originalname,
      mimeType: mimetype,
      userId: req["customerId"],
    });

    return VideoProcessingView.toHTTP(
      response.videoProcessingJob,
      this.fileManager,
    );
  }

  @ApiOperation({
    summary: "Lista videos de um usuario",
    description: "Lista os videos de um usuario",
  })
  @Get("")
  async list(@Req() req: Request) {
    this.logger.log(
      `Listing video processing jobs for user: ${req["customerId"]}`,
    );
    try {
      const response = await this.listVideoProcessingJob.execute({
        userId: req["customerId"],
      });

      return Promise.allSettled(
        response.videoProcessingJobs.map((job) =>
          VideoProcessingView.toHTTP(job, this.fileManager),
        ),
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
      "change status message received for job 11111 id: " +
        data.videoProcessingJobId,
    );

    this.updateVideoProcessingJob.execute({
      videoProcessingJobId: data.videoProcessingJobId,
      status: data.status,
      fileName: data.fileName,
    });

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
