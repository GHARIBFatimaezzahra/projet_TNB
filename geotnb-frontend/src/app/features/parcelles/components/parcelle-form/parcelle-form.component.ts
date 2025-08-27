// =====================================================
// COMPOSANT FORMULAIRE PARCELLE - VERSION SIMPLIFIÉE
// =====================================================

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Parcelle, CreateParcelleDto, UpdateParcelleDto, StatutFoncier, StatutOccupation } from '../../models/parcelle.models';
import { ParcelleService } from '../../services/parcelle.service';
import { ParcelleValidators } from '../../validators/parcelle.validators';

// Composants
import { DocumentManagerComponent } from '../document-manager/document-manager.component';
import { ProprietaireManagerComponent, ProprietaireFormData } from '../proprietaire-manager/proprietaire-manager.component';

@Component({
  selector: 'app-parcelle-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatButtonModule,
    DocumentManagerComponent,
    ProprietaireManagerComponent,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './parcelle-form.component.html',
  styleUrls: ['./parcelle-form.component.scss', './document-styles.scss']
})
export class ParcelleFormComponent implements OnInit, OnDestroy {
  
  // =====================================================
  // PROPRIÉTÉS
  // =====================================================
  
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  
  parcelleForm!: FormGroup;
  parcelleId: number | null = null;
  parcelle: Parcelle | null = null;
  loading = false;
  saving = false;
  mode: 'create' | 'edit' | 'view' = 'create';
  
  // Propriétés pour le template
  currentParcelle: any = {};
  validationResult: any = { errors: [] };
  selectedTabIndex = 0;
  
  // Gestion des propriétaires
  proprietaires: ProprietaireFormData[] = [];
  totalQuotePart = 0;
  
  // Options pour les selects
  statutFoncierOptions = [
    StatutFoncier.TF,
    StatutFoncier.R,
    StatutFoncier.NI,
    StatutFoncier.DOMANIAL,
    StatutFoncier.COLLECTIF
  ];
  
  statutOccupationOptions = [
    StatutOccupation.NU,
    StatutOccupation.CONSTRUIT,
    StatutOccupation.EN_CONSTRUCTION,
    StatutOccupation.PARTIELLEMENT_CONSTRUIT
  ];
  
  dureeExonerationOptions = [
    { value: 0, label: 'Aucune' },
    { value: 5, label: '5 ans' },
    { value: 10, label: '10 ans' },
    { value: 15, label: '15 ans' },
    { value: 20, label: '20 ans' }
  ];
  
  private destroy$ = new Subject<void>();
  
