import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🚨 CORS pour Angular (TRÈS IMPORTANT)
  app.enableCors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 🎯 Préfixe API (si vous l'utilisez)
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('🚀 Backend TNB démarré sur http://localhost:3000');
  console.log('🏥 Health check: http://localhost:3000/api/health');
}
bootstrap();
