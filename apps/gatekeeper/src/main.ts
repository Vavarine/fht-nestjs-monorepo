import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { writeFileSync } from "node:fs";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("PosTech Challange API")
    .setDescription(
      "Este é um projeto desenvolvido para o **FIAP Tech Challenge**, com foco em demonstrar a aplicação dos princípios da **Clean Architecture**. A proposta é apresentar uma estrutura de código modular, desacoplada e de fácil manutenção, usando tecnologias modernas e boas práticas de desenvolvimento.",
    )
    .setVersion("1.5")
    .setBasePath("/")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT (opcional)",
      },
      "jwt",
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/customers/api", app, documentFactory);

  if (process.env.ENV === "development") {
    // Generate and save the Swagger JSON document to a file
    writeFileSync(
      "./docs/swagger.json",
      JSON.stringify(documentFactory(), null, 2),
    );
  }

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}

bootstrap();
