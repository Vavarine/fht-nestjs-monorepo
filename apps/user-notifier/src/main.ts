import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: "ntf",
      breakLength: 10,
    }),
  });

  const config = new DocumentBuilder()
    .setTitle("FIAP Hackathon User Notifier Worker")
    .setDescription("User notifier worker for FIAP Hackathon")
    .setVersion("1.0")
    .build();

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || "amqp://localhost:5672"],
      queue: process.env.USER_NOTIFIER_SERVICE_QUEUE || "user_notifier_queue",
      noAck: false,
      prefetchCount: Number(process.env.RABBITMQ_PREFETCH_COUNT || "1"),
      queueOptions: {
        durable: true,
      },
    },
  });

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("", app, documentFactory);

  app.useGlobalPipes(new ValidationPipe());

  await app.startAllMicroservices();
  await app.listen(process.env.USER_NOTIFIER_PORT || 3002);
}

bootstrap();
