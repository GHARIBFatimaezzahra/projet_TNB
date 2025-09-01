// =====================================================
// COMPOSANT WORKFLOW DE VALIDATION - INTERFACE COMPLÈTE
// =====================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';

// Services
import { ParcelleManagementService } from '../../services/parcelle-management.service';

export interface WorkflowStep {
  numero: number;
  nom: string;
  statut: 'completed' | 'current' | 'pending';
  date?: string;
}

export interface WorkflowData {
  etapeActuelle: number;
  etapes: WorkflowStep[];
  calculTnb: {
    surfaceImposable: number;
    tarifZone: number;
    calculBase: string;
    montantTotal: number;
  };
  parcelleReference: string;
  commentaires?: string;
}

@Component({
  selector: 'app-workflow-validation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './workflow-validation.component.html',
  styleUrls: ['./workflow-validation.component.scss']
})
export class WorkflowValidationComponent implements OnInit, OnDestroy {

  // =====================================================
  // PROPRIÉTÉS
  // =====================================================

  workflowData: WorkflowData | null = null;
  loading = false;
  parcelleId: number | null = null;
  commentaires = '';
  
  // Documents de référence
  documentsReference = [
    { nom: 'Arrêté tarifaire 2024', type: 'ARRETE', actif: true },
    { nom: 'Plan d\'aménagement PA-R+4', type: 'PLAN', actif: true },
    { nom: 'Certificat de propriété', type: 'CERTIFICAT', actif: true }
  ];

  // Subject pour la destruction
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parcelleService: ParcelleManagementService,
    private snackBar: MatSnackBar
  ) {}

  // =====================================================
  // CYCLE DE VIE
  // =====================================================

  ngOnInit(): void {
    this.loadWorkflowData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================

  private loadWorkflowData(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          this.parcelleId = +params['id'];
          this.loading = true;
          return this.parcelleService.getWorkflowStatus(this.parcelleId);
        })
      )
      .subscribe({
        next: (data) => {
          this.workflowData = {
            ...data,
            parcelleReference: 'TF-478923-B'
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement du workflow:', error);
          this.showError('Erreur lors du chargement du workflow');
          this.loading = false;
        }
      });
  }

  // =====================================================
  // ACTIONS DU WORKFLOW
  // =====================================================

  validerEtapeSuivante(): void {
    if (!this.workflowData || !this.parcelleId) return;

    const etapeActuelle = this.workflowData.etapeActuelle;
    
    this.parcelleService.validateWorkflowStep(this.parcelleId, etapeActuelle, this.commentaires)
      .subscribe({
        next: (result) => {
          this.showSuccess(result.message);
          this.loadWorkflowData(); // Recharger les données
        },
        error: () => {
          this.showError('Erreur lors de la validation de l\'étape');
        }
      });
  }

  demanderCorrections(): void {
    if (!this.commentaires.trim()) {
      this.showError('Veuillez ajouter un commentaire pour les corrections demandées');
      return;
    }

    this.showSuccess('Demande de corrections envoyée');
    // Implémenter la logique de demande de corrections
  }

  rejeterParcelle(): void {
    if (confirm('Êtes-vous sûr de vouloir rejeter cette parcelle ?')) {
      this.showSuccess('Parcelle rejetée');
      // Implémenter la logique de rejet
    }
  }

  retourEtapePrecedente(): void {
    if (confirm('Êtes-vous sûr de vouloir revenir à l\'étape précédente ?')) {
      this.showSuccess('Retour à l\'étape précédente');
      // Implémenter la logique de retour
    }
  }

  // =====================================================
  // UTILITAIRES POUR L'AFFICHAGE
  // =====================================================

  getStepClass(step: WorkflowStep): string {
    switch (step.statut) {
      case 'completed':
        return 'step-completed';
      case 'current':
        return 'step-current';
      case 'pending':
        return 'step-pending';
      default:
        return 'step-pending';
    }
  }

  getStepIcon(step: WorkflowStep): string {
    switch (step.statut) {
      case 'completed':
        return 'check_circle';
      case 'current':
        return 'radio_button_checked';
      case 'pending':
        return 'radio_button_unchecked';
      default:
        return 'radio_button_unchecked';
    }
  }

  getCurrentStepTitle(): string {
    if (!this.workflowData) return '';
    const currentStep = this.workflowData.etapes.find(step => step.statut === 'current');
    return currentStep ? currentStep.nom : '';
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  retourDetail(): void {
    if (this.parcelleId) {
      this.router.navigate(['/parcelles', this.parcelleId]);
    } else {
      this.router.navigate(['/parcelles']);
    }
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
