import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitInfo {
  requests: number;
  resetTime: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly store = new Map<string, RateLimitInfo>();
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly maxRequests = 100; // Max 100 requêtes par fenêtre

  use(req: Request, res: Response, next: NextFunction): void {
    const key = this.getKey(req);
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Nettoyer les anciennes entrées
    this.cleanup(windowStart);

    // Obtenir ou créer l'info pour cette clé
    let info = this.store.get(key);
    if (!info || info.resetTime < windowStart) {
      info = {
        requests: 0,
        resetTime: now + this.windowMs,
      };
    }

    info.requests++;
    this.store.set(key, info);

    // Headers informatifs
    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - info.requests));
    res.setHeader('X-RateLimit-Reset', Math.ceil(info.resetTime / 1000));

    // Vérifier la limite
    if (info.requests > this.maxRequests) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: Math.ceil((info.resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    next();
  }

  private getKey(req: Request): string {
    // Utiliser l'IP + User-Agent pour identifier l'utilisateur
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    return `${ip}-${userAgent}`;
  }

  private cleanup(cutoff: number): void {
    for (const [key, info] of this.store.entries()) {
      if (info.resetTime < cutoff) {
        this.store.delete(key);
      }
    }
  }
}