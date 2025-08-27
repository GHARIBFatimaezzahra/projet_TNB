// =====================================================
// ONGLET PROPRIÉTAIRES - GESTION INDIVISION
// =====================================================

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// Services
import { IndivisionService } from '../../../services/indivision.service';

// Validators
import { QuotePartValidator } from '../../../validators/quote-part.validator';
import { CinValidator } from '../../../../../shared/validators/cin.validator';
import { PhoneValidator } from '../../../../../shared/validators/phone.validator';

// Models
import { Proprietaire, ParcelleProprietaire, NatureProprietaire } from '../../../models/parcelle.models';

@Component({
  selector: 'app-proprietaires-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  templateUrl: './proprietaires-tab.component.html',
  styleUrls: ['./proprietaires-tab.component.scss']
})
export class ProprietairesTabComponent implements OnInit, OnDestroy {
  @Input() formGroup!: FormGroup;
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() parcelleId?: number;

  // FormArray pour les propriétaires
  get proprietairesFormArray(): FormArray {
    return this.formGroup.get('proprietaires') as FormArray;
  }

  // Configuration table
  displayedColumns = ['nom', 'nature', 'cin_ou_rc', 'quote_part', 'montant_individuel', 'actions'];
  
  // Options
  naturesProprietaire = Object.values(NatureProprietaire);
  
  // État
  isAddingProprietaire = false;
  searchingProprietaires = false;
  calculatingQuoteParts = false;
  
  // Validation quote-parts
  totalQuotePart = 0;
  isQuotePartValid = false;
  
  // Recherche propriétaires existants
  proprietairesExistants: Proprietaire[] = [];
  proprietairesFiltres: Proprietaire[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private indivisionService: IndivisionService
  ) {}

