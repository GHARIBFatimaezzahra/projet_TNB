import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

// Guards
import { JwtAuthGuard } from './common/guards/auth.guard';

// Modules métier
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ParcelleModule } from './parcelle/parcelle.module';
import { ProprietaireModule } from './proprietaire/proprietaire.module';
import { SpatialQueriesModule } from './spatial-queries/spatial-queries.module';
import { Parcelle } from './parcelle/entities/parcelle.entity';
// import { ParcelleProprietaireModule } from './parcelle-proprietaire/parcelle-proprietaire.module';
// import { FicheFiscaleModule } from './fiche-fiscale/fiche-fiscale.module';
// import { DocumentJointModule } from './document-joint/document-joint.module';
// import { JournalActionModule } from './journal-action/journal-action.module';
// import { DashboardModule } from './dashboard/dashboard.module';
// import { ConfigurationModule } from './config/config.module';

// Modules Core
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpatialQueriesTempController } from './spatial-queries-temp.controller';

// Configuration de la base de données
import { databaseConfig } from './config/database.config';

// Interceptors globaux
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

// Strategies
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [databaseConfig],
    }),

    // Passport pour l'authentification JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT Module global
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h'
        },
      }),
      inject: [ConfigService],
      global: true, // Rend JwtModule disponible globalement
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 seconde
        limit: 10, // 10 requêtes par seconde
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requêtes par minute
      },
      {
        name: 'long',
        ttl: 3600000, // 1 heure
        limit: 1000, // 1000 requêtes par heure
      },
    ]),

    // Base de données avec configuration dynamique
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') ?? 'localhost',
        port: parseInt(configService.get<string>('DB_PORT') ?? '5433', 10),
        username: configService.get<string>('DB_USERNAME') ?? 'postgres',
        password: String(configService.get<string>('DB_PASSWORD') ?? '123456789'),
        database: configService.get<string>('DB_NAME') ?? 'Application SIG_TNB',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // ← DÉSACTIVÉ pour préserver votre schéma existant
        logging: configService.get('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
        retryAttempts: 3,
        retryDelay: 3000,
        autoLoadEntities: true,
        extra: {
          max: 20, // Pool de connexions maximum
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
      inject: [ConfigService],
    }),

    // Repository pour les requêtes spatiales temporaires
    TypeOrmModule.forFeature([Parcelle]),

    // Modules métier
    UserModule,
    AuthModule, // Auth doit être après User car il en dépend
    ParcelleModule,
    ProprietaireModule,
    SpatialQueriesModule,
    // Modules à décommenter au fur et à mesure de l'implémentation
    // ParcelleProprietaireModule,
    // FicheFiscaleModule,
    // DocumentJointModule,
    // JournalActionModule,
    // DashboardModule,
    // ConfigurationModule,
  ],

  controllers: [AppController, SpatialQueriesTempController],
  providers: [
    AppService,
    
    // JWT Strategy (IMPORTANT : doit être déclaré ici pour être global)
    JwtStrategy,
    
    // Reflector pour les décorateurs
    Reflector,
    
    // Guards globaux
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // ← Vérification JWT globale avec exclusions
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Rate limiting global
    },

    // Interceptors globaux (ordre important)
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor, // Audit trail automatique
    },
  ],
  exports: [
    JwtModule, // Exporte JwtModule pour les autres modules
    PassportModule,
  ],
})
export class AppModule {}