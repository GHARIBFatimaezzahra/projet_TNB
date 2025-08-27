// =====================================================
// COMPOSANT WORKFLOW STEPPER
// =====================================================

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';

// Services et modèles
import { Parcelle, EtatValidation } from '../../../models/parcelle.models';
import { AuthService } from '../../../../../core/services/auth.service';
import { UserProfil } from '../../../../../core/models/database.models';

export interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  icon: string;
  status: 'completed' | 'current' | 'pending' | 'disabled';
  canAccess: boolean;
  requiredRole?: UserProfil[];
  validationRules?: string[];
  estimatedDuration?: string;
}

export interface WorkflowAction {
  id: string;
  label: string;
  icon: string;
  color: 'primary' | 'accent' | 'warn';
  description: string;
  confirmationRequired: boolean;
  requiredRole: UserProfil[];
}

@Component({
  selector: 'app-workflow-stepper',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './workflow-stepper.component.html',
  styleUrls: ['./workflow-stepper.component.scss']
})
export class WorkflowStepperComponent implements OnInit, OnDestroy {
  @Input() parcelle: Parcelle | null = null;
  @Input() showActions = true;
  @Input() showProgress = true;
  @Input() showDetails = true;
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() compact = false;

  @Output() stepChanged = new EventEmitter<WorkflowStep>();
  @Output() actionTriggered = new EventEmitter<WorkflowAction>();

  // État du workflow
  currentStepIndex = 0;
  workflowSteps: WorkflowStep[] = [];
  availableActions: WorkflowAction[] = [];
  workflowProgress = 0;

  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.initializeWorkflow();
    this.updateWorkflowState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION DU WORKFLOW
  // =====================================================

