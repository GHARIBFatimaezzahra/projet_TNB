import { inject } from '@angular/core';
import { type CanDeactivateFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ConfirmationService } from '../services/notification/confirmation.service';

// Interface pour les composants qui ont des modifications non sauvegardées
export interface ComponentWithUnsavedChanges {
  hasUnsavedChanges(): boolean;
  getUnsavedChangesMessage?(): string;
  saveChanges?(): Observable<boolean>;
  discardChanges?(): void;
}

// Interface étendue pour les composants avec plus de contrôle
export interface AdvancedUnsavedChangesComponent extends ComponentWithUnsavedChanges {
  getChangedFields?(): string[];
  canAutoSave?(): boolean;
  performAutoSave?(): Observable<boolean>;
  getUnsavedChangesCount?(): number;
}

export const unsavedChangesGuard: CanDeactivateFn<ComponentWithUnsavedChanges> = (
  component: ComponentWithUnsavedChanges
) => {
  const confirmationService = inject(ConfirmationService);

  // Si pas de modifications, autoriser la navigation
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  // Obtenir le message personnalisé ou utiliser le message par défaut
  const message = component.getUnsavedChangesMessage?.() || 
    'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter cette page ?';

  // Demander confirmation à l'utilisateur
  return confirmationService.confirm({
    title: 'Modifications non sauvegardées',
    message,
    confirmText: 'Quitter sans sauvegarder',
    cancelText: 'Rester sur la page',
    type: 'warning',
    icon: 'warning'
  }).pipe(
    map(result => result.confirmed)
  );
};

// Guard avancé avec options de sauvegarde
export const advancedUnsavedChangesGuard: CanDeactivateFn<AdvancedUnsavedChangesComponent> = (
  component: AdvancedUnsavedChangesComponent
) => {
  const confirmationService = inject(ConfirmationService);

  // Si pas de modifications, autoriser la navigation
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  // Construire un message détaillé
  const changedFields = component.getChangedFields?.() || [];
  const changesCount = component.getUnsavedChangesCount?.() || 0;
  
  let message = 'Vous avez des modifications non sauvegardées.';
  
  if (changesCount > 0) {
    message += ` (${changesCount} modification${changesCount > 1 ? 's' : ''})`;
  }
  
  if (changedFields.length > 0) {
    message += `\n\nChamps modifiés: ${changedFields.join(', ')}`;
  }
  
  message += '\n\nQue souhaitez-vous faire ?';

  // Vérifier si la sauvegarde automatique est possible
  const canAutoSave = component.canAutoSave?.() && component.saveChanges;

  return confirmationService.confirm({
    title: 'Modifications non sauvegardées',
    message,
    confirmText: canAutoSave ? 'Sauvegarder et quitter' : 'Quitter sans sauvegarder',
    cancelText: 'Rester sur la page',
    type: 'warning',
    icon: 'warning'
  }).pipe(
    switchMap(result => {
      if (!result.confirmed) {
        return of(false);
      }

      // Si l'utilisateur confirme et que la sauvegarde automatique est possible
      if (canAutoSave && component.saveChanges) {
        return component.saveChanges().pipe(
          map(saveSuccess => {
            if (!saveSuccess) {
              // Si la sauvegarde échoue, demander confirmation pour quitter quand même
              return confirmationService.confirm({
                title: 'Erreur de sauvegarde',
                message: 'La sauvegarde a échoué. Voulez-vous quitter sans sauvegarder ?',
                confirmText: 'Quitter quand même',
                cancelText: 'Rester sur la page',
                type: 'danger'
              }).pipe(map(confirmResult => confirmResult.confirmed));
            }
            return true;
          }),
          switchMap(result => result instanceof Observable ? result : of(result))
        );
      }

      // Supprimer les modifications si le composant le permet
      if (component.discardChanges) {
        component.discardChanges();
      }

      return of(true);
    })
  );
};

// Version simplifiée pour les formulaires Angular
export const formUnsavedChangesGuard: CanDeactivateFn<{ 
  isDirty?: boolean; 
  isSubmitting?: boolean;
  isValid?: boolean;
}> = (component) => {
  const confirmationService = inject(ConfirmationService);

  // Si le formulaire est en cours de soumission, ne pas autoriser la navigation
  if (component.isSubmitting) {
    return false;
  }

  // Si le formulaire n'est pas modifié, autoriser la navigation
  if (!component.isDirty) {
    return true;
  }

  return confirmationService.confirm({
    title: 'Formulaire non sauvegardé',
    message: 'Vous avez des modifications non sauvegardées dans ce formulaire. Voulez-vous vraiment quitter ?',
    confirmText: 'Quitter sans sauvegarder',
    cancelText: 'Continuer l\'édition',
    type: 'warning',
    icon: 'edit'
  }).pipe(
    map(result => result.confirmed)
  );
};