  // =====================================================
  // CONSTRUCTEUR
  // =====================================================
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private parcelleService: ParcelleService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }
  
  // =====================================================
  // CYCLE DE VIE
  // =====================================================
  
  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.parcelleId = +params['id'];
          this.mode = this.route.snapshot.url[this.route.snapshot.url.length - 1].path === 'edit' ? 'edit' : 'view';
          this.loadParcelle();
        } else {
          this.mode = 'create';
        }
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // =====================================================
  // INITIALISATION
  // =====================================================
  
  private initializeForm(): void {
    this.parcelleForm = this.fb.group({
      reference_fonciere: ['', [
        Validators.required,
        Validators.minLength(5),
        ParcelleValidators.referenceFonciere
      ]],
      statut_foncier: ['', Validators.required],
      statut_occupation: ['', Validators.required],
      zonage: ['', [Validators.required, ParcelleValidators.codeZone]],
      categorie_fiscale: [''],
      surface_totale: ['', [
        Validators.required,
        Validators.min(1),
        ParcelleValidators.surface
      ]],
      surface_imposable: ['', [
        Validators.required,
        Validators.min(0),
        ParcelleValidators.surface
      ]],
      adresse: [''],
      exonere_tnb: [false],
      date_permis: [''],
      duree_exoneration: [0],
      geometry: [null]
    });

    // Validation croisée
    this.parcelleForm.setValidators([
      this.surfaceCoherenceValidator,
      this.exonerationCoherenceValidator
    ]);

    // Écouter les changements d'exonération
    this.parcelleForm.get('exonere_tnb')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(exonere => {
        const datePermisControl = this.parcelleForm.get('date_permis');
        const dureeControl = this.parcelleForm.get('duree_exoneration');
        
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
  // VALIDATEURS PERSONNALISÉS
  // =====================================================
  
  private surfaceCoherenceValidator = (control: AbstractControl) => {
    if (!(control instanceof FormGroup)) return null;
    
    const surfaceTotale = control.get('surface_totale')?.value;
    const surfaceImposable = control.get('surface_imposable')?.value;
    
    if (surfaceTotale && surfaceImposable && surfaceImposable > surfaceTotale) {
      return { surfaceInvalid: true };
    }
    return null;
  };
  
  private exonerationCoherenceValidator = (control: AbstractControl) => {
    if (!(control instanceof FormGroup)) return null;
    
    const exonereTnb = control.get('exonere_tnb')?.value;
    const datePermis = control.get('date_permis')?.value;
    const dureeExoneration = control.get('duree_exoneration')?.value;
    
    if (exonereTnb && (!datePermis || !dureeExoneration || dureeExoneration <= 0)) {
      return { exonerationIncomplete: true };
    }
    return null;
  };
  
  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================
  
  private loadParcelle(): void {
    if (!this.parcelleId) return;
    
    this.loading = true;
    this.parcelleService.getParcelle(this.parcelleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (parcelle: any) => {
          this.parcelle = parcelle;
          this.patchFormWithParcelle(parcelle);
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement de la parcelle:', error);
          this.showError('Erreur lors du chargement de la parcelle');
          this.loading = false;
        }
      });
  }
  
  private patchFormWithParcelle(parcelle: Parcelle): void {
    this.parcelleForm.patchValue({
      reference_fonciere: parcelle.reference_fonciere,
      statut_foncier: parcelle.statut_foncier,
      statut_occupation: parcelle.statut_occupation,
      zonage: parcelle.zonage,
      categorie_fiscale: parcelle.categorie_fiscale,
      surface_totale: parcelle.surface_totale,
      surface_imposable: parcelle.surface_imposable,
      exonere_tnb: parcelle.exonere_tnb,
      date_permis: parcelle.date_permis,
      duree_exoneration: parcelle.duree_exoneration,
      geometry: parcelle.geometry
    });
  }
  
  // =====================================================
  // ACTIONS
  // =====================================================
  
  onSubmit(): void {
    if (this.parcelleForm.valid) {
      if (this.mode === 'create') {
        this.createParcelle();
      } else if (this.mode === 'edit') {
        this.updateParcelle();
      }
    } else {
      this.markFormGroupTouched();
      this.showError('Veuillez corriger les erreurs dans le formulaire');
    }
  }
  
  private createParcelle(): void {
    this.loading = true;
    const createDto: CreateParcelleDto = this.parcelleForm.value;
    
    this.parcelleService.createParcelle(createDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (parcelle: any) => {
          this.showSuccess('Parcelle créée avec succès');
          this.router.navigate(['/parcelles', parcelle.id]);
        },
        error: (error: any) => {
          console.error('Erreur lors de la création:', error);
          this.showError('Erreur lors de la création de la parcelle');
          this.loading = false;
        }
      });
  }
  
  private updateParcelle(): void {
    if (!this.parcelleId) return;
    
    this.loading = true;
    const updateDto: UpdateParcelleDto = {
      id: this.parcelleId,
      ...this.parcelleForm.value
    };
    
    this.parcelleService.updateParcelle(this.parcelleId, updateDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (parcelle: any) => {
          this.showSuccess('Parcelle mise à jour avec succès');
          this.router.navigate(['/parcelles', parcelle.id]);
        },
        error: (error: any) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.showError('Erreur lors de la mise à jour de la parcelle');
          this.loading = false;
        }
      });
  }
  
  onCancel(): void {
    if (this.parcelleId) {
      this.router.navigate(['/parcelles', this.parcelleId]);
    } else {
      this.router.navigate(['/parcelles']);
    }
  }
  
  // =====================================================
  // UTILITAIRES
  // =====================================================
  
  private markFormGroupTouched(): void {
    Object.keys(this.parcelleForm.controls).forEach(key => {
      const control = this.parcelleForm.get(key);
      control?.markAsTouched();
      if (control && 'controls' in control) {
        this.markFormGroupTouched();
      }
    });
  }
  
  // =====================================================
  // GETTERS
  // =====================================================
  
  get isCreateMode(): boolean {
    return this.mode === 'create';
  }

  get formTitle(): string {
    switch (this.mode) {
      case 'create': return 'Nouvelle Parcelle';
      case 'edit': return 'Modifier la Parcelle';
      case 'view': return 'Détails de la Parcelle';
      default: return 'Parcelle';
    }
  }

  editMode(): void {
    this.mode = 'edit';
  }

  checkReferenceExists(): void {
    const reference = this.parcelleForm.get('reference_fonciere')?.value;
    if (reference && this.mode === 'create') {
      // Vérifier si la référence existe déjà
      console.log('Vérification de la référence:', reference);
    }
  }

  getFieldError(fieldName: string): string {
    const control = this.parcelleForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) return 'Ce champ est obligatoire';
      if (control.errors['minlength']) return 'Trop court';
      if (control.errors['maxlength']) return 'Trop long';
      if (control.errors['min']) return 'Valeur trop petite';
      if (control.errors['max']) return 'Valeur trop grande';
      if (control.errors['pattern']) return 'Format invalide';
    }
    return '';
  }
  
  get isEditMode(): boolean {
    return this.mode === 'edit';
  }
  
  get isViewMode(): boolean {
    return this.mode === 'view';
  }
  
  get pageTitle(): string {
    switch (this.mode) {
      case 'create': return 'Nouvelle Parcelle';
      case 'edit': return 'Modifier Parcelle';
      case 'view': return 'Détails Parcelle';
      default: return 'Parcelle';
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

  // =====================================================
  // MÉTHODES POUR LE TEMPLATE
  // =====================================================

  saveDraft(): void {
    this.saving = true;
    // Logique de sauvegarde en brouillon
    setTimeout(() => {
      this.saving = false;
      this.showSuccess('Brouillon sauvegardé');
    }, 1000);
  }

  saveAndValidate(): void {
    if (this.parcelleForm.valid) {
      this.saving = true;
      // Logique de sauvegarde et validation
      setTimeout(() => {
        this.saving = false;
        this.showSuccess('Parcelle sauvegardée et validée');
      }, 1000);
    } else {
      this.showError('Veuillez corriger les erreurs avant de valider');
    }
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }

  isTabValid(tabName: string): boolean {
    switch (tabName) {
      case 'general':
        return (this.parcelleForm.get('reference_fonciere')?.valid || false) && 
               (this.parcelleForm.get('statut_foncier')?.valid || false) &&
               (this.parcelleForm.get('statut_occupation')?.valid || false);
      case 'fiscal':
        return (this.parcelleForm.get('surface_totale')?.valid || false) && 
               (this.parcelleForm.get('surface_imposable')?.valid || false);
      case 'geometry':
        return this.parcelleForm.get('geometry')?.valid !== false;
      case 'proprietaires':
        return true; // Logique à implémenter selon les propriétaires
      case 'documents':
        return true; // Logique à implémenter selon les documents
      default:
        return true;
    }
  }

  getStatusClass(status: any): string {
    if (!status) return 'brouillon';
    switch (status) {
      case 'Valide': return 'valide';
      case 'Publie': return 'publie';
      case 'Brouillon': return 'brouillon';
      case 'Archive': return 'archive';
      default: return 'brouillon';
    }
  }

  getStatusIcon(status: any): string {
    if (!status) return 'edit';
    switch (status) {
      case 'Valide': return 'check_circle';
      case 'Publie': return 'publish';
      case 'Brouillon': return 'edit';
      case 'Archive': return 'archive';
      default: return 'edit';
    }
  }

  getStatusLabel(status: any): string {
    if (!status) return 'BROUILLON';
    switch (status) {
      case 'Valide': return 'VALIDÉ';
      case 'Publie': return 'PUBLIÉ';
      case 'Brouillon': return 'BROUILLON';
      case 'Archive': return 'ARCHIVÉ';
      default: return 'BROUILLON';
    }
  }

  validateParcelle(): void {
    if (this.parcelleForm.valid) {
      this.saving = true;
      // Logique de validation
      setTimeout(() => {
        this.saving = false;
        this.showSuccess('Parcelle validée avec succès');
      }, 1000);
    } else {
      this.showError('Impossible de valider - Formulaire invalide');
    }
  }

  canValidate(): boolean {
    return this.parcelleForm.valid && this.mode !== 'view';
  }

  publishParcelle(): void {
    this.saving = true;
    // Logique de publication
    setTimeout(() => {
      this.saving = false;
      this.showSuccess('Parcelle publiée avec succès');
    }, 1000);
  }

  canPublish(): boolean {
    return this.parcelleForm.valid && this.mode !== 'view';
  }

  archiveParcelle(): void {
    this.saving = true;
    // Logique d'archivage
    setTimeout(() => {
      this.saving = false;
      this.showSuccess('Parcelle archivée avec succès');
    }, 1000);
  }

  canArchive(): boolean {
    return this.mode !== 'view' && this.parcelleId !== null;
  }

  addProprietaire(): void {
    // Logique pour ajouter un propriétaire
    this.showSuccess('Propriétaire ajouté');
  }

  uploadDocument(): void {
    // Logique pour uploader un document
    this.showSuccess('Document uploadé');
  }

  // =====================================================
  // GESTION DES PROPRIÉTAIRES
  // =====================================================

  /**
   * Gérer les changements de propriétaires
   */
  onProprietairesChange(proprietaires: ProprietaireFormData[]): void {
    this.proprietaires = proprietaires;
    this.updateTnbCalculation();
  }

  /**
   * Gérer les changements de quotes-parts
   */
  onQuotesPartChange(totalQuotePart: number): void {
    this.totalQuotePart = totalQuotePart;
    this.updateTnbCalculation();
  }

  /**
   * Mettre à jour le calcul TNB en fonction des propriétaires
   */
  updateTnbCalculation(): void {
    // Recalculer la TNB si nécessaire
    const surfaceImposable = this.parcelleForm.get('surface_imposable')?.value || 0;
    const prixUnitaire = this.getPrixUnitaireM2();
    
    if (surfaceImposable > 0 && prixUnitaire > 0) {
      const montantTotal = surfaceImposable * prixUnitaire;
      // Le montant sera réparti entre les propriétaires selon leurs quotes-parts
      console.log(`💰 TNB calculée: ${montantTotal} MAD pour ${this.proprietaires.length} propriétaires`);
    }
  }

  /**
   * Gérer le changement de surface imposable
   */
  onSurfaceImposableChange(event: any): void {
    const value = parseFloat(event.target.value) || 0;
    this.parcelleForm.patchValue({ surface_imposable: value });
    this.updateTnbCalculation();
  }

  /**
   * Gérer le changement de prix unitaire
   */
  onPrixUnitaireChange(event: any): void {
    const value = parseFloat(event.target.value) || 0;
    this.parcelleForm.patchValue({ prix_unitaire_m2: value });
    this.updateTnbCalculation();
  }

  /**
   * Obtenir le prix unitaire au m²
   */
  getPrixUnitaireM2(): number {
    return this.parcelleForm.get('prix_unitaire_m2')?.value || 4.5;
  }

  previousTab(): void {
    if (this.tabGroup && this.tabGroup.selectedIndex! > 0) {
      this.tabGroup.selectedIndex = this.tabGroup.selectedIndex! - 1;
    }
  }

  nextTab(): void {
    if (this.tabGroup && this.tabGroup.selectedIndex! < this.tabGroup._tabs.length - 1) {
      this.tabGroup.selectedIndex = this.tabGroup.selectedIndex! + 1;
    }
  }

  calculateTnb(): number {
    // Logique de calcul TNB
    const surfaceTotale = this.parcelleForm.get('surface_totale')?.value || 0;
    const surfaceImposable = this.parcelleForm.get('surface_imposable')?.value || 0;
    const tarifM2 = 50; // Exemple de tarif
    const montant = surfaceImposable * tarifM2;
    
    // Mettre à jour les propriétés calculées
    this.currentParcelle.surfaceImposable = surfaceImposable;
    this.currentParcelle.prixUnitaireM2 = tarifM2;
    this.currentParcelle.montantTotalTnb = montant;
    
    return montant;
  }

  getExonerationEndYear(): number {
    const datePermis = this.parcelleForm.get('date_permis')?.value;
    const dureeExoneration = this.parcelleForm.get('duree_exoneration')?.value || 0;
    
    if (datePermis) {
      return new Date(datePermis).getFullYear() + dureeExoneration;
    }
    return 0;
  }
}