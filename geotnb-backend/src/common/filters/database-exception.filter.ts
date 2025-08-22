import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { QueryFailedError, EntityNotFoundError, CannotCreateEntityIdMapError } from 'typeorm';
  
  @Catch(QueryFailedError, EntityNotFoundError, CannotCreateEntityIdMapError)
  export class DatabaseExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(DatabaseExceptionFilter.name);
  
    catch(exception: any, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Erreur de base de données';
      let details = '';
  
      // Gestion spécifique selon le type d'erreur
      if (exception instanceof QueryFailedError) {
        const error = exception as any;
        
        // Erreurs PostgreSQL courantes
        switch (error.code) {
          case '23505': // Violation contrainte unique
            status = HttpStatus.CONFLICT;
            message = 'Cette valeur existe déjà dans la base de données';
            details = this.extractUniqueConstraintField(error.detail);
            break;
            
          case '23503': // Violation contrainte clé étrangère
            status = HttpStatus.BAD_REQUEST;
            message = 'Référence vers un élément inexistant';
            details = 'Vérifiez que les éléments référencés existent';
            break;
            
          case '23502': // Violation contrainte NOT NULL
            status = HttpStatus.BAD_REQUEST;
            message = 'Champ obligatoire manquant';
            details = this.extractNotNullField(error.message);
            break;
            
          case '23514': // Violation contrainte CHECK
            status = HttpStatus.BAD_REQUEST;
            message = 'Valeur non autorisée';
            details = 'La valeur ne respecte pas les règles métier';
            break;
            
          default:
            this.logger.error(`Erreur SQL non gérée: ${error.code}`, error.message);
            message = 'Erreur de base de données';
        }
      } else if (exception instanceof EntityNotFoundError) {
        status = HttpStatus.NOT_FOUND;
        message = 'Élément introuvable';
        details = 'L\'élément demandé n\'existe pas';
      }
  
      const errorResponse = {
        success: false,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
        details,
        type: 'DATABASE_ERROR',
      };
  
      // Log selon la gravité
      if (status >= 500) {
        this.logger.error(`Database Error: ${JSON.stringify(errorResponse)}`, exception.stack);
      } else {
        this.logger.warn(`Database Warning: ${JSON.stringify(errorResponse)}`);
      }
  
      response.status(status).json(errorResponse);
    }
  
    private extractUniqueConstraintField(detail: string): string {
      // Extraire le nom du champ de l'erreur PostgreSQL
      const match = detail?.match(/Key \(([^)]+)\)/);
      if (match) {
        const field = match[1];
        // Mapper les noms de champs vers des messages compréhensibles
        const fieldMappings = {
          'username': 'Ce nom d\'utilisateur',
          'email': 'Cette adresse email',
          'reference_fonciere': 'Cette référence foncière',
          'cin_ou_rc': 'Ce CIN/RC',
        };
        return fieldMappings[field] || `Le champ ${field}`;
      }
      return 'Cette valeur';
    }
  
    private extractNotNullField(message: string): string {
      const match = message?.match(/column "([^"]+)" violates not-null constraint/);
      if (match) {
        const field = match[1];
        const fieldMappings = {
          'nom': 'Le nom est obligatoire',
          'reference_fonciere': 'La référence foncière est obligatoire',
          'username': 'Le nom d\'utilisateur est obligatoire',
          'email': 'L\'adresse email est obligatoire',
        };
        return fieldMappings[field] || `Le champ ${field} est obligatoire`;
      }
      return 'Un champ obligatoire est manquant';
    }
  }