import { Controller, Logger } from "@nestjs/common";
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
import { ProcessVideo } from "@worker/application/use-cases/video-processing-jobs/process-video";

@Controller()
export class ProcessVideoController {
  private readonly logger = new Logger(ProcessVideoController.name);

  constructor(private processVideo: ProcessVideo) {}

  @MessagePattern("process_video")
  async handleVideoProcessingJob(@Payload() data, @Ctx() context: RmqContext) {
    try {
      await this.processVideo.execute(data);

      this.logger.log(`Processed video job id: ${data.videoProcessingJobId}`);

      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();

      channel.ack(originalMsg);
      return data;
    } catch (error) {
      this.logger.log(
        `Error processing video job id: ${data.videoProcessingJobId}, error: ${error}`,
      );
    }
  }
}
