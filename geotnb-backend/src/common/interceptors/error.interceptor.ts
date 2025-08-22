import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Observable, throwError } from 'rxjs';
  import { catchError } from 'rxjs/operators';
  
  @Injectable()
  export class ErrorInterceptor implements NestInterceptor {
    private readonly logger = new Logger(ErrorInterceptor.name);
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        catchError((error) => {
          const request = context.switchToHttp().getRequest();
          const user = request.user;
          
          // Logger l'erreur avec contexte
          this.logger.error(
            `Erreur sur ${request.method} ${request.url} - User: ${user?.username || 'Anonymous'}`,
            error.stack
          );
  
          // Transformer les erreurs en réponses HTTP appropriées
          if (error instanceof HttpException) {
            return throwError(() => error);
          }
  
          // Erreurs de base de données
          if (error.code) {
            return throwError(() => this.handleDatabaseError(error));
          }
  
          // Erreur générique
          return throwError(() => new HttpException(
            {
              success: false,
              message: 'Une erreur interne est survenue',
              timestamp: new Date().toISOString(),
              path: request.url,
            },
            HttpStatus.INTERNAL_SERVER_ERROR
          ));
        }),
      );
    }
  
    private handleDatabaseError(error: any): HttpException {
      switch (error.code) {
        case '23505': // Violation de contrainte unique
          return new HttpException(
            {
              success: false,
              message: 'Cette valeur existe déjà dans la base de données',
              error: 'Duplicate entry',
            },
            HttpStatus.CONFLICT
          );
        
        case '23503': // Violation de clé étrangère
          return new HttpException(
            {
              success: false,
              message: 'Impossible de supprimer cet élément car il est référencé ailleurs',
              error: 'Foreign key constraint',
            },
            HttpStatus.BAD_REQUEST
          );
        
        case '23514': // Violation de contrainte de vérification
          return new HttpException(
            {
              success: false,
              message: 'Les données ne respectent pas les contraintes définies',
              error: 'Check constraint violation',
            },
            HttpStatus.BAD_REQUEST
          );
        
        default:
          return new HttpException(
            {
              success: false,
              message: 'Erreur de base de données',
              error: 'Database error',
            },
            HttpStatus.INTERNAL_SERVER_ERROR
          );
      }
    }
  }