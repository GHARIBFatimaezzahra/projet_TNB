import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitConfig {
  points: number;    // Nombre de requêtes autorisées
  duration: number;  // Durée en secondes
  blockDuration?: number; // Durée de blocage en secondes
}

/**
 * Decorator pour limiter le taux de requêtes
 * @param config Configuration du rate limiting
 * @example
 * @RateLimit({ points: 5, duration: 60 }) // 5 requêtes par minute
 * @Post('upload')
 * upload() { ... }
 */
export const RateLimit = (config: RateLimitConfig) => SetMetadata(RATE_LIMIT_KEY, config);

// Helpers pour rate limiting commun
export const RateLimitStrict = () => RateLimit({ points: 3, duration: 60, blockDuration: 300 });
export const RateLimitModerate = () => RateLimit({ points: 10, duration: 60 });
export const RateLimitRelaxed = () => RateLimit({ points: 30, duration: 60 });