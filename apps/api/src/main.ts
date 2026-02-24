import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { Transport } from "@nestjs/microservices";
import * as promClient from 'prom-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: "api", // Default is "Nest"
      breakLength: 10, // Default is 1000
    }),
  });

  // Configurar métricas Prometheus
  const register = new promClient.Registry();
  promClient.collectDefaultMetrics({ register });

  // Endpoint /metrics
  app.use('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  const config = new DocumentBuilder()
    .setTitle("FIAP Hackathon API")
    .setDescription("Video Processing API for FIAP Hackathon")
    .setVersion("1.5")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Token (optional)",
      },
      "jwt",
    )
    .build();

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || "amqp://localhost:5672"],
      queue:
        process.env.VIDEO_PROCESSING_SERVICE_UPDATE_QUEUE ||
        "video_update_queue",
      noAck: false,
      queueOptions: {
        durable: true,
      },
    },
  });

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("", app, documentFactory);

  app.useGlobalPipes(new ValidationPipe());

  await app.startAllMicroservices();
  await app.listen(process.env.API_PORT || 3000);
}

bootstrap();
