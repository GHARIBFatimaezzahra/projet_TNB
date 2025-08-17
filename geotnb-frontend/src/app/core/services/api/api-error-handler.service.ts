import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { NotificationService } from '../notification/notification.service';

export interface ApiError {
  status: number;
  message: string;
  details?: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ApiErrorHandlerService {
  constructor(private notificationService: NotificationService) {}

  /**
   * Gère les erreurs API et affiche les notifications appropriées
   */
  handleError(error: HttpErrorResponse, showNotification = true): ApiError {
    const apiError: ApiError = {
      status: error.status,
      message: this.getErrorMessage(error),
      details: error.error,
      timestamp: new Date()
    };

    // Log de l'erreur
    console.error('API Error:', apiError);

    // Affichage de la notification si demandé
    if (showNotification) {
      this.showErrorNotification(apiError);
    }

    return apiError;
  }

  /**
   * Gestion silencieuse des erreurs (sans notification)
   */
  handleSilentError<T>(error: HttpErrorResponse, fallbackValue: T): Observable<T> {
    this.handleError(error, false);
    return of(fallbackValue);
  }

  /**
   * Extrait le message d'erreur approprié
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      return `Erreur de connexion: ${error.error.message}`;
    }

    // Erreur côté serveur
    switch (error.status) {
      case 0:
        return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      case 400:
        return error.error?.message || 'Requête invalide. Vérifiez les données saisies.';
      case 401:
        return 'Session expirée. Veuillez vous reconnecter.';
      case 403:
        return 'Vous n\'avez pas les permissions nécessaires pour cette action.';
      case 404:
        return 'Ressource non trouvée. Elle a peut-être été supprimée.';
      case 409:
        return error.error?.message || 'Conflit détecté. La ressource existe déjà.';
      case 422:
        return this.formatValidationErrors(error.error);
      case 429:
        return 'Trop de requêtes. Veuillez patienter avant de réessayer.';
      case 500:
        return 'Erreur interne du serveur. L\'équipe technique a été notifiée.';
      case 502:
        return 'Service temporairement indisponible. Veuillez réessayer.';
      case 503:
        return 'Service en maintenance. Veuillez réessayer plus tard.';
      default:
        return error.error?.message || `Erreur ${error.status}: ${error.statusText}`;
    }
  }

  /**
   * Formate les erreurs de validation
   */
  private formatValidationErrors(errorData: any): string {
    if (errorData?.errors && Array.isArray(errorData.errors)) {
      const messages = errorData.errors.map((err: any) => err.message || err).join(', ');
      return `Erreurs de validation: ${messages}`;
    }
    
    if (errorData?.message) {
      return errorData.message;
    }

    return 'Données invalides. Veuillez corriger les erreurs et réessayer.';
  }

  /**
   * Affiche la notification d'erreur appropriée
   */
  private showErrorNotification(apiError: ApiError): void {
    switch (apiError.status) {
      case 401:
        this.notificationService.error(apiError.message, 'Session expirée');
        break;
      case 403:
        this.notificationService.warning(apiError.message, 'Accès interdit');
        break;
      case 404:
        this.notificationService.warning(apiError.message, 'Non trouvé');
        break;
      case 422:
        this.notificationService.warning(apiError.message, 'Données invalides');
        break;
      case 500:
      case 502:
      case 503:
        this.notificationService.error(apiError.message, 'Erreur serveur');
        break;
      default:
        this.notificationService.error(apiError.message, 'Erreur');
    }
  }
}