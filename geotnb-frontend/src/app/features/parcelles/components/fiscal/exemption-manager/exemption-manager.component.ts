// =====================================================
// GESTIONNAIRE D'EXONÉRATIONS TNB
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';

// Models
import { Parcelle } from '../../../models/parcelle.models';

export interface ExemptionRule {
  id?: number;
  type: string;
  label: string;
  description: string;
  pourcentageExoneration: number;
  dureeMax: number;
  conditionsSpecifiques?: string[];
  documentsRequis?: string[];
  actif: boolean;
}

export interface ParcelleExemption {
  id?: number;
  parcelleId: number;
  typeExoneration: string;
  dateDebut: Date;
  dateFin: Date;
  pourcentageExoneration: number;
  montantExonere: number;
  motif: string;
  documentsJoints: string[];
  statut: 'Active' | 'Expiree' | 'Suspendue' | 'Annulee';
  validePar?: number;
  dateValidation?: Date;
}

@Component({
  selector: 'app-exemption-manager',
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
    MatTableModule,
    MatChipsModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './exemption-manager.component.html',
  styleUrls: ['./exemption-manager.component.scss']
})
export class ExemptionManagerComponent implements OnInit, OnDestroy {
  @Input() parcelle?: Parcelle;
  @Input() readonly = false;
  @Input() showHistory = true;

  @Output() exemptionChange = new EventEmitter<ParcelleExemption[]>();
  @Output() exemptionAdded = new EventEmitter<ParcelleExemption>();
  @Output() exemptionRemoved = new EventEmitter<number>();

  // Formulaires
  exemptionForm!: FormGroup;
  
  // État
  exemptions: ParcelleExemption[] = [];
  exemptionRules: ExemptionRule[] = [];
  isLoading = false;
  
  // Configuration
  exemptionTypes = [
    {
      value: 'permis_construire',
      label: 'Permis de construire',
      icon: 'home',
      color: 'primary',
      durees: [3, 5, 7],
      pourcentages: [100, 80, 60]
    },
    {
      value: 'zone_industrielle',
      label: 'Zone industrielle',
      icon: 'factory',
      color: 'accent',
      durees: [5, 10],
      pourcentages: [75, 50]
    },
    {
      value: 'investissement_agricole',
      label: 'Investissement agricole',
      icon: 'agriculture',
      color: 'primary',
      durees: [7, 10],
      pourcentages: [100, 75]
    },
    {
      value: 'logement_social',
      label: 'Logement social',
      icon: 'home_work',
      color: 'accent',
      durees: [10, 15],
      pourcentages: [100, 100]
    },
    {
      value: 'patrimoine_culturel',
      label: 'Patrimoine culturel',
      icon: 'account_balance',
      color: 'warn',
      durees: [5, 10, 20],
      pourcentages: [100, 100, 100]
    },
    {
      value: 'catastrophe_naturelle',
      label: 'Catastrophe naturelle',
      icon: 'warning',
      color: 'warn',
      durees: [1, 2, 3],
      pourcentages: [100, 100, 100]
    }
  ];

  // Colonnes des tables
  exemptionsColumns = ['type', 'periode', 'pourcentage', 'montant', 'statut', 'actions'];
  historyColumns = ['date', 'action', 'type', 'periode', 'utilisateur'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExemptionRules();
    this.loadParcelleExemptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initializeForm(): void {
    this.exemptionForm = this.fb.group({
      typeExoneration: ['', Validators.required],
      dateDebut: [new Date(), Validators.required],
      dureeExoneration: [3, [Validators.required, Validators.min(1)]],
      pourcentageExoneration: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
      motif: ['', [Validators.required, Validators.minLength(10)]],
      documentsJoints: this.fb.array([]),
      conditionsSpeciales: ['']
    });

    // Listener pour calculer automatiquement la date de fin
    this.exemptionForm.get('dateDebut')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateDateFin());

    this.exemptionForm.get('dureeExoneration')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateDateFin());

