// =====================================================
// COMPOSANT CALCULATEUR TNB - CALCULS FISCAUX
// =====================================================

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

// Services
import { FiscalCalculationService } from '../../../services/fiscal-calculation.service';

// Models
import { ConfigurationFiscale } from '../../../models/parcelle.models';

// Pipes
import { SurfaceFormatPipe } from '../../../pipes/surface-format.pipe';

export interface TaxCalculationResult {
  surfaceImposable: number;
  tarifUnitaire: number;
  montantBase: number;
  montantBrut: number;
  montantNet: number;
  totalExonerations: number;
  dateCalcul: Date;
  exonerations: {
    type: string;
    montant: number;
    description: string;
    pourcentage: number;
    baseCalcul: number;
  }[];
  montantExonere: number;
  montantFinal: number;
  details: {
    zonage: string;
    annee: number;
    dateCalcul: Date;
    configuration: ConfigurationFiscale | null;
  };
}

@Component({
  selector: 'app-tax-calculator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatTableModule,
    MatChipsModule,
    SurfaceFormatPipe
  ],
  templateUrl: './tax-calculator.component.html',
  styleUrls: ['./tax-calculator.component.scss']
})
export class TaxCalculatorComponent implements OnInit, OnDestroy {
  @Input() surfaceTotale?: number;
  @Input() surfaceImposable?: number;
  @Input() zonage?: string;
  @Input() exonereTnb?: boolean;
  @Input() datePermis?: Date;
  @Input() dureeExoneration?: number;
  @Input() readonly = false;

  @Output() calculationResult = new EventEmitter<TaxCalculationResult>();
  @Output() configurationChange = new EventEmitter<ConfigurationFiscale>();

  // Formulaire
  calculatorForm!: FormGroup;

  // État
  isCalculating = false;
  currentResult: TaxCalculationResult | null = null;
  availableConfigurations: ConfigurationFiscale[] = [];
  selectedConfiguration: ConfigurationFiscale | null = null;
  availableExonerations: any[] = [];
  selectedExonerations: string[] = [];
  errorMessage: string = '';

  // Configuration
  currentYear = new Date().getFullYear();
  availableYears: number[] = [];
  
  // Types d'exonération
  exonerationTypes = [
    { value: 'permis_construire', label: 'Permis de construire', durees: [3, 5, 7] },
    { value: 'zone_industrielle', label: 'Zone industrielle', durees: [5, 10] },
    { value: 'investissement_agricole', label: 'Investissement agricole', durees: [7, 10] },
    { value: 'logement_social', label: 'Logement social', durees: [10, 15] },
    { value: 'autre', label: 'Autre exonération', durees: [1, 2, 3, 5] }
  ];

  // Colonnes du tableau de détail
  detailColumns = ['description', 'base', 'tarif', 'montant'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private fiscalCalculationService: FiscalCalculationService
  ) {}

