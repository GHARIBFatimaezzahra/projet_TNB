// =====================================================
// COMPOSANT VALIDATION PANEL
// =====================================================

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';

// Services et modèles
import { Parcelle, EtatValidation, JournalAction } from '../../../models/parcelle.models';
import { ParcelleService } from '../../../services/parcelle.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { UserProfil } from '../../../../../core/models/database.models';
import { ConfirmationDialogComponent } from '../../../../../shared/components/ui/confirmation-dialog/confirmation-dialog.component';

// Pipes
import { DatePipe } from '@angular/common';

export interface ValidationCriteria {
  id: string;
  label: string;
  description: string;
  category: 'mandatory' | 'recommended' | 'optional';
  status: 'valid' | 'invalid' | 'warning' | 'pending';
  details?: string;
  autoCheck?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  totalCriteria: number;
  validCriteria: number;
  warnings: ValidationCriteria[];
  errors: ValidationCriteria[];
  recommendations: string[];
}

export interface WorkflowActionRequest {
  action: 'validate' | 'publish' | 'reject' | 'archive' | 'restore' | 'draft';
  comment?: string;
  reason?: string;
  scheduledDate?: Date;
  notifyUsers?: boolean;
  generateDocument?: boolean;
}

@Component({
  selector: 'app-validation-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatTabsModule,
    DatePipe
  ],
  templateUrl: './validation-panel.component.html',
  styleUrls: ['./validation-panel.component.scss']
})
export class ValidationPanelComponent implements OnInit, OnDestroy {
  @Input() parcelle: Parcelle | null = null;
  @Input() showValidationChecks = true;
  @Input() showActionHistory = true;
  @Input() autoValidate = true;

  @Output() actionExecuted = new EventEmitter<{ action: string; success: boolean; result?: any }>();
  @Output() validationCompleted = new EventEmitter<ValidationResult>();

  // Formulaires
  actionForm!: FormGroup;
  validationForm!: FormGroup;

  // État
  isValidating = false;
  isExecutingAction = false;
  validationResult: ValidationResult | null = null;
  selectedAction: string | null = null;
  actionHistory: JournalAction[] = [];

  // Critères de validation
  validationCriteria: ValidationCriteria[] = [];

