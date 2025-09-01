// =====================================================
// INTERFACE 2 - FORMULAIRE DE CRÉATION PARCELLE
// Design exact selon le code HTML/CSS fourni
// =====================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Services
import { ParcelleManagementService } from '../../services/parcelle-management.service';

@Component({
  selector: 'app-parcelle-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './parcelle-form.component.html',
  styleUrls: ['./parcelle-form.component.scss']
})
export class ParcelleFormComponent implements OnInit, OnDestroy {

  // =====================================================
  // PROPRIÉTÉS - INTERFACE 2 DESIGN EXACT
  // =====================================================

  // Onglet actif
  activeTab: 'general' | 'fiscal' | 'geometry' | 'documents' | 'proprietaires' = 'general';

  // Mode du composant
  isEditMode = false;
  parcelleId?: number;
  loading = false;

  // Forms pour chaque onglet
  parcelleForm!: FormGroup;
  fiscalForm!: FormGroup;

  // Calcul TNB
  calculatedTNB = 0;
  currentYear = new Date().getFullYear();

  // Données de référence
  tabLabels = {
    general: 'Général',
    fiscal: 'Fiscal', 
    geometry: 'Géométrie',
    documents: 'Documents',
    proprietaires: 'Propriétaires'
  };

  private destroy$ = new Subject<void>();

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private parcelleService: ParcelleManagementService
  ) {
    this.initializeForms();
  }

  // =====================================================
  // LIFECYCLE
  // =====================================================

  ngOnInit(): void {
    this.checkEditMode();
    this.setupFormWatchers();
    this.calculateTNB();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION DES FORMULAIRES
  // =====================================================

  private initializeForms(): void {
    // Formulaire onglet Général
    this.parcelleForm = this.fb.group({
      reference: ['', [Validators.required, Validators.pattern(/^(TF|R|NI)-\d{6}-[A-Z]$/)]],
      statut_foncier: ['', Validators.required],
      surface_totale: [0, [Validators.required, Validators.min(0.01)]],
      zone: ['', Validators.required],
      statut_occupation: ['Nu'],
      adresse: [''],
      observations: ['']
    });

    // Formulaire onglet Fiscal
    this.fiscalForm = this.fb.group({
      surface_imposable: [0, [Validators.required, Validators.min(0.01)]],
      prix_unitaire: [10, [Validators.required, Validators.min(0.01)]],
      coefficient_abattement: [1],
      annee_fiscale: [this.currentYear],
      exonere_tnb: [false],
      date_permis: [''],
      duree_exoneration: ['']
    });
  }

  private setupFormWatchers(): void {
    // Watcher pour le calcul automatique TNB
    this.fiscalForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.calculateTNB();
      });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.parcelleId = parseInt(id);
      this.loadParcelleData(this.parcelleId);
    }
  }

  // =====================================================
  // GESTION DES ONGLETS
  // =====================================================

  switchTab(tab: 'general' | 'fiscal' | 'geometry' | 'documents' | 'proprietaires'): void {
    this.activeTab = tab;
    console.log('🔄 Changement d\'onglet vers:', tab);
  }

  nextTab(): void {
    const tabs = ['general', 'fiscal', 'geometry', 'documents', 'proprietaires'];
    const currentIndex = tabs.indexOf(this.activeTab);
    
    if (currentIndex < tabs.length - 1) {
      this.activeTab = tabs[currentIndex + 1] as any;
      console.log('➡️ Onglet suivant:', this.activeTab);
    } else {
      this.finalizeCreation();
    }
  }

  getNextTabLabel(): string {
    const tabs = ['general', 'fiscal', 'geometry', 'documents', 'proprietaires'];
    const currentIndex = tabs.indexOf(this.activeTab);
    
    if (currentIndex < tabs.length - 1) {
      const nextTab = tabs[currentIndex + 1];
      return this.tabLabels[nextTab as keyof typeof this.tabLabels];
    }
    return 'Finaliser';
  }

  // =====================================================
  // CALCUL TNB AUTOMATIQUE
  // =====================================================

  calculateTNB(): void {
    const surfaceImposable = this.fiscalForm.get('surface_imposable')?.value || 0;
    const prixUnitaire = this.fiscalForm.get('prix_unitaire')?.value || 0;
    const coefficientAbattement = this.fiscalForm.get('coefficient_abattement')?.value || 1;
    const exonere = this.fiscalForm.get('exonere_tnb')?.value || false;

    if (exonere) {
      this.calculatedTNB = 0;
    } else {
      this.calculatedTNB = surfaceImposable * prixUnitaire * coefficientAbattement;
    }

    console.log('💰 TNB calculée:', this.calculatedTNB, 'DH');
  }

  recalculateTNB(): void {
    this.calculateTNB();
    this.snackBar.open('TNB recalculée: ' + this.formatCurrency(this.calculatedTNB), 'Fermer', {
      duration: 3000
    });
  }

  // =====================================================
  // GESTION DE L'EXONÉRATION
  // =====================================================

  getExonerationEndDate(): string {
    const datePermis = this.fiscalForm.get('date_permis')?.value;
    const dureeExoneration = this.fiscalForm.get('duree_exoneration')?.value;

    if (datePermis && dureeExoneration) {
      const date = new Date(datePermis);
      date.setFullYear(date.getFullYear() + parseInt(dureeExoneration));
      return date.toLocaleDateString('fr-FR');
    }

    return 'Non définie';
  }

  // =====================================================
  // SAUVEGARDE ET ACTIONS
  // =====================================================

  saveDraft(): void {
    if (this.parcelleForm.valid) {
      const formData = {
        ...this.parcelleForm.value,
        ...this.fiscalForm.value,
        statut: 'BROUILLON',
        tnb_calculee: this.calculatedTNB
      };

      console.log('💾 Sauvegarde brouillon:', formData);
      
      // Simulation de sauvegarde pour l'instant
      console.log('💾 Sauvegarde brouillon (mock):', formData);
      this.snackBar.open('Brouillon sauvegardé avec succès', 'Fermer', {
        duration: 3000
      });
    } else {
      this.markFormGroupTouched(this.parcelleForm);
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', {
        duration: 3000
      });
    }
  }

  finalizeCreation(): void {
    if (this.parcelleForm.valid && this.fiscalForm.valid) {
      const formData = {
        ...this.parcelleForm.value,
        ...this.fiscalForm.value,
        statut: 'VALIDE',
        tnb_calculee: this.calculatedTNB
      };

      console.log('✅ Finalisation création:', formData);
      
      // Simulation de création pour l'instant
      console.log('✅ Finalisation création (mock):', formData);
      this.snackBar.open('Parcelle créée avec succès', 'Fermer', {
        duration: 3000
      });
      setTimeout(() => {
        this.router.navigate(['/parcelles/list']);
      }, 1000);
    } else {
      this.markFormGroupTouched(this.parcelleForm);
      this.markFormGroupTouched(this.fiscalForm);
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 3000
      });
    }
  }

  // =====================================================
  // CHARGEMENT DONNÉES (MODE ÉDITION)
  // =====================================================

  private loadParcelleData(id: number): void {
    this.loading = true;
    
    // Simulation de chargement pour l'instant
    console.log('📖 Chargement parcelle (mock):', id);
    
    // Mock data
    const mockParcelle = {
      reference: 'TF-478923-B',
      statut_foncier: 'TF',
      surface_totale: 1250.75,
      zone: 'R+4',
      statut_occupation: 'Nu',
      adresse: 'Quartier Al Qods, Oujda',
      observations: 'Terrain en bordure de route',
      surface_imposable: 1120.50,
      prix_unitaire_m2: 5.00,
      coefficient_abattement: 1,
      annee_fiscale: 2024,
      exonere_tnb: false,
      date_permis: null,
      duree_exoneration: null
    };
    
    setTimeout(() => {
      this.patchFormData(mockParcelle);
      this.loading = false;
    }, 500);
  }

  private patchFormData(parcelle: any): void {
    this.parcelleForm.patchValue({
      reference: parcelle.reference,
      statut_foncier: parcelle.statut_foncier,
      surface_totale: parcelle.surface_totale,
      zone: parcelle.zone,
      statut_occupation: parcelle.statut_occupation,
      adresse: parcelle.adresse,
      observations: parcelle.observations
    });

    this.fiscalForm.patchValue({
      surface_imposable: parcelle.surface_imposable,
      prix_unitaire: parcelle.prix_unitaire_m2,
      coefficient_abattement: parcelle.coefficient_abattement || 1,
      annee_fiscale: parcelle.annee_fiscale,
      exonere_tnb: parcelle.exonere_tnb,
      date_permis: parcelle.date_permis,
      duree_exoneration: parcelle.duree_exoneration
    });

    this.calculateTNB();
  }

  // =====================================================
  // MÉTHODES UTILITAIRES
  // =====================================================

  formatCurrency(amount: number): string {
    return amount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).replace('MAD', 'DH');
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  // =====================================================
  // GETTERS POUR LE TEMPLATE
  // =====================================================

  get isGeneralTabValid(): boolean {
    return this.parcelleForm.valid;
  }

  get isFiscalTabValid(): boolean {
    return this.fiscalForm.valid;
  }

  get canFinalize(): boolean {
    return this.isGeneralTabValid && this.isFiscalTabValid;
  }
}