  ngOnInit(): void {
    this.initializeProprietairesArray();
    this.setupValidationListeners();
    this.loadProprietairesExistants();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initializeProprietairesArray(): void {
    if (!this.proprietairesFormArray) {
      this.formGroup.addControl('proprietaires', this.fb.array([]));
    }
    
    // Ajouter un propriétaire par défaut si aucun
    if (this.proprietairesFormArray.length === 0) {
      this.addProprietaire();
    }
    
    this.calculateTotalQuotePart();
  }

  private setupValidationListeners(): void {
    // Écouter les changements de quote-parts
    this.proprietairesFormArray.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.calculateTotalQuotePart();
        this.updateMontantsIndividuels();
      });
  }

  private loadProprietairesExistants(): void {
    this.searchingProprietaires = true;
    
    this.indivisionService.getProprietairesExistants()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (proprietaires) => {
          this.proprietairesExistants = proprietaires;
          this.proprietairesFiltres = proprietaires;
          this.searchingProprietaires = false;
        },
        error: (error) => {
          console.error('Erreur chargement propriétaires:', error);
          this.searchingProprietaires = false;
        }
      });
  }

  // =====================================================
  // GESTION PROPRIÉTAIRES
  // =====================================================

  addProprietaire(): void {
    if (this.isViewMode) return;

    const proprietaireForm = this.createProprietaireForm();
    this.proprietairesFormArray.push(proprietaireForm);
    this.isAddingProprietaire = true;
    
    // Recalculer les quote-parts
    this.redistributeQuoteParts();
  }

  removeProprietaire(index: number): void {
    if (this.isViewMode || this.proprietairesFormArray.length <= 1) return;

    this.proprietairesFormArray.removeAt(index);
    this.redistributeQuoteParts();
    this.showSuccess('Propriétaire supprimé');
  }

  private createProprietaireForm(): FormGroup {
    return this.fb.group({
      id: [null],
      proprietaire_id: [null],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: [''],
      nature: [NatureProprietaire.PHYSIQUE, Validators.required],
      cin_ou_rc: ['', [Validators.required, CinValidator.validate]],
      adresse: [''],
      telephone: ['', [PhoneValidator.validate]],
      email: ['', [Validators.email]],
      quote_part: [0, [
        Validators.required,
        Validators.min(0.01),
        Validators.max(1),
        QuotePartValidator.validate()
      ]],
      montant_individuel: [{ value: 0, disabled: true }],
      date_debut: [new Date()],
      date_fin: [null],
      est_actif: [true]
    });
  }

  // =====================================================
  // MÉTHODES UTILITAIRES
  // =====================================================

  getProprietaireDisplayName(proprietaireForm: any): string {
    if (!(proprietaireForm instanceof FormGroup)) return 'Nouveau propriétaire';
    const nom = proprietaireForm.get('proprietaire')?.get('nom')?.value || '';
    const prenom = proprietaireForm.get('proprietaire')?.get('prenom')?.value || '';
    return prenom ? `${nom} ${prenom}` : nom;
  }

  // =====================================================
  // GESTION QUOTE-PARTS
  // =====================================================

  private calculateTotalQuotePart(): void {
    this.totalQuotePart = this.proprietairesFormArray.controls
      .reduce((total, control) => {
        const quotePart = parseFloat(control.get('quote_part')?.value || 0);
        return total + quotePart;
      }, 0);
    
    this.isQuotePartValid = Math.abs(this.totalQuotePart - 1.0) < 0.001;
    
    // Mettre à jour la validation du FormArray
    if (!this.isQuotePartValid) {
      this.proprietairesFormArray.setErrors({ quotePartInvalid: true });
    } else {
      this.proprietairesFormArray.setErrors(null);
    }
  }

  private redistributeQuoteParts(): void {
    if (this.calculatingQuoteParts) return;
    
    const count = this.proprietairesFormArray.length;
    if (count === 0) return;
    
    this.calculatingQuoteParts = true;
    const equalQuotePart = 1.0 / count;
    
    this.proprietairesFormArray.controls.forEach(control => {
      control.get('quote_part')?.setValue(equalQuotePart, { emitEvent: false });
    });
    
    this.calculateTotalQuotePart();
    this.updateMontantsIndividuels();
    this.calculatingQuoteParts = false;
  }

  redistributeEqually(): void {
    if (this.isViewMode) return;
    this.redistributeQuoteParts();
    this.showSuccess('Quote-parts redistribuées équitablement');
  }

  normalizeQuoteParts(): void {
    if (this.isViewMode || this.totalQuotePart === 0) return;
    
    const factor = 1.0 / this.totalQuotePart;
    
    this.proprietairesFormArray.controls.forEach(control => {
      const currentQuotePart = parseFloat(control.get('quote_part')?.value || 0);
      const normalizedQuotePart = currentQuotePart * factor;
      control.get('quote_part')?.setValue(normalizedQuotePart);
    });
    
    this.showSuccess('Quote-parts normalisées');
  }

  // =====================================================
  // CALCULS FISCAUX
  // =====================================================

  private updateMontantsIndividuels(): void {
    const montantTotalTnb = this.formGroup.get('montant_total_tnb')?.value || 0;
    
    this.proprietairesFormArray.controls.forEach(control => {
      const quotePart = parseFloat(control.get('quote_part')?.value || 0);
      const montantIndividuel = montantTotalTnb * quotePart;
      control.get('montant_individuel')?.setValue(montantIndividuel);
    });
  }

  // =====================================================
  // RECHERCHE ET SÉLECTION
  // =====================================================

  searchProprietaires(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.proprietairesFiltres = this.proprietairesExistants;
      return;
    }
    
    const term = searchTerm.toLowerCase();
    this.proprietairesFiltres = this.proprietairesExistants.filter(p =>
      p.nom.toLowerCase().includes(term) ||
      (p.prenom && p.prenom.toLowerCase().includes(term)) ||
      (p.cin_ou_rc && p.cin_ou_rc.toLowerCase().includes(term))
    );
  }

  selectProprietaireExistant(proprietaire: Proprietaire, index: number): void {
    if (this.isViewMode) return;
    
    const control = this.proprietairesFormArray.at(index);
    control.patchValue({
      proprietaire_id: proprietaire.id,
      nom: proprietaire.nom,
      prenom: proprietaire.prenom,
      nature: proprietaire.nature,
      cin_ou_rc: proprietaire.cin_ou_rc,
      adresse: proprietaire.adresse,
      telephone: proprietaire.telephone,
      email: proprietaire.email
    });
    
    this.showSuccess('Propriétaire sélectionné');
  }

  // =====================================================
  // VALIDATION
  // =====================================================

  validateProprietaires(): boolean {
    if (this.proprietairesFormArray.length === 0) {
      this.showError('Au moins un propriétaire est requis');
      return false;
    }
    
    if (!this.isQuotePartValid) {
      this.showError('La somme des quote-parts doit être égale à 1.00');
      return false;
    }
    
    // Vérifier les doublons de CIN/RC
    const cinsRcs = this.proprietairesFormArray.controls
      .map(c => c.get('cin_ou_rc')?.value)
      .filter(cin => cin);
    
    const duplicates = cinsRcs.filter((cin, index) => cinsRcs.indexOf(cin) !== index);
    if (duplicates.length > 0) {
      this.showError('Des CIN/RC en doublon ont été détectés');
      return false;
    }
    
    return true;
  }

  // =====================================================
  // ACTIONS SPÉCIALES
  // =====================================================

  openProprietaireDialog(index?: number): void {
    // Ouvrir dialog pour créer/modifier propriétaire
    // À implémenter avec MatDialog
  }

  importFromExistingParcelle(): void {
    // Importer propriétaires d'une autre parcelle
    // À implémenter
  }

  exportProprietaires(): void {
    const data = this.proprietairesFormArray.value;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proprietaires_${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    this.showSuccess('Propriétaires exportés');
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  get canAddProprietaire(): boolean {
    return !this.isViewMode && this.proprietairesFormArray.length < 10; // Limite arbitraire
  }

  get canRemoveProprietaire(): boolean {
    return !this.isViewMode && this.proprietairesFormArray.length > 1;
  }



  getQuotePartPercentage(quotePart: number): string {
    return `${(quotePart * 100).toFixed(2)}%`;
  }

  getValidationMessage(): string {
    if (this.totalQuotePart < 1.0) {
      return `Il manque ${((1.0 - this.totalQuotePart) * 100).toFixed(2)}% de quote-parts`;
    } else if (this.totalQuotePart > 1.0) {
      return `Excédent de ${((this.totalQuotePart - 1.0) * 100).toFixed(2)}% de quote-parts`;
    }
    return 'Quote-parts valides';
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
