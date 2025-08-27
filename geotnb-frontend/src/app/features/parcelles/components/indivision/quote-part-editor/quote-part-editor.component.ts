// =====================================================
// ÉDITEUR DE QUOTE-PARTS - GESTION INDIVISION
// =====================================================

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Services et modèles
import { IndivisionService } from '../../../services/indivision.service';
import { ParcelleProprietaire, Proprietaire } from '../../../models/parcelle.models';

// Validators
import { QuotePartValidator } from '../../../validators/quote-part.validator';

export interface QuotePartData {
  proprietaireId: number;
  proprietaire: Proprietaire;
  quotePart: number;
  montantIndividuel: number;
  dateDebut: Date;
  dateFin?: Date;
  estActif: boolean;
}

export interface QuotePartValidation {
  isValid: boolean;
  totalQuotePart: number;
  errors: string[];
  warnings: string[];
}

@Component({
  selector: 'app-quote-part-editor',
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
    MatDividerModule,
    MatTooltipModule,
    MatTableModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './quote-part-editor.component.html',
  styleUrls: ['./quote-part-editor.component.scss']
})
export class QuotePartEditorComponent implements OnInit, OnDestroy {
  @Input() parcelleId!: number;
  @Input() montantTotalTnb = 0;
  @Input() readonly = false;
  @Input() initialQuoteParts: ParcelleProprietaire[] = [];

  @Output() quotePartsChange = new EventEmitter<QuotePartData[]>();
  @Output() validationChange = new EventEmitter<QuotePartValidation>();
  @Output() proprietaireAdded = new EventEmitter<number>();

  // Formulaire principal
  quotePartsForm!: FormGroup;
  
  // État
  quoteParts: QuotePartData[] = [];
  availableProprietaires: Proprietaire[] = [];
  isLoading = false;
  
  // Mode d'édition
  editMode: 'percentage' | 'amount' | 'visual' = 'percentage';
  
  // Validation
  currentValidation: QuotePartValidation = {
    isValid: false,
    totalQuotePart: 0,
    errors: [],
    warnings: []
  };

  // Configuration des colonnes
  displayedColumns = ['proprietaire', 'quotePart', 'montantIndividuel', 'periode', 'actions'];

  // Configuration des modes
  editModes = [
    { value: 'percentage', label: 'Pourcentages', icon: 'percent', description: 'Saisie directe des pourcentages' },
    { value: 'amount', label: 'Montants', icon: 'attach_money', description: 'Saisie des montants individuels' },
    { value: 'visual', label: 'Visuel', icon: 'tune', description: 'Ajustement visuel avec curseurs' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private indivisionService: IndivisionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAvailableProprietaires();
    this.initializeQuoteParts();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initializeForm(): void {
    this.quotePartsForm = this.fb.group({
      quoteParts: this.fb.array([]),
      nouveauProprietaire: [''],
      modeRepartition: ['manuelle'], // 'manuelle', 'egale', 'proportionnelle'
      baseCalcul: ['surface'] // 'surface', 'valeur', 'autre'
    });

    if (this.readonly) {
      this.quotePartsForm.disable();
    }
  }

  private initializeQuoteParts(): void {
    if (this.initialQuoteParts.length > 0) {
      this.quoteParts = this.initialQuoteParts.map(pp => ({
        proprietaireId: pp.proprietaire_id,
        proprietaire: pp.proprietaire!,
        quotePart: pp.quote_part,
        montantIndividuel: pp.montant_individuel,
        dateDebut: pp.date_debut,
        dateFin: pp.date_fin,
        estActif: pp.est_actif
      }));
      
      this.updateFormArray();
    }
  }

  private loadAvailableProprietaires(): void {
    this.isLoading = true;
    
    // Simuler le chargement des propriétaires disponibles
    // En réalité, appeler le service approprié
    this.availableProprietaires = [
      {
        id: 1,
        nom: 'ALAMI',
        prenom: 'Ahmed',
        nature: 'Physique',
        cin_ou_rc: 'AB123456',
        adresse: 'Casablanca',
        telephone: '0661234567',
        email: 'ahmed.alami@email.com',
        date_creation: new Date(),
        date_modification: new Date(),
        est_actif: true
      },
      {
        id: 2,
        nom: 'BENALI',
        prenom: 'Fatima',
        nature: 'Physique',
        cin_ou_rc: 'CD789012',
        adresse: 'Rabat',
        telephone: '0662345678',
        email: 'fatima.benali@email.com',
        date_creation: new Date(),
        date_modification: new Date(),
        est_actif: true
      }
    ];
    
    this.isLoading = false;
  }

  private setupFormListeners(): void {
    // Écouter les changements dans le FormArray
    this.quotePartsArray.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateQuotePartsFromForm();
        this.validateQuoteParts();
      });

    // Écouter le mode de répartition
    this.quotePartsForm.get('modeRepartition')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(mode => {
        if (mode === 'egale') {
          this.distributeEqually();
        }
      });
  }

