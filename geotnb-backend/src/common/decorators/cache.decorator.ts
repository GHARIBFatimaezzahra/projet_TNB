import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache';

export interface CacheConfig {
  ttl: number;       // Time to live en secondes
  key?: string;      // Clé de cache personnalisée
  condition?: string; // Condition pour activer le cache
}

/**
 * Decorator pour mettre en cache le résultat d'une méthode
 * @param config Configuration du cache
 * @example
 * @Cache({ ttl: 300 }) // Cache pendant 5 minutes
 * @Get('statistics')
 * getStatistics() { ... }
 */
export const Cache = (config: CacheConfig) => SetMetadata(CACHE_KEY, config);

// Helpers pour cache commun
export const CacheShort = () => Cache({ ttl: 60 });      // 1 minute
export const CacheMedium = () => Cache({ ttl: 300 });    // 5 minutes
export const CacheLong = () => Cache({ ttl: 3600 });     // 1 heure
