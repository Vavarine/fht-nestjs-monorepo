import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService {
  private registry: promClient.Registry;
  
  // API Metrics
  readonly httpRequestsTotal: promClient.Counter<string>;
  readonly httpRequestDuration: promClient.Histogram<string>;
  
  // Video Processing Metrics
  readonly videoJobsCreatedTotal: promClient.Counter<string>;
  readonly videoJobsProcessedTotal: promClient.Counter<string>;
  readonly videoJobsFailedTotal: promClient.Counter<string>;
  readonly videoProcessingDuration: promClient.Histogram<string>;
  readonly videoUploadsTotal: promClient.Counter<string>;
  readonly videoUploadsSuccessful: promClient.Counter<string>;
  
  // System Metrics
  readonly activeConnections: promClient.Gauge<string>;
  readonly queueSize: promClient.Gauge<string>;

  constructor() {
    this.registry = new promClient.Registry();
    
    // Collect default metrics (CPU, memory, etc.)
    promClient.collectDefaultMetrics({ register: this.registry });

    // HTTP Request metrics
    this.httpRequestsTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'status', 'route'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'status', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    // Video Processing metrics
    this.videoJobsCreatedTotal = new promClient.Counter({
      name: 'video_jobs_created_total',
      help: 'Total number of video jobs created',
      labelNames: ['user_id'],
      registers: [this.registry],
    });

    this.videoJobsProcessedTotal = new promClient.Counter({
      name: 'video_jobs_processed_total',
      help: 'Total number of video jobs processed successfully',
      labelNames: ['user_id'],
      registers: [this.registry],
    });

    this.videoJobsFailedTotal = new promClient.Counter({
      name: 'video_jobs_failed_total',
      help: 'Total number of video jobs that failed',
      labelNames: ['user_id', 'error_type'],
      registers: [this.registry],
    });

    this.videoProcessingDuration = new promClient.Histogram({
      name: 'video_processing_duration_seconds',
      help: 'Time to process video in seconds',
      labelNames: ['user_id', 'video_size_mb'],
      buckets: [1, 5, 10, 30, 60, 300, 600], // 1s to 10min
      registers: [this.registry],
    });

    this.videoUploadsTotal = new promClient.Counter({
      name: 'video_uploads_total',
      help: 'Total number of video upload attempts',
      labelNames: ['user_id'],
      registers: [this.registry],
    });

    this.videoUploadsSuccessful = new promClient.Counter({
      name: 'video_uploads_successful_total',
      help: 'Total number of successful video uploads',
      labelNames: ['user_id'],
      registers: [this.registry],
    });

    // System metrics
    this.activeConnections = new promClient.Gauge({
      name: 'active_database_connections',
      help: 'Number of active database connections',
      registers: [this.registry],
    });

    this.queueSize = new promClient.Gauge({
      name: 'rabbitmq_queue_messages',
      help: 'Number of messages in RabbitMQ queue',
      labelNames: ['queue'],
      registers: [this.registry],
    });
  }

  // Method to get metrics for Prometheus scraping
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  // Helper method to record HTTP request
  recordHttpRequest(method: string, status: number, route: string, duration: number) {
    this.httpRequestsTotal.inc({ method, status: status.toString(), route });
    this.httpRequestDuration.observe({ method, status: status.toString(), route }, duration);
  }

  // Helper method to record video job creation
  recordVideoJobCreated(userId?: string) {
    this.videoJobsCreatedTotal.inc({ user_id: userId || 'anonymous' });
  }

  // Helper method to record video job completion
  recordVideoJobProcessed(userId?: string) {
    this.videoJobsProcessedTotal.inc({ user_id: userId || 'anonymous' });
  }

  // Helper method to record video job failure
  recordVideoJobFailed(userId?: string, errorType?: string) {
    this.videoJobsFailedTotal.inc({ user_id: userId || 'anonymous', error_type: errorType || 'unknown' });
  }

  // Helper method to record video processing time
  recordVideoProcessingDuration(duration: number, userId?: string, videoSizeMb?: number) {
    this.videoProcessingDuration.observe(
      { 
        user_id: userId || 'anonymous', 
        video_size_mb: videoSizeMb ? Math.round(videoSizeMb).toString() : 'unknown' 
      }, 
      duration
    );
  }

  // Helper method to record upload attempts
  recordVideoUploadAttempt(userId?: string) {
    this.videoUploadsTotal.inc({ user_id: userId || 'anonymous' });
  }

  // Helper method to record successful uploads
  recordVideoUploadSuccess(userId?: string) {
    this.videoUploadsSuccessful.inc({ user_id: userId || 'anonymous' });
  }

  // Helper method to update active connections
  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  // Helper method to update queue size
  setQueueSize(queueName: string, size: number) {
    this.queueSize.set({ queue: queueName }, size);
  }
}