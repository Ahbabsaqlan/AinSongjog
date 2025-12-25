import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS (allow localhost + Vercel)
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://your-frontend.vercel.app', // 👈 CHANGE THIS
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // IMPORTANT: use environment PORT
  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Server running on port ${port}`);
}

bootstrap();
