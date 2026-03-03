import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class RabbitMQVideoProcessingPublisherJob {
  constructor(
    @Inject("USER_NOTIFIER_SERVICE") private readonly client: ClientProxy,
  ) {}

  async publish(payload: {
    videoProcessingJobId: string;
    status: string;
    fileName?: string;
  }): Promise<void> {
    this.client.emit("notification_sent", payload);
  }
}
