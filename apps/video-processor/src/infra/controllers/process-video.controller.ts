import { Controller, Logger } from "@nestjs/common";
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
import { ProcessVideo } from "@video-processor/application/use-cases/video-processing-jobs/process-video";

@Controller()
export class ProcessVideoController {
  private readonly logger = new Logger(ProcessVideoController.name);
  private readonly requeueOnError =
    process.env.RABBITMQ_REQUEUE_ON_ERROR !== "false";

  constructor(private processVideo: ProcessVideo) {}

  @MessagePattern("process_video")
  async handleVideoProcessingJob(@Payload() data, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.processVideo.execute(data);

      this.logger.log(`Processed video job id: ${data.videoProcessingJobId}`);

      channel.ack(originalMsg);
      return data;
    } catch (error) {
      this.logger.error(
        `Error processing video job id: ${data.videoProcessingJobId}`,
        error instanceof Error ? error.stack : String(error),
      );

      channel.nack(originalMsg, false, this.requeueOnError);
    }
  }
}
