import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      // Déterminer le status et le message selon le type d'exception
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Erreur interne du serveur';
      let details = '';
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        message = typeof exceptionResponse === 'string' 
          ? exceptionResponse 
          : (exceptionResponse as any).message || message;
      } else if (exception instanceof Error) {
        message = exception.message || message;
        details = exception.name || '';
      }
  
      const errorResponse = {
        success: false,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message,
        details,
        requestId: this.generateRequestId(),
      };
  
      // Log complet pour les erreurs 500
      if (status >= 500) {
        this.logger.error(
          `Unhandled Exception: ${JSON.stringify(errorResponse)}`,
          exception instanceof Error ? exception.stack : String(exception),
        );
      }
  
      response.status(status).json(errorResponse);
    }
  
    private generateRequestId(): string {
      return Math.random().toString(36).substring(2, 15);
    }
  }