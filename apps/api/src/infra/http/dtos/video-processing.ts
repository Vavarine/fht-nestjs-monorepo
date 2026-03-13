import { IsEnum, IsNotEmpty, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { VideoProcessingJob } from "@api/application/entities/video-processing-job";

export class CreateVideoProcessingJobDTO {
  @ApiProperty({ type: "string", format: "binary", required: true })
  file: Express.Multer.File;
}

export class VideoProcessingJobResponse {
  @ApiProperty({ example: "uuid-v4-id" })
  id: string;

  @ApiProperty({ example: "processed-file-url" })
  processedFile: string | undefined;

  @ApiProperty({
    example: VideoProcessingJob.Status.PENDING,
    enum: VideoProcessingJob.Status,
  })
  @IsEnum(VideoProcessingJob.Status)
  status: string;
}
