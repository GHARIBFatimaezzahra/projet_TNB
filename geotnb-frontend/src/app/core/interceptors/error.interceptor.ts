import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => this.buildErrorResponse(error));
      })
    );
  }

  private handleError(error: HttpErrorResponse): void {
    switch (error.status) {
      case 401:
        this.handle401Error();
        break;
      case 403:
        this.handle403Error();
        break;
      case 404:
        this.handle404Error(error);
        break;
      case 422:
        this.handle422Error(error);
        break;
      case 500:
        this.handle500Error();
        break;
      case 0:
        this.handleNetworkError();
        break;
      default:
        this.handleGenericError(error);
    }
  }

  private handle401Error(): void {
    this.notificationService.error('Session expirée. Veuillez vous reconnecter.');
    // AuthService will handle logout through JWT interceptor
  }

  private handle403Error(): void {
    this.notificationService.error('Accès refusé pour cette action.');
  }

  private handle404Error(error: HttpErrorResponse): void {
    if (!error.url?.includes('/api/')) {
      this.router.navigate(['/404']);
    }
  }

  private handle422Error(error: HttpErrorResponse): void {
    if (error.error?.errors) {
      const validationErrors = this.extractValidationErrors(error.error.errors);
      validationErrors.forEach(errorMsg => {
        this.notificationService.error(errorMsg);
      });
    } else if (error.error?.message) {
      this.notificationService.error(error.error.message);
    }
  }

  private handle500Error(): void {
    this.notificationService.error(
      'Une erreur interne s\'est produite. Veuillez réessayer plus tard.',
      'Erreur serveur'
    );
  }

  private handleNetworkError(): void {
    this.notificationService.error(
      'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
      'Erreur de connexion'
    );
  }

  private handleGenericError(error: HttpErrorResponse): void {
    const message = error.error?.message || 'Une erreur inattendue s\'est produite.';
    this.notificationService.error(message);
  }

  private extractValidationErrors(errors: any): string[] {
    const errorMessages: string[] = [];
    
    if (typeof errors === 'object') {
      Object.keys(errors).forEach(field => {
        const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
        fieldErrors.forEach((errorMsg: string) => {
          errorMessages.push(`${field}: ${errorMsg}`);
        });
      });
    } else if (Array.isArray(errors)) {
      errorMessages.push(...errors);
    }
    
    return errorMessages;
  }

  private buildErrorResponse(error: HttpErrorResponse): any {
    return {
      ...error,
      friendlyMessage: this.getFriendlyMessage(error),
      timestamp: new Date().toISOString()
    };
  }

  private getFriendlyMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400: return 'Données invalides envoyées au serveur';
      case 401: return 'Authentification requise';
      case 403: return 'Accès refusé';
      case 404: return 'Ressource non trouvée';
      case 422: return 'Données de validation incorrectes';
      case 500: return 'Erreur interne du serveur';
      case 503: return 'Service temporairement indisponible';
      default: return 'Une erreur inattendue s\'est produite';
    }
  }
}