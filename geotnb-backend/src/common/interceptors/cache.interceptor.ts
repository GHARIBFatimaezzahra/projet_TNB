import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable, of } from 'rxjs';
  import { tap } from 'rxjs/operators';
  
  interface CacheItem {
    data: any;
    timestamp: number;
    ttl: number;
  }
  
  @Injectable()
  export class CacheInterceptor implements NestInterceptor {
    private cache = new Map<string, CacheItem>();
    private readonly defaultTTL = 300000; // 5 minutes
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const cacheKey = this.generateCacheKey(request);
      
      // Ne mettre en cache que les requêtes GET
      if (request.method !== 'GET') {
        return next.handle();
      }
  
      // Ne pas mettre en cache certaines routes
      if (!this.shouldCache(request.url)) {
        return next.handle();
      }
  
      // Vérifier le cache
      const cachedItem = this.cache.get(cacheKey);
      if (cachedItem && !this.isExpired(cachedItem)) {
        return of(cachedItem.data);
      }
  
      // Exécuter la requête et mettre en cache
      return next.handle().pipe(
        tap((data) => {
          const ttl = this.getTTLForRoute(request.url);
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            ttl,
          });
          
          // Nettoyer le cache périodiquement
          this.cleanExpiredItems();
        }),
      );
    }
  
    private generateCacheKey(request: any): string {
      const { url, user } = request;
      const userId = user?.id || 'anonymous';
      return `${userId}:${url}`;
    }
  
    private shouldCache(url: string): boolean {
      const cacheableRoutes = [
        '/users/statistics',
        '/parcelles/statistics', 
        '/proprietaires/statistics',
        '/dashboard',
        '/configurations',
      ];
      
      return cacheableRoutes.some(route => url.includes(route));
    }
  
    private getTTLForRoute(url: string): number {
      if (url.includes('/statistics')) {
        return 300000; // 5 minutes pour les statistiques
      }
      if (url.includes('/dashboard')) {
        return 180000; // 3 minutes pour le dashboard
      }
      if (url.includes('/configurations')) {
        return 600000; // 10 minutes pour les configurations
      }
      
      return this.defaultTTL;
    }
  
    private isExpired(item: CacheItem): boolean {
      return Date.now() - item.timestamp > item.ttl;
    }
  
    private cleanExpiredItems(): void {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > item.ttl) {
          this.cache.delete(key);
        }
      }
    }
  }