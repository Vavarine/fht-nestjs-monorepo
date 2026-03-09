import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  // Counters
  private readonly notificationsSentTotal: Counter<string>;
  private readonly notificationsFailedTotal: Counter<string>;
  private readonly notificationsReceivedTotal: Counter<string>;

  // Histograms
  private readonly notificationDuration: Histogram<string>;

  constructor() {
    // Notifications sent counter
    this.notificationsSentTotal = new Counter({
      name: 'notifications_sent_total',
      help: 'Total number of notifications sent successfully',
      labelNames: ['user_id', 'status'],
      registers: [register],
    });

    // Notifications failed counter
    this.notificationsFailedTotal = new Counter({
      name: 'notifications_failed_total',
      help: 'Total number of failed notification attempts',
      labelNames: ['user_id', 'status', 'error_type'],
      registers: [register],
    });

    // Notifications received counter (from queue)
    this.notificationsReceivedTotal = new Counter({
      name: 'notifications_received_total',
      help: 'Total number of notification requests received from queue',
      labelNames: ['status'],
      registers: [register],
    });

    // Notification processing duration
    this.notificationDuration = new Histogram({
      name: 'notification_duration_seconds',
      help: 'Duration of notification processing in seconds',
      labelNames: ['status'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [register],
    });
  }

  // Record notification received from queue
  recordNotificationReceived(status: string): void {
    this.notificationsReceivedTotal.labels(status).inc();
  }

  // Record successful notification
  recordNotificationSent(userId: string, status: string): void {
    this.notificationsSentTotal.labels(userId, status).inc();
  }

  // Record failed notification
  recordNotificationFailed(userId: string, status: string, errorType: string): void {
    this.notificationsFailedTotal.labels(userId, status, errorType).inc();
  }

  // Start timer for notification duration
  startNotificationTimer() {
    return this.notificationDuration.startTimer();
  }

  // Get metrics for Prometheus scraping
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
