import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer CORS pour accepter les requêtes depuis n'importe quelle origine (pendant le développement)
  app.enableCors({
    origin: '*',  // Permet à toutes les origines d'accéder à l'API (remplacer par un domaine spécifique en production)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',  // Méthodes autorisées
    allowedHeaders: 'Content-Type, Accept, Authorization',  // En-têtes autorisés
    credentials: true,  // Autorise l'envoi de cookies et autres informations d'identification (utile pour JWT)
  });

  // Configuration de Swagger
  const options = new DocumentBuilder()
    .setTitle('GeoTNB API')
    .setDescription('API documentation for GeoTNB backend')
    .setVersion('1.0')
    .addBearerAuth()  // Si tu utilises JWT pour l'authentification
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);  // L'API sera accessible sur /api

  await app.listen(3000);  // Assure-toi que ton backend tourne sur le bon port
}
bootstrap();
