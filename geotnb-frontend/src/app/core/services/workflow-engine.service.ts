import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EtatValidation, UserProfil, WorkflowTransition } from '../models/database.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WorkflowEngineService {
  
  // Définition des transitions de workflow
  private workflowTransitions: WorkflowTransition[] = [
    {
      from_state: EtatValidation.BROUILLON,
      to_state: EtatValidation.VALIDE,
      required_roles: [UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG, UserProfil.AGENT_FISCAL],
      validation_rules: [
        'surface_imposable_required',
        'geometry_valid',
        'proprietaires_required',
        'zonage_required'
      ]
    },
    {
      from_state: EtatValidation.VALIDE,
      to_state: EtatValidation.PUBLIE,
      required_roles: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL],
      validation_rules: [
        'montant_tnb_calculated',
        'fiscal_data_complete'
      ]
    },
    {
      from_state: EtatValidation.VALIDE,
      to_state: EtatValidation.BROUILLON,
      required_roles: [UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG],
      validation_rules: []
    },
    {
      from_state: EtatValidation.PUBLIE,
      to_state: EtatValidation.ARCHIVE,
      required_roles: [UserProfil.ADMIN],
      validation_rules: ['archive_reason_required']
    },
    {
      from_state: EtatValidation.PUBLIE,
      to_state: EtatValidation.VALIDE,
      required_roles: [UserProfil.ADMIN],
      validation_rules: ['unpublish_reason_required']
    }
  ];

  private currentWorkflowState = new BehaviorSubject<EtatValidation | null>(null);
  public workflowState$ = this.currentWorkflowState.asObservable();

  constructor(private authService: AuthService) {}

  // Obtenir les transitions possibles pour un état donné
  getAvailableTransitions(currentState: EtatValidation): WorkflowTransition[] {
    const user = this.authService.currentUser;
    if (!user) return [];

    return this.workflowTransitions.filter(transition => 
      transition.from_state === currentState &&
      transition.required_roles.includes(user.profil)
    );
  }

  // Vérifier si une transition est autorisée
  canTransition(fromState: EtatValidation, toState: EtatValidation): boolean {
    const availableTransitions = this.getAvailableTransitions(fromState);
    return availableTransitions.some(transition => transition.to_state === toState);
  }

  // Obtenir les règles de validation pour une transition
  getValidationRules(fromState: EtatValidation, toState: EtatValidation): string[] {
    const transition = this.workflowTransitions.find(t => 
      t.from_state === fromState && t.to_state === toState
    );
    return transition?.validation_rules || [];
  }

  // Valider une parcelle selon les règles de workflow
  validateParcelleForTransition(parcelle: any, toState: EtatValidation): { valid: boolean; errors: string[] } {
    const rules = this.getValidationRules(parcelle.etat_validation, toState);
    const errors: string[] = [];

    rules.forEach(rule => {
      switch (rule) {
        case 'surface_imposable_required':
          if (!parcelle.surface_imposable || parcelle.surface_imposable <= 0) {
            errors.push('La surface imposable est obligatoire et doit être supérieure à 0');
          }
          break;

        case 'geometry_valid':
          if (!parcelle.geometry || !this.isValidGeometry(parcelle.geometry)) {
            errors.push('La géométrie de la parcelle est invalide ou manquante');
          }
          break;

        case 'proprietaires_required':
          if (!parcelle.proprietaires || parcelle.proprietaires.length === 0) {
            errors.push('Au moins un propriétaire doit être associé à la parcelle');
          }
          break;

        case 'zonage_required':
          if (!parcelle.zonage) {
            errors.push('Le zonage urbanistique est obligatoire');
          }
          break;

        case 'montant_tnb_calculated':
          if (parcelle.montant_total_tnb === undefined || parcelle.montant_total_tnb < 0) {
            errors.push('Le montant TNB doit être calculé');
          }
          break;

        case 'fiscal_data_complete':
          if (!parcelle.prix_unitaire_m2 || !parcelle.categorie_fiscale) {
            errors.push('Les données fiscales doivent être complètes (prix unitaire, catégorie)');
          }
          break;

        case 'archive_reason_required':
          // Cette règle nécessiterait un paramètre supplémentaire
          break;

        case 'unpublish_reason_required':
          // Cette règle nécessiterait un paramètre supplémentaire
          break;
      }
    });

    return { valid: errors.length === 0, errors };
  }

  // Validation basique de géométrie
  private isValidGeometry(geometry: any): boolean {
    if (!geometry || !geometry.type || !geometry.coordinates) return false;
    
    switch (geometry.type) {
      case 'Polygon':
        return Array.isArray(geometry.coordinates) && 
               geometry.coordinates.length > 0 &&
               geometry.coordinates[0].length >= 4;
      case 'MultiPolygon':
        return Array.isArray(geometry.coordinates) &&
               geometry.coordinates.every((polygon: any) => 
                 Array.isArray(polygon) && polygon[0].length >= 4
               );
      default:
        return false;
    }
  }

  // Obtenir le prochain état recommandé
  getNextRecommendedState(currentState: EtatValidation): EtatValidation | null {
    switch (currentState) {
      case EtatValidation.BROUILLON:
        return EtatValidation.VALIDE;
      case EtatValidation.VALIDE:
        return EtatValidation.PUBLIE;
      default:
        return null;
    }
  }
  
  // Obtenir la description d'un état
  getStateDescription(state: EtatValidation): string {
    switch (state) {
      case EtatValidation.BROUILLON:
        return 'Parcelle en cours de saisie, modifications libres autorisées';
      case EtatValidation.VALIDE:
        return 'Parcelle validée techniquement, prête pour publication';
      case EtatValidation.PUBLIE:
        return 'Parcelle publiée officiellement, soumise à la TNB';
      case EtatValidation.ARCHIVE:
        return 'Parcelle archivée, plus active dans le système';
      default:
        return 'État inconnu';
    }
  }

  // Obtenir les permissions par état
  getStatePermissions(state: EtatValidation): { canEdit: boolean; canDelete: boolean; canGenerateFiche: boolean } {
    const user = this.authService.currentUser;
    if (!user) return { canEdit: false, canDelete: false, canGenerateFiche: false };

    switch (state) {
      case EtatValidation.BROUILLON:
        return {
          canEdit: [UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG, UserProfil.AGENT_FISCAL].includes(user.profil),
          canDelete: [UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG].includes(user.profil),
          canGenerateFiche: false
        };
      
      case EtatValidation.VALIDE:
        return {
          canEdit: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL].includes(user.profil),
          canDelete: user.profil === UserProfil.ADMIN,
          canGenerateFiche: false
        };
      
      case EtatValidation.PUBLIE:
        return {
          canEdit: user.profil === UserProfil.ADMIN,
          canDelete: false,
          canGenerateFiche: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL].includes(user.profil)
        };
      
      case EtatValidation.ARCHIVE:
        return {
          canEdit: false,
          canDelete: false,
          canGenerateFiche: false
        };
      
      default:
        return { canEdit: false, canDelete: false, canGenerateFiche: false };
    }
  }

  // Mettre à jour l'état du workflow
  setCurrentState(state: EtatValidation): void {
    this.currentWorkflowState.next(state);
  }

  // Obtenir l'historique des transitions (à implémenter avec l'API)
  getStateHistory(parcelleId: number): Observable<any[]> {
    // Cette méthode ferait appel à l'API pour récupérer l'historique
    // depuis la table journal_actions
    return new Observable(observer => {
      // Implémentation avec ApiService
      observer.next([]);
      observer.complete();
    });
  }
}