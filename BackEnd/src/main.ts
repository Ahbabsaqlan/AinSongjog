import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable Global Validation Pipe (for DTOs)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips properties not in DTO
    forbidNonWhitelisted: true, // Throws error if extra props sent
  }));

  app.enableCors({
    origin: 'http://localhost:3000', // Allow Next.js frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(4000);
}
bootstrap();