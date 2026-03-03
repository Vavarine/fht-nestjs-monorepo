export interface NotificationPayload {
  userId: string;
  videoProcessingJobId: string;
  status: string;
  fileName?: string;
}

export abstract class NotificationService {
  abstract send(payload: NotificationPayload): Promise<void>;
}
