import { ClientsModule, Transport } from "@nestjs/microservices";

export const RabbitmqService = ClientsModule.register([
  {
    name: "USER_NOTIFIER_SERVICE",
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || "amqp://localhost:5672"],
      queue: process.env.USER_NOTIFIER_SERVICE_QUEUE || "user_notifier_queue",
      queueOptions: { durable: true },
    },
  },
]);
