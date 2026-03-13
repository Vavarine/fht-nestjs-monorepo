export interface NotificationPayload {
  userId: string;
  userEmail: string;
  userName: string;
  videoProcessingJobId: string;
  status: string;
  fileName?: string;
}

export abstract class NotificationService {
  abstract send(payload: NotificationPayload): Promise<void>;
}
