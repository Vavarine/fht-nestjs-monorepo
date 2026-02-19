import { ClientsModule, Transport } from "@nestjs/microservices";

export const RabbitmqService = ClientsModule.register([
  {
    name: "VIDEO_PROCESSING_SERVICE",
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || "amqp://localhost:5672"],
      queue:
        process.env.VIDEO_PROCESSING_SERVICE_QUEUE || "video_processing_queue",
      queueOptions: { durable: true },
    },
  },
]);