  private initializeWorkflow(): void {
    this.workflowSteps = [
      {
        id: 'creation',
        label: 'Création',
        description: 'Saisie des informations de base de la parcelle',
        icon: 'add_circle',
        status: 'completed',
        canAccess: true,
        requiredRole: [UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG, UserProfil.AGENT_FISCAL],
        validationRules: [
          'Référence foncière valide',
          'Coordonnées géographiques',
          'Surface totale renseignée',
          'Zonage défini'
        ],
        estimatedDuration: '15-30 min'
      },
      {
        id: 'brouillon',
        label: 'Brouillon',
        description: 'Parcelle en cours de préparation, modifications possibles',
        icon: 'edit_note',
        status: 'current',
        canAccess: true,
        requiredRole: [UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG, UserProfil.AGENT_FISCAL],
        validationRules: [
          'Toutes les données obligatoires',
          'Géométrie valide',
          'Propriétaires identifiés',
          'Calculs fiscaux corrects'
        ],
        estimatedDuration: '30-60 min'
      },
      {
        id: 'validation',
        label: 'Validation',
        description: 'Vérification et validation par un agent fiscal',
        icon: 'verified',
        status: 'pending',
        canAccess: this.authService.hasPermission(UserProfil.ADMIN, UserProfil.AGENT_FISCAL),
        requiredRole: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL],
        validationRules: [
          'Conformité réglementaire',
          'Exactitude des calculs',
          'Complétude des documents',
          'Cohérence des données'
        ],
        estimatedDuration: '15-30 min'
      },
      {
        id: 'publication',
        label: 'Publication',
        description: 'Parcelle validée et publiée dans le système',
        icon: 'public',
        status: 'pending',
        canAccess: this.authService.hasPermission(UserProfil.ADMIN, UserProfil.AGENT_FISCAL),
        requiredRole: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL],
        validationRules: [
          'Validation complète',
          'Approbation hiérarchique',
          'Génération des documents officiels'
        ],
        estimatedDuration: '5-10 min'
      },
      {
        id: 'archive',
        label: 'Archivage',
        description: 'Parcelle archivée (optionnel)',
        icon: 'archive',
        status: 'disabled',
        canAccess: this.authService.hasPermission(UserProfil.ADMIN),
        requiredRole: [UserProfil.ADMIN],
        validationRules: [
          'Raison d\'archivage documentée',
          'Sauvegarde des données',
          'Notification aux parties prenantes'
        ],
        estimatedDuration: '5 min'
      }
    ];

    this.updateAvailableActions();
  }

  private updateWorkflowState(): void {
    if (!this.parcelle) return;

    const currentState = this.parcelle.etat_validation;
    
    // Mettre à jour le statut des étapes
    this.workflowSteps.forEach((step, index) => {
      switch (step.id) {
        case 'creation':
          step.status = 'completed';
          break;
        case 'brouillon':
          step.status = currentState === 'Brouillon' ? 'current' : 
                      (currentState === 'Valide' || currentState === 'Publie' || currentState === 'Archive') ? 'completed' : 'pending';
          break;
        case 'validation':
          step.status = currentState === 'Valide' ? 'current' : 
                      (currentState === 'Publie' || currentState === 'Archive') ? 'completed' : 'pending';
          break;
        case 'publication':
          step.status = currentState === 'Publie' ? 'current' : 
                      currentState === 'Archive' ? 'completed' : 'pending';
          break;
        case 'archive':
          step.status = currentState === 'Archive' ? 'current' : 'disabled';
          break;
      }

      // Déterminer l'étape actuelle
      if (step.status === 'current') {
        this.currentStepIndex = index;
      }
    });

    // Calculer le progrès
    this.calculateProgress();
    this.updateAvailableActions();
  }

  private calculateProgress(): void {
    const completedSteps = this.workflowSteps.filter(step => step.status === 'completed').length;
    const totalSteps = this.workflowSteps.filter(step => step.id !== 'archive').length; // Exclure l'archivage du calcul normal
    this.workflowProgress = (completedSteps / totalSteps) * 100;
  }

  private updateAvailableActions(): void {
    if (!this.parcelle) {
      this.availableActions = [];
      return;
    }

    const currentState = this.parcelle.etat_validation;
    this.availableActions = [];

    switch (currentState) {
      case 'Brouillon':
        if (this.authService.hasPermission(UserProfil.ADMIN, UserProfil.AGENT_FISCAL)) {
          this.availableActions.push({
            id: 'validate',
            label: 'Valider',
            icon: 'check_circle',
            color: 'primary',
            description: 'Valider la parcelle après vérification',
            confirmationRequired: true,
            requiredRole: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL]
          });
        }
        break;

      case 'Valide':
        if (this.authService.hasPermission(UserProfil.ADMIN, UserProfil.AGENT_FISCAL)) {
          this.availableActions.push({
            id: 'publish',
            label: 'Publier',
            icon: 'public',
            color: 'primary',
            description: 'Publier la parcelle validée',
            confirmationRequired: true,
            requiredRole: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL]
          });
          
          this.availableActions.push({
            id: 'reject',
            label: 'Rejeter',
            icon: 'cancel',
            color: 'warn',
            description: 'Rejeter et remettre en brouillon',
            confirmationRequired: true,
            requiredRole: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL]
          });
        }
        break;

      case 'Publie':
        if (this.authService.hasPermission(UserProfil.ADMIN)) {
          this.availableActions.push({
            id: 'archive',
            label: 'Archiver',
            icon: 'archive',
            color: 'accent',
            description: 'Archiver la parcelle publiée',
            confirmationRequired: true,
            requiredRole: [UserProfil.ADMIN]
          });
        }
        break;

      case 'Archive':
        if (this.authService.hasPermission(UserProfil.ADMIN)) {
          this.availableActions.push({
            id: 'restore',
            label: 'Restaurer',
            icon: 'restore',
            color: 'primary',
            description: 'Restaurer la parcelle archivée',
            confirmationRequired: true,
            requiredRole: [UserProfil.ADMIN]
          });
        }
        break;
    }

    // Action commune : revenir en brouillon (sauf si déjà en brouillon)
    if (currentState !== 'Brouillon' && this.authService.hasPermission(UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG)) {
      this.availableActions.push({
        id: 'draft',
        label: 'Remettre en brouillon',
        icon: 'edit',
        color: 'accent',
        description: 'Remettre la parcelle en mode brouillon pour modification',
        confirmationRequired: true,
        requiredRole: [UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG]
      });
    }
  }

  // =====================================================
  // GESTION DES ÉVÉNEMENTS
  // =====================================================

  onStepClick(step: WorkflowStep, index: number): void {
    if (step.canAccess && step.status !== 'disabled') {
      this.currentStepIndex = index;
      this.stepChanged.emit(step);
    }
  }

  onActionClick(action: WorkflowAction): void {
    // Vérifier les permissions
    if (!this.authService.hasPermission(...action.requiredRole)) {
      return;
    }

    this.actionTriggered.emit(action);
  }

  // =====================================================
  // GETTERS POUR LE TEMPLATE
  // =====================================================

  get currentStep(): WorkflowStep | null {
    return this.workflowSteps[this.currentStepIndex] || null;
  }

  get nextStep(): WorkflowStep | null {
    const nextIndex = this.currentStepIndex + 1;
    return this.workflowSteps[nextIndex] || null;
  }

  get previousStep(): WorkflowStep | null {
    const prevIndex = this.currentStepIndex - 1;
    return this.workflowSteps[prevIndex] || null;
  }

  get canGoNext(): boolean {
    const nextStep = this.nextStep;
    return !!(nextStep && nextStep.canAccess && nextStep.status !== 'disabled');
  }

  get canGoPrevious(): boolean {
    const prevStep = this.previousStep;
    return !!(prevStep && prevStep.canAccess);
  }

  get progressPercentage(): number {
    return Math.round(this.workflowProgress);
  }

  get currentStateLabel(): string {
    switch (this.parcelle?.etat_validation) {
      case 'Brouillon': return 'En cours de préparation';
      case 'Valide': return 'Validée, prête pour publication';
      case 'Publie': return 'Publiée et active';
      case 'Archive': return 'Archivée';
      default: return 'État inconnu';
    }
  }

  get currentStateColor(): string {
    switch (this.parcelle?.etat_validation) {
      case 'Brouillon': return 'warn';
      case 'Valide': return 'accent';
      case 'Publie': return 'primary';
      case 'Archive': return 'basic';
      default: return 'basic';
    }
  }

  get currentStateIcon(): string {
    switch (this.parcelle?.etat_validation) {
      case 'Brouillon': return 'edit_note';
      case 'Valide': return 'verified';
      case 'Publie': return 'public';
      case 'Archive': return 'archive';
      default: return 'help_outline';
    }
  }

  // =====================================================
  // MÉTHODES UTILITAIRES
  // =====================================================

  getStepStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'primary';
      case 'current': return 'accent';
      case 'pending': return 'basic';
      case 'disabled': return 'basic';
      default: return 'basic';
    }
  }

  getStepStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'current': return 'radio_button_checked';
      case 'pending': return 'radio_button_unchecked';
      case 'disabled': return 'block';
      default: return 'help_outline';
    }
  }

  formatDuration(duration: string): string {
    return `⏱️ ${duration}`;
  }

  hasRequiredRole(roles: UserProfil[]): boolean {
    return this.authService.hasPermission(...roles);
  }

  // Navigation programmatique
  goToNext(): void {
    if (this.canGoNext) {
      this.currentStepIndex++;
      this.stepChanged.emit(this.currentStep!);
    }
  }

  goToPrevious(): void {
    if (this.canGoPrevious) {
      this.currentStepIndex--;
      this.stepChanged.emit(this.currentStep!);
    }
  }

  goToStep(stepId: string): void {
    const stepIndex = this.workflowSteps.findIndex(step => step.id === stepId);
    if (stepIndex >= 0) {
      const step = this.workflowSteps[stepIndex];
      if (step.canAccess && step.status !== 'disabled') {
        this.currentStepIndex = stepIndex;
        this.stepChanged.emit(step);
      }
    }
  }
}
