import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notification: NotificationService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue';
        
        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Erreur: ${error.error.message}`;
        } else {
          // Erreur côté serveur
          errorMessage = error.error?.message || error.message || errorMessage;
          
          switch (error.status) {
            case 400:
              this.handleBadRequest(error);
              break;
            case 401:
              this.handleUnauthorized(error);
              break;
            case 403:
              this.handleForbidden(error);
              break;
            case 404:
              this.handleNotFound(error);
              break;
            case 409:
              this.handleConflict(error);
              break;
            case 500:
              this.handleServerError(error);
              break;
            default:
              this.handleGenericError(error);
          }
        }

        console.error('HTTP Error:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private handleBadRequest(error: HttpErrorResponse): void {
    const message = error.error?.message || 'Requête incorrecte';
    this.notification.showError(message);
  }

  private handleUnauthorized(error: HttpErrorResponse): void {
    // La déconnexion est gérée par l'intercepteur d'authentification
    this.notification.showError('Session expirée. Veuillez vous reconnecter.');
  }

  private handleForbidden(error: HttpErrorResponse): void {
    this.notification.showError('Accès refusé. Droits insuffisants.');
    this.router.navigate(['/access-denied']);
  }

  private handleNotFound(error: HttpErrorResponse): void {
    const message = error.error?.message || 'Ressource non trouvée';
    this.notification.showError(message);
  }

  private handleConflict(error: HttpErrorResponse): void {
    const message = error.error?.message || 'Conflit de données';
    this.notification.showError(message);
  }

  private handleServerError(error: HttpErrorResponse): void {
    this.notification.showError('Erreur serveur. Veuillez réessayer plus tard.');
  }

  private handleGenericError(error: HttpErrorResponse): void {
    const message = error.error?.message || 'Une erreur inattendue est survenue';
    this.notification.showError(message);
  }
}