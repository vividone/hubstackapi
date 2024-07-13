import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('v1');

  // Setup Swagger Documentation
  const configSwagger = new DocumentBuilder()
    .setTitle("Hubstak's API Documentation V1")
    .setDescription(
      "This API allows developers to access and interact with Hubstack's business logic.",
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addServer('https://dev-api.hubstack.app', 'Development Server')
    .build();
  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('docs/', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // this
    },
  });
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
