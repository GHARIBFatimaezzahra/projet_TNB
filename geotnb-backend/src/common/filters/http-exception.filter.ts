import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch(HttpException)
  export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
  
    catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      const status = exception.getStatus();
  
      const exceptionResponse = exception.getResponse();
      const message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || 'Erreur interne';
  
      // Structure de réponse uniformisée
      const errorResponse = {
        success: false,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: Array.isArray(message) ? message[0] : message,
        errors: Array.isArray(message) ? message : undefined,
      };
  
      // Log des erreurs selon leur gravité
      if (status >= 500) {
        this.logger.error(
          `HTTP ${status} Error: ${JSON.stringify(errorResponse)}`,
          exception.stack,
        );
      } else if (status >= 400) {
        this.logger.warn(`HTTP ${status} Warning: ${JSON.stringify(errorResponse)}`);
      }
  
      response.status(status).json(errorResponse);
    }
  }