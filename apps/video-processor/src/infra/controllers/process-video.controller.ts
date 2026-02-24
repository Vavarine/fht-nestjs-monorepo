import { Controller, Logger } from "@nestjs/common";
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
import { ProcessVideo } from "@video-processor/application/use-cases/video-processing-jobs/process-video";
import { MetricsService } from "../metrics/metrics.service";

@Controller()
export class ProcessVideoController {
  private readonly logger = new Logger(ProcessVideoController.name);
  private readonly requeueOnError =
    process.env.RABBITMQ_REQUEUE_ON_ERROR !== "false";

  constructor(
    private processVideo: ProcessVideo, 
    private metricsService: MetricsService,
  ) {}

  @MessagePattern("process_video")
  async handleVideoProcessingJob(@Payload() data, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const startTime = Date.now();
    const jobId = data.videoProcessingJobId;

    // Record queue message consumption
    this.metricsService.recordQueueMessageConsumed('video_processing', 'process_video');

    // Update active job count (increment)
    const currentActiveJobs = await this.getCurrentActiveJobsCount();
    this.metricsService.setActiveProcessingJobs(currentActiveJobs + 1);

    try {
      // Monitor memory usage
      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      this.metricsService.setMemoryUsage(jobId, initialMemory);

      await this.processVideo.execute(data);

      // Calculate processing duration
      const duration = (Date.now() - startTime) / 1000; // seconds
      
      // Record metrics for successful processing
      this.metricsService.recordVideoJobProcessed(data.userId, data.videoFormat);
      this.metricsService.recordVideoProcessingDuration(
        duration, 
        data.userId, 
        data.videoFormat,
        this.getVideoDurationRange(data.videoDuration)
      );

      if (data.fileSizeMb) {
        this.metricsService.recordVideoFileSize(data.fileSizeMb, data.videoFormat);
      }

      this.logger.log(`Processed video job id: ${jobId} in ${duration}s`);

      channel.ack(originalMsg);
      return data;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000; // seconds
      const errorType = error instanceof Error ? error.name : 'unknown_error';
      const processingStage = this.getProcessingStageFromError(error);

      // Record failure metrics
      this.metricsService.recordVideoJobFailed(data.userId, errorType, processingStage);

      this.logger.error(
        `Error processing video job id: ${jobId} after ${duration}s`,
        error instanceof Error ? error.stack : String(error),
      );

      channel.nack(originalMsg, false, this.requeueOnError);
    } finally {
      // Clean up metrics and update active jobs count
      this.metricsService.clearMemoryUsage(jobId);
      const finalActiveJobs = await this.getCurrentActiveJobsCount();
      this.metricsService.setActiveProcessingJobs(Math.max(0, finalActiveJobs - 1));
    }
  }

  private async getCurrentActiveJobsCount(): Promise<number> {
    // This is a placeholder - in a real implementation you might track this
    // via a shared state store or query the actual job processor
    return 0; // TODO: Implement proper active jobs counting
  }

  private getVideoDurationRange(durationSeconds?: number): string {
    if (!durationSeconds) return 'unknown';
    
    if (durationSeconds < 30) return 'short'; // < 30 seconds
    if (durationSeconds < 300) return 'medium'; // 5 minutes
    if (durationSeconds < 1800) return 'long'; // 30 minutes
    return 'very_long'; // > 30 minutes
  }

  private getProcessingStageFromError(error: any): string {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('ffmpeg')) return 'video_processing';
    if (errorMessage.includes('file') || errorMessage.includes('read')) return 'file_handling';
    if (errorMessage.includes('upload') || errorMessage.includes('storage')) return 'storage';
    if (errorMessage.includes('network') || errorMessage.includes('connection')) return 'network';
    
    return 'unknown';
  }
}
