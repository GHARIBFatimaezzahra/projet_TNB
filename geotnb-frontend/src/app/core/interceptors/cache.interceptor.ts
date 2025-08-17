import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}

class HttpCache {
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut

  get(key: string): HttpResponse<any> | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Vérifier si l'entrée a expiré
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.response.clone();
  }

  set(key: string, response: HttpResponse<any>, ttl?: number): void {
    const entry: CacheEntry = {
      response: response.clone(),
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };
    
    this.cache.set(key, entry);
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  // Nettoyer les entrées expirées
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

const httpCache = new HttpCache();

// Nettoyer le cache toutes les 10 minutes
setInterval(() => httpCache.cleanup(), 10 * 60 * 1000);

export const cacheInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Ne mettre en cache que les requêtes GET
  if (req.method !== 'GET') {
    return next(req);
  }

  // Ne pas mettre en cache certaines requêtes
  if (shouldSkipCache(req)) {
    return next(req);
  }

  const cacheKey = generateCacheKey(req);
  const cachedResponse = httpCache.get(cacheKey);

  // Retourner la réponse en cache si elle existe
  if (cachedResponse) {
    return of(cachedResponse);
  }

  // Sinon, faire la requête et mettre en cache la réponse
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        const ttl = getCacheTTL(req);
        httpCache.set(cacheKey, event, ttl);
      }
    })
  );
};

function shouldSkipCache(req: HttpRequest<unknown>): boolean {
  // Headers pour contrôler le cache
  if (req.headers.has('X-Skip-Cache') || req.headers.has('Cache-Control')) {
    return true;
  }

  // Ne pas mettre en cache certains endpoints
  const skipEndpoints = [
    '/auth',
    '/upload',
    '/download',
    '/export',
    '/dashboard/stats' // Données en temps réel
  ];
  
  return skipEndpoints.some(endpoint => req.url.includes(endpoint));
}

function generateCacheKey(req: HttpRequest<unknown>): string {
  return `${req.method}:${req.urlWithParams}`;
}

function getCacheTTL(req: HttpRequest<unknown>): number {
  // TTL personnalisé selon l'endpoint
  if (req.url.includes('/users') || req.url.includes('/roles')) {
    return 15 * 60 * 1000; // 15 minutes pour les données d'utilisateurs
  }
  
  if (req.url.includes('/parcelles') || req.url.includes('/proprietaires')) {
    return 10 * 60 * 1000; // 10 minutes pour les données principales
  }
  
  if (req.url.includes('/dashboard')) {
    return 2 * 60 * 1000; // 2 minutes pour le dashboard
  }

  return 5 * 60 * 1000; // 5 minutes par défaut
}

// Fonctions utilitaires pour gérer le cache depuis les composants
export const CacheUtils = {
  clear: () => httpCache.clear(),
  delete: (key: string) => httpCache.delete(key),
  cleanup: () => httpCache.cleanup()
};