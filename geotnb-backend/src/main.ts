import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Configuration CORS
  app.enableCors({
    origin: [
      'http://localhost:4200', // Angular dev
      'http://localhost:3000', // React dev
      configService.get('FRONTEND_URL', 'http://localhost:4200'),
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Prefix global pour l'API
  app.setGlobalPrefix('api/v1');

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans les DTOs
      forbidNonWhitelisted: true, // Erreur si propriétés non autorisées
      transform: true, // Transformation automatique des types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtres globaux
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptors globaux
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Configuration Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('API GeoTNB')
    .setDescription('API pour la gestion de la Taxe sur les Terrains Non Bâtis (TNB) - Commune d\'Oujda')
    .setVersion('1.0')
    .setContact(
      'Équipe GeoConseil',
      'https://geoconseil.ma',
      'contact@geoconseil.ma'
    )
    .setLicense('Propriétaire', 'Copyright © 2024 GeoConseil')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT pour authentification',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Endpoints d\'authentification et autorisation')
    .addTag('Users', 'Gestion des utilisateurs système')
    .addTag('Parcelles', 'Gestion des parcelles de terrain')
    .addTag('Propriétaires', 'Gestion des propriétaires de parcelles')
    .addTag('Indivision', 'Gestion des relations parcelle-propriétaire')
    .addTag('Fiches Fiscales', 'Génération et gestion des fiches TNB')
    .addTag('Documents', 'Gestion des documents joints')
    .addTag('Dashboard', 'Statistiques et indicateurs')
    .addTag('Configuration', 'Configuration système et fiscale')
    .addServer('http://localhost:3000', 'Serveur de développement')  // ← SUPPRIMÉ /api/v1
    .addServer('https://api-tnb.commune-oujda.ma', 'Serveur de production')  // ← SUPPRIMÉ /api/v1
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'GeoTNB API Documentation',
    customCss: `
      .topbar-wrapper img { content: url('/assets/logo-commune.png'); height: 40px; }
      .swagger-ui .topbar { background-color: #1890ff; }
    `,
  });

  // Démarrage du serveur
  const port = configService.get('PORT', 3000);
  await app.listen(port);

  logger.log(`�� Application démarrée sur le port ${port}`);
  logger.log(`📚 Documentation API disponible sur http://localhost:${port}/api/docs`);
  logger.log(`��️ Environnement: ${configService.get('NODE_ENV', 'development')}`);
  logger.log(`🗃️ Base de données: ${configService.get('DB_NAME')}`);
}

bootstrap().catch((error) => {
  Logger.error('Erreur lors du démarrage de l\'application', error);
  process.exit(1);
});