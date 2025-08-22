import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    RequestTimeoutException,
  } from '@nestjs/common';
  import { Observable, throwError, TimeoutError } from 'rxjs';
  import { catchError, timeout } from 'rxjs/operators';
  
  @Injectable()
  export class TimeoutInterceptor implements NestInterceptor {
    private readonly defaultTimeout = 30000; // 30 secondes
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const timeoutValue = this.getTimeoutForRoute(request.url);
  
      return next.handle().pipe(
        timeout(timeoutValue),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            return throwError(() => new RequestTimeoutException('La requête a expiré'));
          }
          return throwError(() => err);
        }),
      );
    }
  
    private getTimeoutForRoute(url: string): number {
      // Timeouts spécifiques pour certaines routes
      if (url.includes('/fiches-fiscales/generate')) {
        return 60000; // 1 minute pour génération PDF
      }
      if (url.includes('/import')) {
        return 120000; // 2 minutes pour import
      }
      if (url.includes('/export')) {
        return 90000; // 1.5 minutes pour export
      }
      if (url.includes('/statistics')) {
        return 45000; // 45 secondes pour statistiques
      }
      
      return this.defaultTimeout;
    }
  }