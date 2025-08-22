import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    BadRequestException,
    Logger,
  } from '@nestjs/common';
  import { Response } from 'express';
  
  @Catch(BadRequestException)
  export class ValidationFilter implements ExceptionFilter {
    private readonly logger = new Logger(ValidationFilter.name);
  
    catch(exception: BadRequestException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest();
  
      const exceptionResponse = exception.getResponse() as any;
      
      // Gestion spéciale des erreurs de validation
      const validationErrors = exceptionResponse.message || [];
      
      // Formatage des erreurs de validation pour le frontend
      const formattedErrors = Array.isArray(validationErrors) 
        ? this.formatValidationErrors(validationErrors)
        : [validationErrors];
  
      const errorResponse = {
        success: false,
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: 'Erreur de validation des données',
        validationErrors: formattedErrors,
        details: 'Veuillez vérifier les champs saisis et réessayer',
      };
  
      this.logger.warn(`Validation Error: ${JSON.stringify(errorResponse)}`);
      
      response.status(400).json(errorResponse);
    }
  
    private formatValidationErrors(errors: string[]): any[] {
      return errors.map(error => {
        // Extraire le champ et le message d'erreur
        const parts = error.split(' ');
        const field = parts[0];
        const message = parts.slice(1).join(' ');
        
        return {
          field,
          message,
          value: null, // Peut être étendu si nécessaire
        };
      });
    }
  }