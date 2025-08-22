import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @Public()
  @ApiOperation({ 
    summary: 'Vérification de l\'état de l\'application',
    description: 'Endpoint de health check pour monitoring et load balancers'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Application fonctionnelle',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        uptime: { type: 'number', example: 3600 },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'development' },
        database: { type: 'string', example: 'connected' },
        memory: {
          type: 'object',
          properties: {
            used: { type: 'number', example: 45.2 },
            total: { type: 'number', example: 512 }
          }
        }
      }
    }
  })
  getHealth() {
    return this.appService.getHealthCheck();
  }

  @Get('info')
  @Public()
  @ApiOperation({ 
    summary: 'Informations sur l\'application',
    description: 'Métadonnées et informations générales de l\'API GeoTNB'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Informations récupérées',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'GeoTNB API' },
        description: { type: 'string', example: 'API pour la gestion de la TNB' },
        version: { type: 'string', example: '1.0.0' },
        author: { type: 'string', example: 'GeoConseil' },
        environment: { type: 'string', example: 'development' },
        features: {
          type: 'array',
          items: { type: 'string' },
          example: ['Authentication', 'Parcelles', 'TNB', 'SIG']
        }
      }
    }
  })
  getInfo() {
    return this.appService.getAppInfo();
  }

  @Get('version')
  @Public()
  @ApiOperation({ summary: 'Version de l\'application' })
  @ApiResponse({ 
    status: 200, 
    description: 'Version actuelle',
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string', example: '1.0.0' },
        buildDate: { type: 'string', example: '2024-01-15' },
        commitHash: { type: 'string', example: 'abc123' }
      }
    }
  })
  getVersion() {
    return this.appService.getVersion();
  }

  @Post('contact')
  @Public()
  @ApiOperation({ 
    summary: 'Formulaire de contact',
    description: 'Permet aux utilisateurs d\'envoyer des messages à l\'équipe technique'
  })
  @ApiResponse({ status: 201, description: 'Message envoyé avec succès' })
  contact(@Body() contactData: any) {
    return this.appService.handleContact(contactData);
  }
}
