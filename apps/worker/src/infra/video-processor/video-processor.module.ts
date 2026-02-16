import { Module } from "@nestjs/common";
import { VideoProcessor } from "@worker/application/video-processor/video-processor";
import { ffmpegVideoProcessor } from "./ffmpeg/video-processor";

@Module({
  providers: [
    {
      provide: VideoProcessor,
      useClass: ffmpegVideoProcessor,
    },
  ],
  exports: [VideoProcessor],
})
export class VideoProcessorModule {}
