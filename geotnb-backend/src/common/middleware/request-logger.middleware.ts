import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || '';

    // Log de la requête entrante
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Intercepter la réponse
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      
      const logLevel = statusCode >= 400 ? 'error' : 'log';
      this.logger[logLevel](
        `${method} ${originalUrl} - ${statusCode} - ${duration}ms - ${ip}`
      );
    });

    next();
  }
}