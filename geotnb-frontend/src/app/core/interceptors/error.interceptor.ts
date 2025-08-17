import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification/notification.service';
import { ApiErrorHandlerService } from '../services/api/api-error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const errorHandler = inject(ApiErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Gérer les erreurs spécifiques
      switch (error.status) {
        case 401:
          // Token expiré ou invalide - rediriger vers login
          router.navigate(['/auth/login']);
          break;
        
        case 403:
          // Accès interdit - rediriger vers page d'erreur
          router.navigate(['/unauthorized']);
          break;
        
        case 404:
          // Ressource non trouvée - ne pas rediriger automatiquement
          break;
        
        case 0:
          // Problème de réseau
          notificationService.error(
            'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
            'Erreur de connexion'
          );
          break;
        
        case 500:
        case 502:
        case 503:
          // Erreurs serveur
          notificationService.error(
            'Le serveur rencontre des difficultés. Veuillez réessayer plus tard.',
            'Erreur serveur'
          );
          break;
      }

      // Traiter l'erreur avec le service dédié
      const apiError = errorHandler.handleError(error, false); // Pas de notification car déjà gérée ci-dessus
      
      // Retourner l'erreur formatée
      return throwError(() => apiError);
    })
  );
};