import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { Request } from 'express';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest<Request>();
      const { method, url, ip } = request;
      const userAgent = request.get('User-Agent') || '';
      const user = (request as any).user;
      
      const startTime = Date.now();
      
      // Log de la requête entrante
      this.logger.log(
        `[${method}] ${url} - IP: ${ip} - User: ${user?.username || 'Anonymous'} - UserAgent: ${userAgent}`
      );
  
      return next.handle().pipe(
        tap({
          next: (data) => {
            const responseTime = Date.now() - startTime;
            this.logger.log(
              `[${method}] ${url} - ${responseTime}ms - Success - User: ${user?.username || 'Anonymous'}`
            );
          },
          error: (error) => {
            const responseTime = Date.now() - startTime;
            this.logger.error(
              `[${method}] ${url} - ${responseTime}ms - Error: ${error.message} - User: ${user?.username || 'Anonymous'}`,
              error.stack
            );
          },
        }),
      );
    }
  }