  // =====================================================
  // GESTION DU FORMARRAY
  // =====================================================

  get quotePartsArray(): FormArray {
    return this.quotePartsForm.get('quoteParts') as FormArray;
  }

  private updateFormArray(): void {
    // Vider le FormArray
    while (this.quotePartsArray.length !== 0) {
      this.quotePartsArray.removeAt(0);
    }

    // Ajouter les quote-parts existantes
    this.quoteParts.forEach(qp => {
      this.quotePartsArray.push(this.createQuotePartFormGroup(qp));
    });
  }

  private createQuotePartFormGroup(quotePart: QuotePartData): FormGroup {
    return this.fb.group({
      proprietaireId: [quotePart.proprietaireId, Validators.required],
      quotePart: [
        quotePart.quotePart,
        [Validators.required, Validators.min(0.01), Validators.max(1), QuotePartValidator.validate()]
      ],
      montantIndividuel: [{ value: quotePart.montantIndividuel, disabled: this.editMode === 'percentage' }],
      dateDebut: [quotePart.dateDebut, Validators.required],
      dateFin: [quotePart.dateFin],
      estActif: [quotePart.estActif]
    });
  }

  private updateQuotePartsFromForm(): void {
    this.quoteParts = this.quotePartsArray.controls.map((control, index) => {
      const formValue = control.value;
      const existingQuotePart = this.quoteParts[index];
      
      return {
        ...existingQuotePart,
        quotePart: formValue.quotePart,
        montantIndividuel: this.editMode === 'percentage' 
          ? formValue.quotePart * this.montantTotalTnb
          : formValue.montantIndividuel,
        dateDebut: formValue.dateDebut,
        dateFin: formValue.dateFin,
        estActif: formValue.estActif
      };
    });

    this.quotePartsChange.emit(this.quoteParts);
  }

  // =====================================================
  // GESTION DES PROPRIÉTAIRES
  // =====================================================

  addProprietaire(): void {
    const proprietaireId = this.quotePartsForm.get('nouveauProprietaire')?.value;
    if (!proprietaireId) return;

    const proprietaire = this.availableProprietaires.find(p => p.id === proprietaireId);
    if (!proprietaire) return;

    // Vérifier si le propriétaire n'est pas déjà ajouté
    if (this.quoteParts.some(qp => qp.proprietaireId === proprietaireId)) {
      this.showError('Ce propriétaire est déjà dans la liste');
      return;
    }

    // Calculer la quote-part par défaut
    const defaultQuotePart = this.quoteParts.length === 0 ? 1.0 : 0;

    const newQuotePart: QuotePartData = {
      proprietaireId,
      proprietaire,
      quotePart: defaultQuotePart,
      montantIndividuel: defaultQuotePart * this.montantTotalTnb,
      dateDebut: new Date(),
      estActif: true
    };

    this.quoteParts.push(newQuotePart);
    this.quotePartsArray.push(this.createQuotePartFormGroup(newQuotePart));

    // Réinitialiser la sélection
    this.quotePartsForm.patchValue({ nouveauProprietaire: '' });
    
    this.proprietaireAdded.emit(proprietaireId);
    this.showSuccess('Propriétaire ajouté');
  }

  removeProprietaire(index: number): void {
    if (this.quoteParts.length <= 1) {
      this.showError('Il doit y avoir au moins un propriétaire');
      return;
    }

    const proprietaire = this.quoteParts[index].proprietaire;
    
    if (confirm(`Supprimer ${proprietaire.nom} ${proprietaire.prenom || ''} de la liste ?`)) {
      this.quoteParts.splice(index, 1);
      this.quotePartsArray.removeAt(index);
      
      // Redistribuer si nécessaire
      if (this.quotePartsForm.get('modeRepartition')?.value === 'egale') {
        this.distributeEqually();
      }
      
      this.showSuccess('Propriétaire supprimé');
    }
  }

  // =====================================================
  // MODES DE RÉPARTITION
  // =====================================================

  distributeEqually(): void {
    if (this.quoteParts.length === 0) return;

    const equalQuotePart = 1 / this.quoteParts.length;
    
    this.quotePartsArray.controls.forEach(control => {
      control.patchValue({
        quotePart: equalQuotePart,
        montantIndividuel: equalQuotePart * this.montantTotalTnb
      });
    });

    this.showSuccess('Répartition égale appliquée');
  }