  ngOnInit(): void {
    this.initializeYears();
    this.initializeForm();
    this.setupFormListeners();
    this.loadConfigurations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initializeYears(): void {
    const startYear = this.currentYear - 5;
    const endYear = this.currentYear + 2;
    
    for (let year = startYear; year <= endYear; year++) {
      this.availableYears.push(year);
    }
  }

  private initializeForm(): void {
    this.calculatorForm = this.fb.group({
      // Données de base
      surfaceImposable: [this.surfaceImposable || 0, [Validators.required, Validators.min(0)]],
      zonage: [this.zonage || '', Validators.required],
      annee: [this.currentYear, Validators.required],
      
      // Configuration fiscale
      tarifUnitaire: [{ value: 0, disabled: true }],
      configurationId: [null],
      
      // Exonération
      exonereTnb: [this.exonereTnb || false],
      typeExoneration: ['permis_construire'],
      datePermis: [this.datePermis || null],
      dureeExoneration: [this.dureeExoneration || 3],
      
      // Calculs
      montantBase: [{ value: 0, disabled: true }],
      montantExonere: [{ value: 0, disabled: true }],
      montantFinal: [{ value: 0, disabled: true }]
    });

    // Désactiver les champs en mode readonly
    if (this.readonly) {
      this.calculatorForm.disable();
    }
  }

  private setupFormListeners(): void {
    // Recalcul automatique sur changement
    this.calculatorForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.calculatorForm.valid) {
          this.calculateTax();
        }
      });

    // Charger la configuration lors du changement de zonage/année
    this.calculatorForm.get('zonage')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadConfigurationForZone());

    this.calculatorForm.get('annee')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadConfigurationForZone());

    // Gestion de l'exonération
    this.calculatorForm.get('exonereTnb')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(exonere => {
        const datePermisControl = this.calculatorForm.get('datePermis');
        const dureeControl = this.calculatorForm.get('dureeExoneration');
        
        if (exonere) {
          datePermisControl?.setValidators([Validators.required]);
          dureeControl?.setValidators([Validators.required, Validators.min(1)]);
        } else {
          datePermisControl?.clearValidators();
          dureeControl?.clearValidators();
        }
        
        datePermisControl?.updateValueAndValidity();
        dureeControl?.updateValueAndValidity();
      });
  }

  // =====================================================
  // CHARGEMENT CONFIGURATIONS
  // =====================================================

  private loadConfigurations(): void {
    // Simuler le chargement des configurations
    // En réalité, appeler un service
    this.availableConfigurations = [
      {
        id: 1,
        zonage: 'U1',
        tarif_unitaire: 12,
        annee: this.currentYear,
        actif: true,
        date_creation: new Date(),
        creer_par: 1
      },
      {
        id: 2,
        zonage: 'U2',
        tarif_unitaire: 10,
        annee: this.currentYear,
        actif: true,
        date_creation: new Date(),
        creer_par: 1
      },
      {
        id: 3,
        zonage: 'R1',
        tarif_unitaire: 8,
        annee: this.currentYear,
        actif: true,
        date_creation: new Date(),
        creer_par: 1
      },
      {
        id: 4,
        zonage: 'R2',
        tarif_unitaire: 6,
        annee: this.currentYear,
        actif: true,
        date_creation: new Date(),
        creer_par: 1
      },
      {
        id: 5,
        zonage: 'I1',
        tarif_unitaire: 15,
        annee: this.currentYear,
        actif: true,
        date_creation: new Date(),
        creer_par: 1
      }
    ];
  }

  private loadConfigurationForZone(): void {
    const zonage = this.calculatorForm.get('zonage')?.value;
    const annee = this.calculatorForm.get('annee')?.value;
    
    if (!zonage || !annee) return;

    this.fiscalCalculationService.getFiscalConfiguration(zonage, annee)
      .pipe(takeUntil(this.destroy$))
              .subscribe((config: any) => {
        this.selectedConfiguration = config;
        
        if (config) {
          this.calculatorForm.patchValue({
            tarifUnitaire: config.tarif_unitaire,
            configurationId: config.id
          });
          this.configurationChange.emit(config);
        } else {
          // Utiliser tarif par défaut
          this.calculatorForm.patchValue({
            tarifUnitaire: 5, // Tarif par défaut
            configurationId: null
          });
        }
      });
  }

  // =====================================================
  // CALCUL TNB
  // =====================================================

  calculateTax(): void {
    if (!this.calculatorForm.valid) return;

    this.isCalculating = true;
    const formValue = this.calculatorForm.value;

    const surfaceImposable = formValue.surfaceImposable;
    const tarifUnitaire = formValue.tarifUnitaire;
    const exonereTnb = formValue.exonereTnb;

    // Calcul de base
    const montantBase = surfaceImposable * tarifUnitaire;

    // Calcul des exonérations
    const exonerations = this.calculateExonerations(montantBase, formValue);
    const montantExonere = exonerations.reduce((total, exo) => total + exo.montant, 0);

    // Montant final
    const montantFinal = exonereTnb ? montantBase - montantExonere : montantBase;

    // Résultat
    this.currentResult = {
      surfaceImposable,
      tarifUnitaire,
      montantBase,
      montantBrut: montantBase,
      montantNet: Math.max(0, montantFinal),
      totalExonerations: montantExonere,
      dateCalcul: new Date(),
      exonerations,
      montantExonere,
      montantFinal: Math.max(0, montantFinal),
      details: {
        zonage: formValue.zonage,
        annee: formValue.annee,
        dateCalcul: new Date(),
        configuration: this.selectedConfiguration
      }
    };

    // Mettre à jour les champs calculés
    this.calculatorForm.patchValue({
      montantBase,
      montantExonere,
      montantFinal: this.currentResult?.montantFinal || 0
    }, { emitEvent: false });

    if (this.currentResult) {
      this.calculationResult.emit(this.currentResult);
    }
    this.isCalculating = false;
  }

  private calculateExonerations(montantBase: number, formValue: any): any[] {
    const exonerations: any[] = [];

    if (!formValue.exonereTnb) return exonerations;

    const datePermis = new Date(formValue.datePermis);
    const dureeExoneration = formValue.dureeExoneration;
    const dateFinExoneration = new Date(datePermis);
    dateFinExoneration.setFullYear(dateFinExoneration.getFullYear() + dureeExoneration);

    const now = new Date();

    // Vérifier si l'exonération est encore valide
    if (now <= dateFinExoneration) {
      const typeExoneration = this.exonerationTypes.find(t => t.value === formValue.typeExoneration);
      
      // Calcul du pourcentage d'exonération selon le type et la durée
      let pourcentageExoneration = 100; // 100% par défaut
      
      if (formValue.typeExoneration === 'permis_construire') {
        pourcentageExoneration = dureeExoneration <= 3 ? 100 : 
                                dureeExoneration <= 5 ? 80 : 60;
      } else if (formValue.typeExoneration === 'zone_industrielle') {
        pourcentageExoneration = 75;
      } else if (formValue.typeExoneration === 'logement_social') {
        pourcentageExoneration = 100;
      }

      const montantExonere = (montantBase * pourcentageExoneration) / 100;

      exonerations.push({
        type: formValue.typeExoneration,
        montant: montantExonere,
        description: `${typeExoneration?.label} (${pourcentageExoneration}% pendant ${dureeExoneration} ans)`
      });
    }

    return exonerations;
  }

  // =====================================================
  // ACTIONS
  // =====================================================

  resetCalculation(): void {
    this.calculatorForm.reset({
      surfaceImposable: this.surfaceImposable || 0,
      zonage: this.zonage || '',
      annee: this.currentYear,
      exonereTnb: false,
      typeExoneration: 'permis_construire',
      dureeExoneration: 3
    });
    
    this.currentResult = null;
  }

  exportCalculation(): void {
    if (!this.currentResult) return;

    const data = {
      ...this.currentResult,
      formData: this.calculatorForm.value
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calcul_tnb_${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  isExonerationValid(): boolean {
    const formValue = this.calculatorForm.value;
    if (!formValue.exonereTnb || !formValue.datePermis) return false;

    const datePermis = new Date(formValue.datePermis);
    const dureeExoneration = formValue.dureeExoneration || 0;
    const dateFinExoneration = new Date(datePermis);
    dateFinExoneration.setFullYear(dateFinExoneration.getFullYear() + dureeExoneration);

    return new Date() <= dateFinExoneration;
  }

  getExonerationEndDate(): Date | null {
    const formValue = this.calculatorForm.value;
    if (!formValue.datePermis || !formValue.dureeExoneration) return null;

    const datePermis = new Date(formValue.datePermis);
    const dateFinExoneration = new Date(datePermis);
    dateFinExoneration.setFullYear(dateFinExoneration.getFullYear() + formValue.dureeExoneration);

    return dateFinExoneration;
  }

  getDureesForType(type: string): number[] {
    const exonerationType = this.exonerationTypes.find(t => t.value === type);
    return exonerationType?.durees || [3, 5, 7];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Getters pour le template
  get hasResult(): boolean {
    return !!this.calculationResult;
  }

  get isExonerated(): boolean {
    return this.calculatorForm.get('exonereTnb')?.value === true;
  }

  get canCalculate(): boolean {
    return this.calculatorForm.valid && !this.isCalculating;
  }

  // Méthodes manquantes pour le template
  toggleExoneration(type: string, checked: boolean): void {
    if (checked) {
      this.selectedExonerations.push(type);
    } else {
      const index = this.selectedExonerations.indexOf(type);
      if (index > -1) {
        this.selectedExonerations.splice(index, 1);
      }
    }
  }

  saveCalculation(): void {
    if (this.currentResult) {
      console.log('Sauvegarde du calcul:', this.currentResult);
      // TODO: Implémenter la sauvegarde
    }
  }

  clearError(): void {
    this.errorMessage = '';
  }
}
