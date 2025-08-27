// =====================================================
// ONGLET GÉNÉRAL - INFORMATIONS DE BASE PARCELLE
// =====================================================

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

// Services et modèles
import { ParcelleService } from '../../../services/parcelle.service';
import { StatutFoncier, StatutOccupation } from '../../../models/parcelle.models';

@Component({
  selector: 'app-general-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss']
})
export class GeneralTabComponent implements OnInit, OnDestroy {
  @Input() formGroup!: FormGroup;
  @Input() mode: 'create' | 'edit' | 'view' = 'create';

  // Options pour les selects
  statutFoncierOptions = [
    { value: StatutFoncier.TF, label: 'Titre Foncier (TF)', description: 'Propriété titrée définitive' },
    { value: StatutFoncier.R, label: 'Réquisition (R)', description: 'En cours d\'immatriculation' },
    { value: StatutFoncier.NI, label: 'Non Immatriculé (NI)', description: 'Propriété traditionnelle' },
    { value: StatutFoncier.DOMANIAL, label: 'Domanial', description: 'Domaine de l\'État' },
    { value: StatutFoncier.COLLECTIF, label: 'Collectif', description: 'Terres collectives' }
  ];

  statutOccupationOptions = [
    { value: StatutOccupation.NU, label: 'Nu', description: 'Terrain vide' },
    { value: StatutOccupation.CONSTRUIT, label: 'Construit', description: 'Construction achevée' },
    { value: StatutOccupation.EN_CONSTRUCTION, label: 'En Construction', description: 'Travaux en cours' },
    { value: StatutOccupation.PARTIELLEMENT_CONSTRUIT, label: 'Partiellement Construit', description: 'Construction partielle' }
  ];

  // État du composant
  referenceExists = false;
  checkingReference = false;

  private destroy$ = new Subject<void>();

  constructor(private parcelleService: ParcelleService) {}

  ngOnInit(): void {
    this.setupReferenceValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // VALIDATION RÉFÉRENCE FONCIÈRE
  // =====================================================

  private setupReferenceValidation(): void {
    const referenceControl = this.formGroup.get('reference_fonciere');
    
    if (referenceControl) {
      referenceControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => {
          if (value && value.length >= 5) {
            this.checkReferenceUniqueness(value);
          }
        });
    }
  }

  private checkReferenceUniqueness(reference: string): void {
    this.checkingReference = true;
    this.referenceExists = false;
    
    this.parcelleService.checkReferenceExists(reference)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exists) => {
          this.referenceExists = exists;
          this.checkingReference = false;
          
          const control = this.formGroup.get('reference_fonciere');
          if (exists && control) {
            control.setErrors({ ...control.errors, referenceExists: true });
          }
        },
        error: () => {
          this.checkingReference = false;
        }
      });
  }

  // =====================================================
  // GÉNÉRATION AUTOMATIQUE
  // =====================================================

  generateReference(): void {
    const statutFoncier = this.formGroup.get('statut_foncier')?.value;
    if (!statutFoncier) return;

    // Génération basique (à améliorer selon vos règles métier)
    const timestamp = Date.now().toString().slice(-6);
    const prefix = statutFoncier === StatutFoncier.TF ? 'TF' : 
                  statutFoncier === StatutFoncier.R ? 'R' : 'NI';
    
    const newReference = `${prefix}-${timestamp}`;
    this.formGroup.get('reference_fonciere')?.setValue(newReference);
  }

  // =====================================================
  // HELPERS TEMPLATE
  // =====================================================

  getStatutFoncierIcon(statut: StatutFoncier): string {
    switch (statut) {
      case StatutFoncier.TF: return 'verified';
      case StatutFoncier.R: return 'pending';
      case StatutFoncier.NI: return 'help_outline';
      case StatutFoncier.DOMANIAL: return 'account_balance';
      case StatutFoncier.COLLECTIF: return 'groups';
      default: return 'info';
    }
  }

  getStatutOccupationIcon(statut: StatutOccupation): string {
    switch (statut) {
      case StatutOccupation.NU: return 'landscape';
      case StatutOccupation.CONSTRUIT: return 'home';
      case StatutOccupation.EN_CONSTRUCTION: return 'construction';
      case StatutOccupation.PARTIELLEMENT_CONSTRUIT: return 'home_repair_service';
      default: return 'info';
    }
  }

  getStatutOccupationDescription(statut: StatutOccupation): string {
    const option = this.statutOccupationOptions.find(o => o.value === statut);
    return option?.description || '';
  }

  getStatutFoncierColor(statut: StatutFoncier): string {
    switch (statut) {
      case StatutFoncier.TF: return 'primary';
      case StatutFoncier.R: return 'accent';
      case StatutFoncier.NI: return 'warn';
      case StatutFoncier.DOMANIAL: return 'primary';
      case StatutFoncier.COLLECTIF: return 'accent';
      default: return '';
    }
  }

  // Getters pour le template
  get isViewMode(): boolean { 
    return this.mode === 'view'; 
  }

  get canEdit(): boolean { 
    return this.mode !== 'view'; 
  }
}