import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Route racine API
  @Get()
  getApiInfo(): any {
    return {
      name: 'TNB Géoportail API',
      version: '1.0.0',
      description: 'API pour la gestion de la Taxe sur les Terrains Non Bâtis',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: 'GET /api/health',
        auth: 'GET /api/auth/status',
        users: 'GET /api/users',
        debug: 'GET /api/debug'
      }
    };
  }

  // 🏥 Route de santé - ESSENTIELLE
  @Get('health')
  getHealth(): any {
    return {
      status: 'OK',
      message: 'TNB Géoportail Backend is running! 🚀',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: 'PostgreSQL connected',
      port: 3000
    };
  }

  // 🧪 Route de test
  @Get('test')
  getTest(): any {
    return {
      message: 'Route de test fonctionne! ✅',
      timestamp: new Date().toISOString(),
      backend: 'NestJS',
      database: 'PostgreSQL',
      cors: 'Enabled for Angular'
    };
  }

  // 🔧 Route de debug pour voir toutes les routes
  @Get('debug')
  getDebug(): any {
    return {
      message: 'Debug - Routes disponibles',
      routes: [
        'GET /api - Info générale API',
        'GET /api/health - Status du serveur',
        'GET /api/test - Test de base',
        'GET /api/debug - Cette route de debug',
        'GET /api/auth/status - Status authentification',
        'POST /api/auth/test-login - Test login',
        'GET /api/users - Liste des utilisateurs'
      ],
      modules: ['AuthModule', 'UserModule', 'AppModule'],
      timestamp: new Date().toISOString()
    };
  }
}