import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'danger' | 'warning' | 'info';
  icon?: string;
}

export interface ConfirmationResult {
  confirmed: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationSubject = new Subject<{
    options: ConfirmationOptions;
    callback: (result: ConfirmationResult) => void;
  }>();

  public confirmation$ = this.confirmationSubject.asObservable();

  /**
   * Affiche une boîte de dialogue de confirmation
   */
  confirm(options: ConfirmationOptions): Observable<ConfirmationResult> {
    return new Observable<ConfirmationResult>(observer => {
      const defaultOptions: ConfirmationOptions = {
        title: 'Confirmation',
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        type: 'default',
        ...options
      };

      this.confirmationSubject.next({
        options: defaultOptions,
        callback: (result: ConfirmationResult) => {
          observer.next(result);
          observer.complete();
        }
      });
    });
  }

  /**
   * Confirmation de suppression
   */
  confirmDelete(itemName?: string): Observable<ConfirmationResult> {
    const message = itemName 
      ? `Êtes-vous sûr de vouloir supprimer "${itemName}" ?`
      : 'Êtes-vous sûr de vouloir supprimer cet élément ?';

    return this.confirm({
      title: 'Confirmer la suppression',
      message: message + ' Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger',
      icon: 'delete'
    });
  }

  /**
   * Confirmation de sauvegarde
   */
  confirmSave(): Observable<ConfirmationResult> {
    return this.confirm({
      title: 'Sauvegarder les modifications',
      message: 'Voulez-vous sauvegarder les modifications apportées ?',
      confirmText: 'Sauvegarder',
      cancelText: 'Annuler',
      type: 'info',
      icon: 'save'
    });
  }

  /**
   * Confirmation de navigation avec modifications non sauvegardées
   */
  confirmUnsavedChanges(): Observable<ConfirmationResult> {
    return this.confirm({
      title: 'Modifications non sauvegardées',
      message: 'Vous avez des modifications non sauvegardées. Voulez-vous quitter sans sauvegarder ?',
      confirmText: 'Quitter sans sauvegarder',
      cancelText: 'Rester sur la page',
      type: 'warning',
      icon: 'warning'
    });
  }

  /**
   * Confirmation d'export
   */
  confirmExport(format: string, itemCount?: number): Observable<ConfirmationResult> {
    const message = itemCount 
      ? `Exporter ${itemCount} élément(s) au format ${format.toUpperCase()} ?`
      : `Exporter au format ${format.toUpperCase()} ?`;

    return this.confirm({
      title: 'Confirmer l\'export',
      message,
      confirmText: 'Exporter',
      cancelText: 'Annuler',
      type: 'info',
      icon: 'download'
    });
  }
}