import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { NotificationService } from '../services/notification.service';

// Interface que les composants doivent implémenter pour utiliser ce guard
export interface ComponentWithUnsavedChanges {
  hasUnsavedChanges(): boolean;
  saveChanges?(): Observable<boolean>;
}

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<ComponentWithUnsavedChanges> {

  constructor(private notificationService: NotificationService) {}

  canDeactivate(
    component: ComponentWithUnsavedChanges
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Si le composant n'a pas de modifications non sauvegardées, permettre la navigation
    if (!component.hasUnsavedChanges()) {
    return true;
  }

    // Si le composant a une méthode saveChanges, proposer de sauvegarder
    if (component.saveChanges) {
      return this.showSaveDialog(component);
    }

    // Sinon, juste demander confirmation pour quitter sans sauvegarder
    return this.showConfirmDialog();
  }

  // Dialogue avec option de sauvegarde
  private showSaveDialog(component: ComponentWithUnsavedChanges): Observable<boolean> {
    return new Observable<boolean>(observer => {
      // Créer un dialogue personnalisé avec 3 options
      const dialogRef = this.notificationService.confirm({
        title: 'Modifications non sauvegardées',
        message: 'Vous avez des modifications non sauvegardées. Que souhaitez-vous faire ?',
        type: 'warning'
      });

      // Pour ce guard, nous utiliserons un dialogue simple puis gérerons la sauvegarde
      dialogRef.subscribe(result => {
        if (result) {
          // L'utilisateur veut quitter, demander s'il veut sauvegarder d'abord
          this.askToSave(component).subscribe(canLeave => {
            observer.next(canLeave);
        observer.complete();
          });
        } else {
          // L'utilisateur veut rester sur la page
        observer.next(false);
        observer.complete();
        }
      });
    });
  }

  // Demander si l'utilisateur veut sauvegarder avant de quitter
  private askToSave(component: ComponentWithUnsavedChanges): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.notificationService.confirm({
        title: 'Sauvegarder les modifications',
        message: 'Voulez-vous sauvegarder vos modifications avant de quitter ?',
        confirmText: 'Sauvegarder',
        cancelText: 'Quitter sans sauvegarder',
        type: 'info'
      }).subscribe(shouldSave => {
        if (shouldSave && component.saveChanges) {
          // Tenter la sauvegarde
          component.saveChanges().subscribe({
            next: (success) => {
              if (success) {
                this.notificationService.showSuccess('Modifications sauvegardées avec succès');
                observer.next(true);
              } else {
                this.notificationService.showError('Erreur lors de la sauvegarde');
                observer.next(false);
              }
              observer.complete();
            },
            error: (error) => {
              this.notificationService.showError('Erreur lors de la sauvegarde: ' + error.message);
              observer.next(false);
              observer.complete();
            }
          });
        } else {
          // Quitter sans sauvegarder
          observer.next(true);
          observer.complete();
        }
      });
    });
  }

  // Dialogue de confirmation simple
  private showConfirmDialog(): Observable<boolean> {
    return this.notificationService.confirm({
      title: 'Modifications non sauvegardées',
      message: 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter cette page ?',
      confirmText: 'Quitter',
      cancelText: 'Rester',
      type: 'warning'
    });
  }
}

// Classe abstraite que les composants peuvent étendre
export abstract class ComponentWithUnsavedChangesBase implements ComponentWithUnsavedChanges {
  protected formDirty = false;
  protected originalData: any = null;

  abstract hasUnsavedChanges(): boolean;
  
  // Marquer le formulaire comme modifié
  protected markAsModified(): void {
    this.formDirty = true;
  }

  // Marquer le formulaire comme sauvegardé
  protected markAsSaved(): void {
    this.formDirty = false;
    this.updateOriginalData();
  }

  // Mettre à jour les données originales après sauvegarde
  protected updateOriginalData(): void {
    // À implémenter par les classes dérivées
  }

  // Réinitialiser les modifications
  protected resetChanges(): void {
    this.formDirty = false;
    // À implémenter par les classes dérivées pour restaurer les données originales
  }
}