// Guard spécialisé pour les composants avec sauvegarde automatique
export const autoSaveUnsavedChangesGuard: CanDeactivateFn<{
  hasUnsavedChanges(): boolean;
  performAutoSave(): Observable<boolean>;
  canLeaveAfterAutoSave?(): boolean;
}> = (component) => {
  const confirmationService = inject(ConfirmationService);

  if (!component.hasUnsavedChanges()) {
    return true;
  }

  // Tenter la sauvegarde automatique
  return component.performAutoSave().pipe(
    switchMap(saveSuccess => {
      if (saveSuccess) {
        // Vérifier si le composant autorise la navigation après sauvegarde
        const canLeave = component.canLeaveAfterAutoSave?.() ?? true;
        return of(canLeave);
      } else {
        // Si la sauvegarde automatique échoue, demander confirmation
        return confirmationService.confirm({
          title: 'Sauvegarde automatique échouée',
          message: 'Impossible de sauvegarder automatiquement vos modifications. Voulez-vous quitter sans sauvegarder ?',
          confirmText: 'Quitter sans sauvegarder',
          cancelText: 'Rester pour corriger',
          type: 'danger',
          icon: 'error'
        }).pipe(
          map(result => result.confirmed)
        );
      }
    })
  );
};

// Guard pour les composants avec données critiques
export const criticalDataUnsavedChangesGuard: CanDeactivateFn<ComponentWithUnsavedChanges> = (
  component: ComponentWithUnsavedChanges
) => {
  const confirmationService = inject(ConfirmationService);

  if (!component.hasUnsavedChanges()) {
    return true;
  }

  // Double confirmation pour les données critiques
  return confirmationService.confirm({
    title: '⚠️ ATTENTION - Données critiques',
    message: 'Vous êtes sur le point de perdre des modifications importantes.\n\nÊtes-vous absolument certain de vouloir quitter sans sauvegarder ?',
    confirmText: 'Oui, quitter définitivement',
    cancelText: 'Non, rester et sauvegarder',
    type: 'danger',
    icon: 'warning'
  }).pipe(
    switchMap(firstResult => {
      if (!firstResult.confirmed) {
        return of(false);
      }

      // Deuxième confirmation
      return confirmationService.confirm({
        title: 'Confirmation finale',
        message: 'Dernière chance de sauvegarder vos modifications.\n\nConfirmez-vous définitivement l\'abandon ?',
        confirmText: 'Oui, abandonner définitivement',
        cancelText: 'Annuler et sauvegarder',
        type: 'danger'
      }).pipe(
        map(secondResult => secondResult.confirmed)
      );
    })
  );
};

// Utilitaire pour créer des guards personnalisés
export const createCustomUnsavedChangesGuard = (
  options: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'default' | 'danger' | 'warning' | 'info';
    requireDoubleConfirmation?: boolean;
    allowAutoSave?: boolean;
  }
): CanDeactivateFn<ComponentWithUnsavedChanges> => {
  return (component: ComponentWithUnsavedChanges) => {
    const confirmationService = inject(ConfirmationService);

    if (!component.hasUnsavedChanges()) {
      return true;
    }

    const confirmationOptions = {
      title: options.title || 'Modifications non sauvegardées',
      message: options.message || 'Voulez-vous vraiment quitter sans sauvegarder ?',
      confirmText: options.confirmText || 'Quitter sans sauvegarder',
      cancelText: options.cancelText || 'Rester sur la page',
      type: options.type || 'warning' as const
    };

    const confirmation$ = confirmationService.confirm(confirmationOptions);

    if (options.requireDoubleConfirmation) {
      return confirmation$.pipe(
        switchMap(firstResult => {
          if (!firstResult.confirmed) {
            return of(false);
          }
          return confirmationService.confirm({
            ...confirmationOptions,
            title: 'Confirmation finale',
            message: 'Êtes-vous vraiment sûr ?'
          }).pipe(
            map(secondResult => secondResult.confirmed)
          );
        })
      );
    }

    return confirmation$.pipe(
      map(result => result.confirmed)
    );
  };
};