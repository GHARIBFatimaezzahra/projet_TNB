import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { retry, retryWhen, delay, take, concatMap, throwError, timer, Observable } from 'rxjs';
import { NotificationService } from '../services/notification/notification.service';

export const retryInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const notificationService = inject(NotificationService);

  // Ne pas retry certaines requêtes
  if (shouldSkipRetry(req)) {
    return next(req);
  }

  const maxRetries = getMaxRetries(req);
  const baseRetryDelay = getRetryDelay(req);

  return next(req).pipe(
    retryWhen(errors => 
      errors.pipe(
        take(maxRetries),
        concatMap((error: HttpErrorResponse, index) => {
          // Ne retry que pour certains codes d'erreur
          if (shouldRetryError(error)) {
            const delayTime = baseRetryDelay * Math.pow(2, index); // Backoff exponentiel
            
            if (index === 0) {
              notificationService.info(
                `Tentative de reconnexion... (${index + 1}/${maxRetries})`,
                'Connexion'
              );
            }
            
            return timer(delayTime);
          } else {
            // Ne pas retry pour les autres erreurs
            return throwError(() => error);
          }
        })
      )
    )
  );
};

function shouldSkipRetry(req: HttpRequest<unknown>): boolean {
  // Headers pour contrôler le retry
  if (req.headers.has('X-Skip-Retry')) {
    return true;
  }

  // Ne pas retry certains endpoints
  const skipEndpoints = [
    '/auth/login',
    '/auth/logout',
    '/upload',
    '/download'
  ];
  
  return skipEndpoints.some(endpoint => req.url.includes(endpoint));
}

function shouldRetryError(error: HttpErrorResponse): boolean {
  // Retry seulement pour les erreurs de réseau et les erreurs serveur temporaires
  const retryableStatuses = [0, 408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(error.status);
}

function getMaxRetries(req: HttpRequest<unknown>): number {
  // Headers personnalisés pour contrôler le nombre de retry
  const customRetries = req.headers.get('X-Max-Retries');
  if (customRetries) {
    return parseInt(customRetries, 10);
  }

  // Retry selon le type de requête
  if (req.method === 'GET') {
    return 3; // Plus de retry pour les lectures
  }
  
  if (req.method === 'POST' || req.method === 'PUT') {
    return 1; // Moins de retry pour les écritures
  }

  return 2; // Défaut
}

function getRetryDelay(req: HttpRequest<unknown>): number {
  // Headers personnalisés pour contrôler le délai
  const customDelay = req.headers.get('X-Retry-Delay');
  if (customDelay) {
    return parseInt(customDelay, 10);
  }

  // Délai selon l'endpoint
  if (req.url.includes('/dashboard')) {
    return 1000; // 1 seconde pour le dashboard
  }
  
  if (req.url.includes('/import') || req.url.includes('/export')) {
    return 5000; // 5 secondes pour les opérations longues
  }

  return 2000; // 2 secondes par défaut
}