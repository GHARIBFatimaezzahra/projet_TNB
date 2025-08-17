import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const loadingService = inject(LoadingService);
  
  // Ne pas afficher le loading pour certaines requêtes
  if (shouldSkipLoading(req)) {
    return next(req);
  }

  // Démarrer le loading
  const loadingMessage = getLoadingMessage(req);
  loadingService.show(loadingMessage);

  return next(req).pipe(
    finalize(() => {
      // Arrêter le loading à la fin de la requête
      loadingService.hide();
    })
  );
};

function shouldSkipLoading(req: HttpRequest<unknown>): boolean {
  // Headers personnalisés pour contrôler le loading
  if (req.headers.has('X-Skip-Loading')) {
    return true;
  }

  // Ne pas afficher le loading pour certains endpoints
  const skipEndpoints = [
    '/auth/verify',
    '/auth/refresh',
    '/dashboard/stats', // Requêtes fréquentes
    '/notifications'
  ];
  
  return skipEndpoints.some(endpoint => req.url.includes(endpoint));
}

function getLoadingMessage(req: HttpRequest<unknown>): string {
  // Messages personnalisés selon l'endpoint
  if (req.url.includes('/upload')) {
    return 'Téléchargement en cours...';
  }
  
  if (req.url.includes('/export')) {
    return 'Génération du fichier...';
  }
  
  if (req.url.includes('/import')) {
    return 'Import des données...';
  }
  
  if (req.url.includes('/generate')) {
    return 'Génération en cours...';
  }

  // Message par méthode HTTP
  switch (req.method) {
    case 'POST':
      return 'Création en cours...';
    case 'PUT':
    case 'PATCH':
      return 'Mise à jour en cours...';
    case 'DELETE':
      return 'Suppression en cours...';
    default:
      return 'Chargement en cours...';
  }
}
