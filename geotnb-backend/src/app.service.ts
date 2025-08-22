import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private configService: ConfigService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async getHealthCheck() {
    const startTime = Date.now();
    
    // Test connexion base de données
    let databaseStatus = 'disconnected';
    try {
      await this.dataSource.query('SELECT 1');
      databaseStatus = 'connected';
    } catch (error) {
      this.logger.error('Database health check failed', error);
      databaseStatus = 'error';
    }

    // Informations mémoire
    const memoryUsage = process.memoryUsage();
    const memoryInfo = {
      used: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      total: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
      external: Math.round((memoryUsage.external / 1024 / 1024) * 100) / 100,
    };

    const responseTime = Date.now() - startTime;

    return {
      status: databaseStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: this.configService.get('npm_package_version', '1.0.0'),
      environment: this.configService.get('NODE_ENV', 'development'),
      database: databaseStatus,
      memory: memoryInfo,
      responseTime: `${responseTime}ms`,
      nodeVersion: process.version,
      platform: process.platform,
    };
  }

  getAppInfo() {
    return {
      name: 'GeoTNB API',
      description: 'API pour la gestion de la Taxe sur les Terrains Non Bâtis (TNB) - Commune d\'Oujda',
      version: this.configService.get('npm_package_version', '1.0.0'),
      author: 'GeoConseil - Développement & Ingénierie',
      contact: 'contact@geoconseil.ma',
      documentation: '/api/docs',
      environment: this.configService.get('NODE_ENV', 'development'),
      features: [
        'Authentification JWT',
        'Gestion des parcelles',
        'Gestion des propriétaires', 
        'Calcul automatique TNB',
        'Gestion de l\'indivision',
        'Génération de fiches fiscales',
        'Interface SIG intégrée',
        'Audit trail complet',
        'Dashboard et statistiques',
        'Import/Export de données',
        'API RESTful documentée'
      ],
      technologies: [
        'NestJS',
        'TypeORM', 
        'PostgreSQL',
        'PostGIS',
        'JWT Authentication',
        'Swagger/OpenAPI',
        'Docker'
      ]
    };
  }

  getVersion() {
    return {
      version: this.configService.get('npm_package_version', '1.0.0'),
      buildDate: this.configService.get('BUILD_DATE', new Date().toISOString().split('T')[0]),
      commitHash: this.configService.get('COMMIT_HASH', 'dev'),
      branch: this.configService.get('GIT_BRANCH', 'main'),
      buildNumber: this.configService.get('BUILD_NUMBER', '1'),
    };
  }

  async handleContact(contactData: any) {
    this.logger.log('Contact form submitted', contactData);
    
    // Ici, on pourrait :
    // - Envoyer un email à l'équipe technique
    // - Enregistrer en base de données
    // - Intégrer avec un système de tickets
    
    return {
      message: 'Votre message a été envoyé avec succès. L\'équipe technique vous contactera dans les plus brefs délais.',
      timestamp: new Date().toISOString(),
      reference: `TNB-${Date.now()}`,
    };
  }

  async getDatabaseStats() {
    try {
      const stats = await this.dataSource.query(`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes
        FROM pg_stat_user_tables 
        ORDER BY schemaname, tablename
      `);
      
      return stats;
    } catch (error) {
      this.logger.error('Failed to get database stats', error);
      return [];
    }
  }
}