    // Listener pour ajuster le pourcentage selon le type
    this.exemptionForm.get('typeExoneration')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => this.onTypeChange(type));
  }

  private loadExemptionRules(): void {
    // Simuler le chargement des règles d'exonération
    this.exemptionRules = this.exemptionTypes.map((type, index) => ({
      id: index + 1,
      type: type.value,
      label: type.label,
      description: `Exonération pour ${type.label.toLowerCase()}`,
      pourcentageExoneration: type.pourcentages[0],
      dureeMax: Math.max(...type.durees),
      conditionsSpecifiques: this.getConditionsForType(type.value),
      documentsRequis: this.getDocumentsForType(type.value),
      actif: true
    }));
  }

  private loadParcelleExemptions(): void {
    if (!this.parcelle) return;

    // Simuler le chargement des exonérations de la parcelle
    this.exemptions = [
      {
        id: 1,
        parcelleId: this.parcelle.id,
        typeExoneration: 'permis_construire',
        dateDebut: new Date('2023-01-01'),
        dateFin: new Date('2026-01-01'),
        pourcentageExoneration: 100,
        montantExonere: 15000,
        motif: 'Construction résidentielle autorisée',
        documentsJoints: ['permis_123.pdf', 'plan_construction.pdf'],
        statut: 'Active',
        validePar: 1,
        dateValidation: new Date('2023-01-15')
      }
    ];
  }

  // =====================================================
  // GESTION DU FORMULAIRE
  // =====================================================

  private onTypeChange(type: string): void {
    const exemptionType = this.exemptionTypes.find(t => t.value === type);
    if (exemptionType) {
      // Ajuster la durée et le pourcentage par défaut
      this.exemptionForm.patchValue({
        dureeExoneration: exemptionType.durees[0],
        pourcentageExoneration: exemptionType.pourcentages[0]
      });
    }
  }

  private updateDateFin(): void {
    const dateDebut = this.exemptionForm.get('dateDebut')?.value;
    const duree = this.exemptionForm.get('dureeExoneration')?.value;

    if (dateDebut && duree) {
      const dateFin = new Date(dateDebut);
      dateFin.setFullYear(dateFin.getFullYear() + duree);
      // Stocker la date de fin calculée (pas dans le formulaire mais pour affichage)
    }
  }

  get documentsJointsArray(): FormArray {
    return this.exemptionForm.get('documentsJoints') as FormArray;
  }

  addDocument(): void {
    const documentControl = this.fb.control('', Validators.required);
    this.documentsJointsArray.push(documentControl);
  }

  removeDocument(index: number): void {
    this.documentsJointsArray.removeAt(index);
  }

  // =====================================================
  // ACTIONS PRINCIPALES
  // =====================================================

  addExemption(): void {
    if (!this.exemptionForm.valid || !this.parcelle) return;

    const formValue = this.exemptionForm.value;
    const dateDebut = new Date(formValue.dateDebut);
    const dateFin = new Date(dateDebut);
    dateFin.setFullYear(dateFin.getFullYear() + formValue.dureeExoneration);

    const newExemption: ParcelleExemption = {
      parcelleId: this.parcelle.id,
      typeExoneration: formValue.typeExoneration,
      dateDebut,
      dateFin,
      pourcentageExoneration: formValue.pourcentageExoneration,
      montantExonere: this.calculateExemptionAmount(formValue.pourcentageExoneration),
      motif: formValue.motif,
      documentsJoints: formValue.documentsJoints || [],
      statut: 'Active'
    };

    // Vérifier les conflits avec les exonérations existantes
    if (this.hasConflict(newExemption)) {
      this.showError('Conflit détecté avec une exonération existante');
      return;
    }

    this.exemptions.push(newExemption);
    this.exemptionAdded.emit(newExemption);
    this.exemptionChange.emit(this.exemptions);
    
    this.showSuccess('Exonération ajoutée avec succès');
    this.resetForm();
  }

  removeExemption(exemption: ParcelleExemption): void {
    if (confirm(`Supprimer l'exonération ${this.getExemptionTypeLabel(exemption.typeExoneration)} ?`)) {
      this.exemptions = this.exemptions.filter(e => e.id !== exemption.id);
      
      if (exemption.id) {
        this.exemptionRemoved.emit(exemption.id);
      }
      
      this.exemptionChange.emit(this.exemptions);
      this.showSuccess('Exonération supprimée');
    }
  }

  suspendExemption(exemption: ParcelleExemption): void {
    exemption.statut = 'Suspendue';
    this.exemptionChange.emit(this.exemptions);
    this.showSuccess('Exonération suspendue');
  }

  reactivateExemption(exemption: ParcelleExemption): void {
    if (this.isExemptionExpired(exemption)) {
      this.showError('Cette exonération a expiré et ne peut pas être réactivée');
      return;
    }
    
    exemption.statut = 'Active';
    this.exemptionChange.emit(this.exemptions);
    this.showSuccess('Exonération réactivée');
  }

  // =====================================================
  // VALIDATION ET CALCULS
  // =====================================================

  private hasConflict(newExemption: ParcelleExemption): boolean {
    return this.exemptions.some(existing => {
      if (existing.statut === 'Annulee') return false;
      
      // Vérifier le chevauchement des dates
      return (newExemption.dateDebut <= existing.dateFin && 
              newExemption.dateFin >= existing.dateDebut);
    });
  }

  private calculateExemptionAmount(pourcentage: number): number {
    if (!this.parcelle) return 0;
    
    // Calcul basé sur la surface imposable et le tarif
    const surfaceImposable = this.parcelle.surface_imposable || 0;
    const tarifUnitaire = this.parcelle.prix_unitaire_m2 || 5; // Tarif par défaut
    const montantBase = surfaceImposable * tarifUnitaire;
    
    return (montantBase * pourcentage) / 100;
  }

  isExemptionActive(exemption: ParcelleExemption): boolean {
    const now = new Date();
    return exemption.statut === 'Active' && 
           now >= exemption.dateDebut && 
           now <= exemption.dateFin;
  }

  isExemptionExpired(exemption: ParcelleExemption): boolean {
    return new Date() > exemption.dateFin;
  }

  getExemptionStatus(exemption: ParcelleExemption): { label: string; color: string; icon: string } {
    if (exemption.statut === 'Annulee') {
      return { label: 'Annulée', color: 'warn', icon: 'cancel' };
    }
    
    if (exemption.statut === 'Suspendue') {
      return { label: 'Suspendue', color: 'accent', icon: 'pause' };
    }
    
    if (this.isExemptionExpired(exemption)) {
      return { label: 'Expirée', color: '', icon: 'schedule' };
    }
    
    if (this.isExemptionActive(exemption)) {
      return { label: 'Active', color: 'primary', icon: 'check_circle' };
    }
    
    return { label: 'En attente', color: 'accent', icon: 'hourglass_empty' };
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  private getConditionsForType(type: string): string[] {
    const conditions: { [key: string]: string[] } = {
      permis_construire: [
        'Permis de construire valide',
        'Début des travaux dans les 6 mois',
        'Achèvement dans les délais prévus'
      ],
      zone_industrielle: [
        'Investissement minimum de 1M DH',
        'Création d\'emplois locaux',
        'Respect des normes environnementales'
      ],
      logement_social: [
        'Programme agréé par l\'État',
        'Prix de vente plafonné',
        'Bénéficiaires éligibles'
      ]
    };
    
    return conditions[type] || [];
  }

  private getDocumentsForType(type: string): string[] {
    const documents: { [key: string]: string[] } = {
      permis_construire: [
        'Permis de construire',
        'Plans architecturaux',
        'Autorisation de lotissement'
      ],
      zone_industrielle: [
        'Plan d\'investissement',
        'Étude d\'impact',
        'Autorisation environnementale'
      ],
      logement_social: [
        'Agrément du programme',
        'Convention avec l\'État',
        'Liste des bénéficiaires'
      ]
    };
    
    return documents[type] || [];
  }

  getExemptionTypeLabel(type: string): string {
    const exemptionType = this.exemptionTypes.find(t => t.value === type);
    return exemptionType?.label || type;
  }

  getExemptionTypeIcon(type: string): string {
    const exemptionType = this.exemptionTypes.find(t => t.value === type);
    return exemptionType?.icon || 'info';
  }

  getExemptionTypeColor(type: string): string {
    const exemptionType = this.exemptionTypes.find(t => t.value === type);
    return exemptionType?.color || 'primary';
  }

  getDureesForType(type: string): number[] {
    const exemptionType = this.exemptionTypes.find(t => t.value === type);
    return exemptionType?.durees || [3, 5, 7];
  }

  getPourcentagesForType(type: string): number[] {
    const exemptionType = this.exemptionTypes.find(t => t.value === type);
    return exemptionType?.pourcentages || [100];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  }

  formatDateRange(dateDebut: Date, dateFin: Date): string {
    const debut = dateDebut.toLocaleDateString('fr-FR');
    const fin = dateFin.toLocaleDateString('fr-FR');
    return `${debut} - ${fin}`;
  }

  resetForm(): void {
    this.exemptionForm.reset({
      typeExoneration: '',
      dateDebut: new Date(),
      dureeExoneration: 3,
      pourcentageExoneration: 100,
      motif: '',
      conditionsSpeciales: ''
    });
    
    // Vider le FormArray des documents
    while (this.documentsJointsArray.length !== 0) {
      this.documentsJointsArray.removeAt(0);
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

  // Getters pour le template
  get hasActiveExemptions(): boolean {
    return this.exemptions.some(e => this.isExemptionActive(e));
  }

  get totalExemptionAmount(): number {
    return this.exemptions
      .filter(e => this.isExemptionActive(e))
      .reduce((total, e) => total + e.montantExonere, 0);
  }

  get canAddExemption(): boolean {
    return this.exemptionForm.valid && !this.readonly;
  }
}