  distributeProportionally(): void {
    // Implémentation de la répartition proportionnelle
    // Basée sur la surface, la valeur, etc.
    const baseCalcul = this.quotePartsForm.get('baseCalcul')?.value;
    
    // Pour l'exemple, utiliser une répartition égale
    this.distributeEqually();
  }

  resetDistribution(): void {
    this.quotePartsArray.controls.forEach(control => {
      control.patchValue({
        quotePart: 0,
        montantIndividuel: 0
      });
    });

    this.showSuccess('Répartition réinitialisée');
  }

  // =====================================================
  // CHANGEMENT DE MODE D'ÉDITION
  // =====================================================

  changeEditMode(mode: any): void {
    this.editMode = mode;
    
    // Ajuster les contrôles selon le mode
    this.quotePartsArray.controls.forEach(control => {
      const quotePartControl = control.get('quotePart');
      const montantControl = control.get('montantIndividuel');
      
      if (mode === 'percentage') {
        quotePartControl?.enable();
        montantControl?.disable();
      } else if (mode === 'amount') {
        quotePartControl?.disable();
        montantControl?.enable();
      } else {
        quotePartControl?.enable();
        montantControl?.enable();
      }
    });

    this.showSuccess(`Mode ${this.editModes.find(m => m.value === mode)?.label} activé`);
  }

  onSliderChange(index: number, event: any): void {
    const value = parseFloat(event.target?.value || event.value || 0);
    if (this.editMode !== 'visual') return;

    const control = this.quotePartsArray.at(index);
    const quotePart = value / 100; // Convertir de 0-100 à 0-1
    
    control.patchValue({
      quotePart,
      montantIndividuel: quotePart * this.montantTotalTnb
    });
  }

  onAmountChange(index: number, amount: number): void {
    if (this.editMode !== 'amount') return;

    const control = this.quotePartsArray.at(index);
    const quotePart = this.montantTotalTnb > 0 ? amount / this.montantTotalTnb : 0;
    
    control.patchValue({
      quotePart: Math.min(quotePart, 1),
      montantIndividuel: amount
    });
  }

  // =====================================================
  // VALIDATION
  // =====================================================

  private validateQuoteParts(): void {
    const validation: QuotePartValidation = {
      isValid: true,
      totalQuotePart: 0,
      errors: [],
      warnings: []
    };

    // Calculer le total des quote-parts
    validation.totalQuotePart = this.quoteParts
      .filter(qp => qp.estActif)
      .reduce((total, qp) => total + qp.quotePart, 0);

    // Vérifications
    if (this.quoteParts.length === 0) {
      validation.errors.push('Aucun propriétaire défini');
      validation.isValid = false;
    }

    if (Math.abs(validation.totalQuotePart - 1) > 0.001) {
      validation.errors.push(`Total des quote-parts: ${(validation.totalQuotePart * 100).toFixed(2)}% (doit être 100%)`);
      validation.isValid = false;
    }

    // Vérifications individuelles
    this.quoteParts.forEach((qp, index) => {
      if (qp.quotePart <= 0) {
        validation.errors.push(`Quote-part ${index + 1}: doit être supérieure à 0`);
        validation.isValid = false;
      }
      
      if (qp.quotePart > 1) {
        validation.errors.push(`Quote-part ${index + 1}: ne peut pas dépasser 100%`);
        validation.isValid = false;
      }
    });

    // Avertissements
    if (validation.totalQuotePart > 0.99 && validation.totalQuotePart < 1) {
      validation.warnings.push('Total proche de 100% - vérifiez les arrondis');
    }

    this.currentValidation = validation;
    this.validationChange.emit(validation);
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  getProprietaireDisplay(proprietaire: Proprietaire): string {
    const nom = `${proprietaire.nom} ${proprietaire.prenom || ''}`.trim();
    const identifiant = proprietaire.cin_ou_rc ? ` (${proprietaire.cin_ou_rc})` : '';
    return nom + identifiant;
  }

  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  }

  getValidationClass(): string {
    if (this.currentValidation.errors.length > 0) return 'error';
    if (this.currentValidation.warnings.length > 0) return 'warning';
    return 'success';
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

  // Getters pour le template
  get isValid(): boolean {
    return this.currentValidation.isValid;
  }

  get totalQuotePartPercentage(): number {
    return this.currentValidation.totalQuotePart * 100;
  }

  get remainingQuotePart(): number {
    return Math.max(0, 1 - this.currentValidation.totalQuotePart);
  }

  get availableProprietairesFiltered(): Proprietaire[] {
    const usedIds = this.quoteParts.map(qp => qp.proprietaireId);
    return this.availableProprietaires.filter(p => !usedIds.includes(p.id));
  }
}
