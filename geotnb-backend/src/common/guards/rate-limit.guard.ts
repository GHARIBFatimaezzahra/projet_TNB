import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const RATE_LIMIT_KEY = 'rateLimit';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

/**
 * Guard simple de rate limiting pour protéger les endpoints critiques
 * En production, utilisez Redis ou une solution plus robuste
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly requestMap = new Map<string, { count: number; resetTime: number }>();
  
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rateLimitConfig = this.reflector.getAllAndOverride<RateLimitConfig>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rateLimitConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const clientKey = this.getClientKey(request);
    const now = Date.now();

    const clientData = this.requestMap.get(clientKey);

    if (!clientData) {
      this.requestMap.set(clientKey, {
        count: 1,
        resetTime: now + rateLimitConfig.windowMs,
      });
      return true;
    }

    if (now > clientData.resetTime) {
      // Fenêtre expirée, reset
      this.requestMap.set(clientKey, {
        count: 1,
        resetTime: now + rateLimitConfig.windowMs,
      });
      return true;
    }

    if (clientData.count >= rateLimitConfig.maxRequests) {
      throw new HttpException(
        rateLimitConfig.message || 'Trop de requêtes, veuillez réessayer plus tard',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    clientData.count++;
    return true;
  }

  private getClientKey(request: any): string {
    // Combinaison IP + userId pour un tracking plus précis
    const ip = request.ip || request.connection.remoteAddress;
    const userId = request.user?.id || 'anonymous';
    return `${ip}-${userId}`;
  }
}