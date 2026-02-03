import { Controller, Logger } from '@nestjs/common'
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class ProcessingJobsController {
  private readonly logger = new Logger(ProcessingJobsController.name);

  @MessagePattern('process_video')
  async handleVideoProcessingJob(@Payload() data, @Ctx() context: RmqContext) {
    try {
      this.logger.log(`data: ${JSON.stringify(data)}`);

      await new Promise((resolve) => setTimeout(resolve, 5000));

      this.logger.log(`Processed video job id: ${data.videoProcessingJobId}`);

      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();

      channel.ack(originalMsg);
      return data;
    } catch (error) {
      this.logger.log(`Error > handleVideoProcessingJob error: ${error}`);
    }
  }
}