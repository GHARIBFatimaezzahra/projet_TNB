import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private loadingService: LoadingService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Hide loading on error
        this.loadingService.hideAll();

        let errorMessage = 'Une erreur inattendue s\'est produite';
        let errorTitle = 'Erreur';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
          errorTitle = 'Erreur réseau';
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorTitle = 'Requête invalide';
              errorMessage = error.error?.message || 'Données envoyées invalides';
              break;
            case 401:
              errorTitle = 'Non autorisé';
              errorMessage = 'Session expirée, veuillez vous reconnecter';
              break;
            case 403:
              errorTitle = 'Accès refusé';
              errorMessage = 'Vous n\'avez pas les permissions nécessaires';
              break;
            case 404:
              errorTitle = 'Ressource introuvable';
              errorMessage = 'La ressource demandée n\'existe pas';
              break;
            case 422:
              errorTitle = 'Données invalides';
              errorMessage = this.formatValidationErrors(error.error?.errors);
              break;
            case 500:
              errorTitle = 'Erreur serveur';
              errorMessage = 'Erreur interne du serveur';
              break;
            case 503:
              errorTitle = 'Service indisponible';
              errorMessage = 'Le service est temporairement indisponible';
              break;
            default:
              errorMessage = error.error?.message || errorMessage;
          }
        }

        // Don't show notification for 401 errors (handled by auth interceptor)
        if (error.status !== 401) {
          this.notificationService.error(errorTitle, errorMessage);
        }

        return throwError(() => error);
      })
    );
  }

  private formatValidationErrors(errors: any): string {
    if (!errors || typeof errors !== 'object') {
      return 'Erreurs de validation';
    }

    const errorMessages = Object.keys(errors).map(key => {
      const fieldErrors = Array.isArray(errors[key]) ? errors[key] : [errors[key]];
      return `${key}: ${fieldErrors.join(', ')}`;
    });

    return errorMessages.join('\n');
  }
}