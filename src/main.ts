import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { rateLimit } from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );
  app.enableCors();
  app.setGlobalPrefix('v1');

  // Setup Swagger Documentation
  const configSwagger = new DocumentBuilder()
    .setTitle("Hubstack's API Documentation V1")
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
  SwaggerModule.setup('/', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // this
    },
  });
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
