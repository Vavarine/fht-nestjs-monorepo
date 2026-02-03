import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
  .setTitle('FIAP Hackathon API')
  .setDescription('Video Processing API for FIAP Hackathon')
  .setVersion('1.5')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT Token (optional)',
    },
    'jwt',
  )
  .build(); 
  
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.API_PORT || 3000);
}

bootstrap();
