import { FileManager } from '@file-manager';
import { CreateVideoProcessingJob } from '@api/application/use-cases/video-processing-jobs/create';
import {
  Body,
  Controller,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateVideoProcessingJobDTO } from '../dtos/video-processing';
import { VideoProcessingView } from '../view-models/video-process-view-module';

@Controller('video-processing-jobs')
@ApiBearerAuth('jwt')
export class VideoProcessingJobsController {
  constructor(
    private createVideoProcessingJob: CreateVideoProcessingJob,
    private fileManager: FileManager,
  ) { }

  @ApiOperation({
    summary: 'Adicionar video a fila de processamento',
    description:
      'Adiciona um video a fila de processamento para ser processado.',
  })

  @Post('')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() body: CreateVideoProcessingJobDTO,
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
        new FileTypeValidator({ fileType: "video/*" })
      ],
    })) file: Express.Multer.File,
  ) {
    const { buffer, originalname, mimetype } = file;

    const response = await this.createVideoProcessingJob.execute({
      buffer,
      originalFileName: originalname,
      mimeType: mimetype,
    });

    return VideoProcessingView.toHTTP(response.videoProcessingJob, this.fileManager);
  }
}
