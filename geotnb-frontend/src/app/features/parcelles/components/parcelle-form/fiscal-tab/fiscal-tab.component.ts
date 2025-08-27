// =====================================================
// ONGLET FISCAL - CALCULS TNB ET EXONÉRATIONS
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

// Services et pipes
import { FiscalCalculationService } from '../../../services/fiscal-calculation.service';

@Component({
  selector: 'app-fiscal-tab',
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
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './fiscal-tab.component.html',
  styleUrls: ['./fiscal-tab.component.scss']
})
export class FiscalTabComponent implements OnInit, OnDestroy {
  @Input() formGroup!: FormGroup;
  @Input() mode: 'create' | 'edit' | 'view' = 'create';

  // Options pour les durées d'exonération
  dureeExonerationOptions = [
    { value: 0, label: 'Pas d\'exonération', description: 'Taxation normale' },
    { value: 3, label: '3 ans', description: 'Exonération de 3 années' },
    { value: 5, label: '5 ans', description: 'Exonération de 5 années' },
    { value: 7, label: '7 ans', description: 'Exonération de 7 années' }
  ];

  // Calculs TNB
  tarifUnitaire = 0;
  montantTnbCalcule = 0;
  surfaceImposableCalculee = 0;
  pourcentageSurfaceImposable = 0;
  
  // État des calculs
  calculEnCours = false;
  calculEffectue = false;

  private destroy$ = new Subject<void>();

  constructor(private fiscalService: FiscalCalculationService) {}

  ngOnInit(): void {
    this.setupCalculationListeners();
    this.calculateTnb();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // CALCULS AUTOMATIQUES
  // =====================================================

  private setupCalculationListeners(): void {
    // Recalculer quand les valeurs changent
    const fieldsToWatch = ['surface_totale', 'surface_imposable', 'zonage', 'exonere_tnb'];
    
    fieldsToWatch.forEach(fieldName => {
      const control = this.formGroup.get(fieldName);
      if (control) {
        control.valueChanges
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.calculateTnb();
            this.calculateSurfacePercentage();
          });
      }
    });
  }

  calculateTnb(): void {
    const surfaceImposable = this.formGroup.get('surface_imposable')?.value || 0;
    const zonage = this.formGroup.get('zonage')?.value;
    const exonere = this.formGroup.get('exonere_tnb')?.value || false;

    if (!surfaceImposable || !zonage) {
      this.resetCalculations();
      return;
    }

    this.calculEnCours = true;
    
    // Simulation d'appel au service fiscal
    this.fiscalService.calculateTnb({
      surface_imposable: surfaceImposable,
      zonage: zonage,
      exonere_tnb: exonere,
      annee: new Date().getFullYear()
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        this.tarifUnitaire = result.tarif_unitaire;
        this.montantTnbCalcule = result.montant_tnb;
        this.surfaceImposableCalculee = result.surface_imposable;
        this.calculEnCours = false;
        this.calculEffectue = true;
        
        // Mettre à jour les champs du formulaire
        this.formGroup.patchValue({
          prix_unitaire_m2: this.tarifUnitaire,
          montant_total_tnb: this.montantTnbCalcule
        }, { emitEvent: false });
      },
      error: () => {
        this.calculEnCours = false;
        this.resetCalculations();
      }
    });
  }

  private calculateSurfacePercentage(): void {
    const surfaceTotale = this.formGroup.get('surface_totale')?.value || 0;
    const surfaceImposable = this.formGroup.get('surface_imposable')?.value || 0;
    
    if (surfaceTotale > 0) {
      this.pourcentageSurfaceImposable = Math.round((surfaceImposable / surfaceTotale) * 100);
    } else {
      this.pourcentageSurfaceImposable = 0;
    }
  }

  private resetCalculations(): void {
    this.tarifUnitaire = 0;
    this.montantTnbCalcule = 0;
    this.surfaceImposableCalculee = 0;
    this.calculEffectue = false;
  }

  // =====================================================
  // GESTION EXONÉRATION
  // =====================================================

  onExonerationChange(): void {
    const exonere = this.formGroup.get('exonere_tnb')?.value;
    const datePermisControl = this.formGroup.get('date_permis');
    const dureeControl = this.formGroup.get('duree_exoneration');
    
    if (exonere) {
      // Rendre les champs d'exonération obligatoires
      datePermisControl?.setValidators([]);
      dureeControl?.setValidators([]);
    } else {
      // Effacer les champs d'exonération
      datePermisControl?.clearValidators();
      dureeControl?.clearValidators();
      datePermisControl?.setValue('');
      dureeControl?.setValue(0);
    }
    
    datePermisControl?.updateValueAndValidity();
    dureeControl?.updateValueAndValidity();
    
    // Recalculer le TNB
    this.calculateTnb();
  }

  // =====================================================
  // HELPERS
  // =====================================================

  formatMontant(montant: number): string {
    if (!montant) return '0 DH';
    return `${montant.toLocaleString('fr-MA')} DH`;
  }

  formatSurface(surface: number): string {
    if (!surface) return '0 m²';
    
    if (surface >= 10000) {
      return `${(surface / 10000).toFixed(2)} ha`;
    }
    return `${surface.toFixed(2)} m²`;
  }

  getExonerationStatus(): { active: boolean; expired: boolean; dateExpiration: Date | null } {
    const exonere = this.formGroup.get('exonere_tnb')?.value;
    const datePermis = this.formGroup.get('date_permis')?.value;
    const duree = this.formGroup.get('duree_exoneration')?.value;
    
    if (!exonere || !datePermis || !duree) {
      return { active: false, expired: false, dateExpiration: null };
    }
    
    const dateExpiration = new Date(datePermis);
    dateExpiration.setFullYear(dateExpiration.getFullYear() + duree);
    
    const now = new Date();
    const active = now < dateExpiration;
    
    return {
      active,
      expired: !active,
      dateExpiration
    };
  }

  getTnbStatusColor(): string {
    const exonere = this.formGroup.get('exonere_tnb')?.value;
    if (exonere) {
      const status = this.getExonerationStatus();
      return status.active ? 'accent' : 'warn';
    }
    return 'primary';
  }

  // Getters pour le template
  get isViewMode(): boolean { 
    return this.mode === 'view'; 
  }

  get canEdit(): boolean { 
    return this.mode !== 'view'; 
  }

  get isExonere(): boolean {
    return this.formGroup.get('exonere_tnb')?.value || false;
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