  // Configuration des actions
  availableActions = [
    {
      id: 'validate',
      label: 'Valider',
      icon: 'check_circle',
      color: 'primary',
      description: 'Marquer la parcelle comme validée',
      requiredRole: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL],
      fromStates: ['Brouillon'],
      requiresComment: false,
      requiresValidation: true
    },
    {
      id: 'publish',
      label: 'Publier',
      icon: 'public',
      color: 'primary',
      description: 'Publier la parcelle validée',
      requiredRole: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL],
      fromStates: ['Valide'],
      requiresComment: false,
      requiresValidation: false
    },
    {
      id: 'reject',
      label: 'Rejeter',
      icon: 'cancel',
      color: 'warn',
      description: 'Rejeter et remettre en brouillon',
      requiredRole: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL],
      fromStates: ['Valide'],
      requiresComment: true,
      requiresValidation: false
    },
    {
      id: 'archive',
      label: 'Archiver',
      icon: 'archive',
      color: 'accent',
      description: 'Archiver la parcelle',
      requiredRole: [UserProfil.ADMIN],
      fromStates: ['Publie'],
      requiresComment: true,
      requiresValidation: false
    },
    {
      id: 'restore',
      label: 'Restaurer',
      icon: 'restore',
      color: 'primary',
      description: 'Restaurer la parcelle archivée',
      requiredRole: [UserProfil.ADMIN],
      fromStates: ['Archive'],
      requiresComment: false,
      requiresValidation: false
    },
    {
      id: 'draft',
      label: 'Remettre en brouillon',
      icon: 'edit',
      color: 'accent',
      description: 'Remettre en mode brouillon pour modification',
      requiredRole: [UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG],
      fromStates: ['Valide', 'Publie'],
      requiresComment: true,
      requiresValidation: false
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private parcelleService: ParcelleService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.initializeValidationCriteria();
    
    if (this.autoValidate && this.parcelle) {
      this.runValidation();
    }
    
    this.loadActionHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initializeForms(): void {
    this.actionForm = this.fb.group({
      action: ['', Validators.required],
      comment: [''],
      reason: [''],
      scheduledDate: [''],
      notifyUsers: [true],
      generateDocument: [false]
    });

    this.validationForm = this.fb.group({
      validateAll: [false],
      skipWarnings: [false],
      forceValidation: [false]
    });

    // Écouter les changements d'action
    this.actionForm.get('action')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(action => {
        this.onActionChanged(action);
      });
  }

  private initializeValidationCriteria(): void {
    this.validationCriteria = [
      // Critères obligatoires
      {
        id: 'reference_fonciere',
        label: 'Référence foncière',
        description: 'Référence foncière valide et unique',
        category: 'mandatory',
        status: 'pending',
        autoCheck: true
      },
      {
        id: 'geometry',
        label: 'Géométrie',
        description: 'Géométrie valide et cohérente',
        category: 'mandatory',
        status: 'pending',
        autoCheck: true
      },
      {
        id: 'surface_totale',
        label: 'Surface totale',
        description: 'Surface totale renseignée et cohérente',
        category: 'mandatory',
        status: 'pending',
        autoCheck: true
      },
      {
        id: 'zonage',
        label: 'Zonage',
        description: 'Code de zonage valide',
        category: 'mandatory',
        status: 'pending',
        autoCheck: true
      },
      {
        id: 'proprietaires',
        label: 'Propriétaires',
        description: 'Au moins un propriétaire identifié',
        category: 'mandatory',
        status: 'pending',
        autoCheck: true
      },
      
      // Critères recommandés
      {
        id: 'surface_coherence',
        label: 'Cohérence des surfaces',
        description: 'Surface imposable ≤ surface totale',
        category: 'recommended',
        status: 'pending',
        autoCheck: true
      },
      {
        id: 'calculs_fiscaux',
        label: 'Calculs fiscaux',
        description: 'Calculs TNB corrects',
        category: 'recommended',
        status: 'pending',
        autoCheck: true
      },
      {
        id: 'documents',
        label: 'Documents joints',
        description: 'Documents justificatifs présents',
        category: 'recommended',
        status: 'pending',
        autoCheck: false
      },
      
      // Critères optionnels
      {
        id: 'photos',
        label: 'Photos',
        description: 'Photos de la parcelle disponibles',
        category: 'optional',
        status: 'pending',
        autoCheck: false
      },
      {
        id: 'historique',
        label: 'Historique complet',
        description: 'Historique des modifications documenté',
        category: 'optional',
        status: 'pending',
        autoCheck: false
      }
    ];
  }

  private loadActionHistory(): void {
    if (!this.parcelle?.id) return;

    // Simuler le chargement de l'historique
    // En production, appeler le service approprié
    this.actionHistory = [
      {
        id: 1,
        action: 'CREATE',
        date_heure: new Date('2024-01-15T10:30:00'),
        utilisateur_id: 1,
        table_cible: 'parcelle',
        id_cible: this.parcelle.id,
        details: 'Création de la parcelle'
      },
      {
        id: 2,
        action: 'UPDATE',
        date_heure: new Date('2024-01-16T14:20:00'),
        utilisateur_id: 2,
        table_cible: 'parcelle',
        id_cible: this.parcelle.id,
        details: 'Mise à jour des informations géométriques'
      }
    ];
  }

  // =====================================================
  // VALIDATION
  // =====================================================

  runValidation(): void {
    if (!this.parcelle || this.isValidating) return;

    this.isValidating = true;

    // Simuler la validation (en production, appeler les services appropriés)
    setTimeout(() => {
      this.performValidationChecks();
      this.calculateValidationResult();
      this.isValidating = false;
    }, 1500);
  }

  private performValidationChecks(): void {
    if (!this.parcelle) return;

    this.validationCriteria.forEach(criteria => {
      if (criteria.autoCheck) {
        switch (criteria.id) {
          case 'reference_fonciere':
            criteria.status = this.parcelle!.reference_fonciere ? 'valid' : 'invalid';
            criteria.details = criteria.status === 'valid' ? 
              'Référence valide' : 'Référence manquante ou invalide';
            break;

          case 'geometry':
            criteria.status = this.parcelle!.geometry ? 'valid' : 'invalid';
            criteria.details = criteria.status === 'valid' ? 
              'Géométrie définie' : 'Géométrie manquante';
            break;

          case 'surface_totale':
            criteria.status = (this.parcelle!.surface_totale && this.parcelle!.surface_totale > 0) ? 'valid' : 'invalid';
            criteria.details = criteria.status === 'valid' ? 
              `Surface: ${this.parcelle!.surface_totale} m²` : 'Surface manquante ou invalide';
            break;

          case 'zonage':
            criteria.status = this.parcelle!.zonage ? 'valid' : 'invalid';
            criteria.details = criteria.status === 'valid' ? 
              `Zonage: ${this.parcelle!.zonage}` : 'Code de zonage manquant';
            break;

          case 'proprietaires':
            // Supposer qu'il y a des propriétaires si la parcelle existe
            criteria.status = 'valid';
            criteria.details = 'Propriétaires identifiés';
            break;

          case 'surface_coherence':
            const coherent = !this.parcelle!.surface_imposable || 
                           this.parcelle!.surface_imposable <= this.parcelle!.surface_totale!;
            criteria.status = coherent ? 'valid' : 'warning';
            criteria.details = coherent ? 
              'Surfaces cohérentes' : 'Surface imposable > surface totale';
            break;

          case 'calculs_fiscaux':
            criteria.status = this.parcelle!.montant_total_tnb !== undefined ? 'valid' : 'warning';
            criteria.details = criteria.status === 'valid' ? 
              'Calculs effectués' : 'Calculs à vérifier';
            break;
        }
      }
    });
  }

  private calculateValidationResult(): void {
    const totalCriteria = this.validationCriteria.length;
    const validCriteria = this.validationCriteria.filter(c => c.status === 'valid').length;
    const warnings = this.validationCriteria.filter(c => c.status === 'warning');
    const errors = this.validationCriteria.filter(c => c.status === 'invalid');

    // Calculer le score (critères obligatoires ont plus de poids)
    let score = 0;
    let maxScore = 0;

    this.validationCriteria.forEach(criteria => {
      const weight = criteria.category === 'mandatory' ? 3 : 
                    criteria.category === 'recommended' ? 2 : 1;
      maxScore += weight;
      
      if (criteria.status === 'valid') {
        score += weight;
      } else if (criteria.status === 'warning') {
        score += weight * 0.5;
      }
    });

    const scorePercentage = Math.round((score / maxScore) * 100);

    this.validationResult = {
      isValid: errors.length === 0 && warnings.filter(w => w.category === 'mandatory').length === 0,
      score: scorePercentage,
      totalCriteria,
      validCriteria,
      warnings,
      errors,
      recommendations: this.generateRecommendations(warnings, errors)
    };

    this.validationCompleted.emit(this.validationResult);
  }

  private generateRecommendations(warnings: ValidationCriteria[], errors: ValidationCriteria[]): string[] {
    const recommendations: string[] = [];

    if (errors.length > 0) {
      recommendations.push('Corriger les erreurs critiques avant de procéder à la validation');
    }

    if (warnings.length > 0) {
      recommendations.push('Vérifier les avertissements pour améliorer la qualité des données');
    }

    if (this.validationResult?.score && this.validationResult.score < 80) {
      recommendations.push('Compléter les informations manquantes pour améliorer le score de qualité');
    }

    return recommendations;
  }

  toggleCriteriaStatus(criteria: ValidationCriteria): void {
    if (!criteria.autoCheck) {
      criteria.status = criteria.status === 'valid' ? 'pending' : 'valid';
      this.calculateValidationResult();
    }
  }

  // =====================================================
  // ACTIONS DE WORKFLOW
  // =====================================================

  private onActionChanged(actionId: string): void {
    this.selectedAction = actionId;
    const action = this.availableActions.find(a => a.id === actionId);
    
    if (action) {
      // Mettre à jour les validateurs du formulaire
      const commentControl = this.actionForm.get('comment');
      if (action.requiresComment) {
        commentControl?.setValidators([Validators.required]);
      } else {
        commentControl?.clearValidators();
      }
      commentControl?.updateValueAndValidity();
    }
  }

  executeAction(): void {
    if (!this.actionForm.valid || !this.parcelle || this.isExecutingAction) return;

    const actionId = this.actionForm.get('action')?.value;
    const action = this.availableActions.find(a => a.id === actionId);
    
    if (!action) return;

    // Vérifier les permissions
    if (!this.authService.hasPermission(...action.requiredRole)) {
      this.snackBar.open('Permissions insuffisantes pour cette action', 'Fermer', { duration: 3000 });
      return;
    }

    // Vérifier la validation si requise
    if (action.requiresValidation && (!this.validationResult || !this.validationResult.isValid)) {
      this.snackBar.open('La validation doit être réussie avant cette action', 'Fermer', { duration: 3000 });
      return;
    }

    // Demander confirmation
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Confirmer l'action : ${action.label}`,
        message: `Êtes-vous sûr de vouloir ${action.description.toLowerCase()} ?`,
        confirmText: action.label,
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.performAction(action);
      }
    });
  }

  private performAction(action: any): void {
    this.isExecutingAction = true;

    const request: WorkflowActionRequest = {
      action: action.id,
      comment: this.actionForm.get('comment')?.value,
      reason: this.actionForm.get('reason')?.value,
      scheduledDate: this.actionForm.get('scheduledDate')?.value,
      notifyUsers: this.actionForm.get('notifyUsers')?.value,
      generateDocument: this.actionForm.get('generateDocument')?.value
    };

    // Appeler le service approprié selon l'action
    let serviceCall;
    switch (action.id) {
      case 'validate':
        serviceCall = this.parcelleService.validateParcelle(this.parcelle!.id);
        break;
      case 'publish':
        serviceCall = this.parcelleService.publishParcelle(this.parcelle!.id);
        break;
      case 'archive':
        serviceCall = this.parcelleService.archiveParcelle(this.parcelle!.id);
        break;
      default:
        // Pour les autres actions, utiliser une méthode générique
        serviceCall = this.parcelleService.executeWorkflowAction(this.parcelle!.id, request.action, request.comment);
    }

    serviceCall.pipe(takeUntil(this.destroy$)).subscribe({
              next: (result: any) => {
          this.snackBar.open(`${action.label} effectué avec succès`, 'Fermer', { duration: 3000 });
          this.actionExecuted.emit({ action: action.id, success: true, result });
          this.resetForm();
          this.loadActionHistory();
          this.isExecutingAction = false;
        },
        error: (error: any) => {
          this.snackBar.open(`Erreur lors de ${action.label.toLowerCase()}: ${error.message}`, 'Fermer', { duration: 5000 });
          this.actionExecuted.emit({ action: action.id, success: false });
          this.isExecutingAction = false;
        }
    });
  }

  resetForm(): void {
    this.actionForm.reset();
    this.actionForm.patchValue({
      notifyUsers: true,
      generateDocument: false
    });
    this.selectedAction = null;
  }

  // =====================================================
  // GETTERS POUR LE TEMPLATE
  // =====================================================

  get availableActionsForCurrentState() {
    if (!this.parcelle) return [];
    
    return this.availableActions.filter(action => 
      action.fromStates.includes(this.parcelle!.etat_validation!) &&
      this.authService.hasPermission(...action.requiredRole)
    );
  }

  get selectedActionConfig() {
    return this.availableActions.find(a => a.id === this.selectedAction);
  }

  get validationScore(): number {
    return this.validationResult?.score || 0;
  }

  get validationScoreColor(): string {
    const score = this.validationScore;
    if (score >= 90) return 'primary';
    if (score >= 70) return 'accent';
    if (score >= 50) return 'warn';
    return 'warn';
  }

  get criteriaByCategoryMandatory(): ValidationCriteria[] {
    return this.validationCriteria.filter(c => c.category === 'mandatory');
  }

  get criteriaByCategoryRecommended(): ValidationCriteria[] {
    return this.validationCriteria.filter(c => c.category === 'recommended');
  }

  get criteriaByCategoryOptional(): ValidationCriteria[] {
    return this.validationCriteria.filter(c => c.category === 'optional');
  }

  getCriteriaIcon(status: string): string {
    switch (status) {
      case 'valid': return 'check_circle';
      case 'invalid': return 'error';
      case 'warning': return 'warning';
      case 'pending': return 'radio_button_unchecked';
      default: return 'help_outline';
    }
  }

  getCriteriaColor(status: string): string {
    switch (status) {
      case 'valid': return 'primary';
      case 'invalid': return 'warn';
      case 'warning': return 'accent';
      case 'pending': return 'basic';
      default: return 'basic';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'CREATE': return 'add_circle';
      case 'UPDATE': return 'edit';
      case 'DELETE': return 'delete';
      case 'VALIDATE': return 'check_circle';
      case 'PUBLISH': return 'public';
      case 'ARCHIVE': return 'archive';
      default: return 'info';
    }
  }
}
