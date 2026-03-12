import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService {
  private registry: promClient.Registry;
  
  // Video Processing Metrics
  readonly videoJobsProcessedTotal: promClient.Counter<string>;
  readonly videoJobsFailedTotal: promClient.Counter<string>;
  readonly videoProcessingDuration: promClient.Histogram<string>;
  readonly ffmpegExecutionDuration: promClient.Histogram<string>;
  readonly videoFileSizeProcessed: promClient.Histogram<string>;
  
  // System Metrics
  readonly activeProcessingJobs: promClient.Gauge<string>;
  readonly queueMessagesConsumed: promClient.Counter<string>;
  readonly memoryUsageDuringProcessing: promClient.Gauge<string>;

  constructor() {
    this.registry = new promClient.Registry();
    
    // Collect default metrics (CPU, memory, etc.)
    promClient.collectDefaultMetrics({ register: this.registry });

    // Video Processing metrics
    this.videoJobsProcessedTotal = new promClient.Counter({
      name: 'video_jobs_processed_total',
      help: 'Total number of video jobs processed successfully',
      labelNames: ['user_id', 'video_format'],
      registers: [this.registry],
    });

    this.videoJobsFailedTotal = new promClient.Counter({
      name: 'video_jobs_failed_total',
      help: 'Total number of video jobs that failed',
      labelNames: ['user_id', 'error_type', 'processing_stage'],
      registers: [this.registry],
    });

    this.videoProcessingDuration = new promClient.Histogram({
      name: 'video_processing_duration_seconds',
      help: 'Total time to process video in seconds',
      labelNames: ['user_id', 'video_format', 'video_duration_range'],
      buckets: [1, 5, 10, 30, 60, 300, 600, 1800], // 1s to 30min
      registers: [this.registry],
    });

    this.ffmpegExecutionDuration = new promClient.Histogram({
      name: 'ffmpeg_execution_duration_seconds',
      help: 'Time spent in FFmpeg processing',
      labelNames: ['video_format', 'output_format'],
      buckets: [0.5, 1, 5, 10, 30, 60, 120, 300], // 0.5s to 5min
      registers: [this.registry],
    });

    this.videoFileSizeProcessed = new promClient.Histogram({
      name: 'video_file_size_mb_processed',
      help: 'Size of video files processed in MB',
      labelNames: ['video_format'],
      buckets: [1, 5, 10, 20, 50, 100, 200, 500], // 1MB to 500MB
      registers: [this.registry],
    });

    // System metrics
    this.activeProcessingJobs = new promClient.Gauge({
      name: 'active_video_processing_jobs',
      help: 'Number of video processing jobs currently active',
      registers: [this.registry],
    });

    this.queueMessagesConsumed = new promClient.Counter({
      name: 'queue_messages_consumed_total',
      help: 'Total number of queue messages consumed',
      labelNames: ['queue_name', 'message_type'],
      registers: [this.registry],
    });

    this.memoryUsageDuringProcessing = new promClient.Gauge({
      name: 'memory_usage_during_processing_mb',
      help: 'Memory usage during video processing in MB',
      labelNames: ['job_id'],
      registers: [this.registry],
    });
  }

  // Method to get metrics for Prometheus scraping
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  // Helper method to record video job completion
  recordVideoJobProcessed(userId?: string, videoFormat?: string) {
    this.videoJobsProcessedTotal.inc({ 
      user_id: userId || 'unknown', 
      video_format: videoFormat || 'unknown' 
    });
  }

  // Helper method to record video job failure
  recordVideoJobFailed(userId?: string, errorType?: string, processingStage?: string) {
    this.videoJobsFailedTotal.inc({ 
      user_id: userId || 'unknown', 
      error_type: errorType || 'unknown',
      processing_stage: processingStage || 'unknown'
    });
  }

  // Helper method to record video processing time
  recordVideoProcessingDuration(duration: number, userId?: string, videoFormat?: string, videoDurationRange?: string) {
    this.videoProcessingDuration.observe(
      { 
        user_id: userId || 'unknown', 
        video_format: videoFormat || 'unknown',
        video_duration_range: videoDurationRange || 'unknown'
      }, 
      duration
    );
  }

  // Helper method to record FFmpeg execution time
  recordFFmpegDuration(duration: number, videoFormat?: string, outputFormat?: string) {
    this.ffmpegExecutionDuration.observe(
      { 
        video_format: videoFormat || 'unknown',
        output_format: outputFormat || 'unknown'
      }, 
      duration
    );
  }

  // Helper method to record processed file size
  recordVideoFileSize(sizeMb: number, videoFormat?: string) {
    this.videoFileSizeProcessed.observe(
      { 
        video_format: videoFormat || 'unknown'
      }, 
      sizeMb
    );
  }

  // Helper method to update active processing jobs
  setActiveProcessingJobs(count: number) {
    this.activeProcessingJobs.set(count);
  }

  // Helper method to record queue message consumption
  recordQueueMessageConsumed(queueName: string, messageType: string) {
    this.queueMessagesConsumed.inc({ queue_name: queueName, message_type: messageType });
  }

  // Helper method to update memory usage
  setMemoryUsage(jobId: string, memoryMb: number) {
    this.memoryUsageDuringProcessing.set({ job_id: jobId }, memoryMb);
  }

  // Helper method to clear memory usage for completed job
  clearMemoryUsage(jobId: string) {
    this.memoryUsageDuringProcessing.remove({ job_id: jobId });
  }
}