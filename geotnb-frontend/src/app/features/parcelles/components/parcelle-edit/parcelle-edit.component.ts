// =====================================================
// COMPOSANT MODIFICATION PARCELLE - INTERFACE ONGLETS
// =====================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

// Services et modèles
import { ParcelleManagementService } from '../../services/parcelle-management.service';
import { EtatValidation, StatutFoncier } from '../../../../core/models/database.models';

export interface ParcelleEditData {
  id: number;
  reference_fonciere: string;
  proprietaire_principal: string;
  statut_foncier: StatutFoncier;
  etat_validation: EtatValidation;
  surface_totale: number;
  surface_imposable: number;
  zone_urbanistique: string;
  etat_occupation: string;
  adresse: string;
  observations: string;
  montant_tnb: number;
  exonere_tnb: boolean;
  date_creation: string;
  date_modification: string;
  version: number;
}

@Component({
  selector: 'app-parcelle-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './parcelle-edit.component.html',
  styleUrls: ['./parcelle-edit.component.scss']
})
export class ParcelleEditComponent implements OnInit, OnDestroy {

  // =====================================================
  // PROPRIÉTÉS
  // =====================================================

  // Données de la parcelle
  parcelleData: ParcelleEditData | null = null;
  parcelleId: number | null = null;
  loading = false;

  // Formulaires par onglet
  generalForm!: FormGroup;
  fiscalForm!: FormGroup;
  geometrieForm!: FormGroup;
  proprietairesForm!: FormGroup;
  documentsForm!: FormGroup;

  // Calcul TNB
  calculatedTnb = {
    surfaceImposable: 1180,
    tarifApplique: 10,
    montantAnnuel: 11800,
    statutFiscal: 'Imposable'
  };

  // Informations actuelles (panneau latéral)
  currentInfo = {
    dateCreation: '15/03/2024',
    dateModification: '22/03/2024',
    createurNom: 'BENNANI F.',
    version: 'v3',
    etatWorkflow: EtatValidation.VALIDE
  };

  // Subject pour la destruction
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private parcelleService: ParcelleManagementService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  // =====================================================
  // CYCLE DE VIE
  // =====================================================

  ngOnInit(): void {
    this.loadParcelleData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initializeForms(): void {
    // Formulaire Général
    this.generalForm = this.fb.group({
      reference_fonciere: ['TF 45872/O', [Validators.required]],
      statut_foncier: [StatutFoncier.TF, [Validators.required]],
      surface_totale: [1250, [Validators.required, Validators.min(1)]],
      surface_imposable: [1180, [Validators.required, Validators.min(1)]],
      zone_urbanistique: ['R+4', [Validators.required]],
      etat_occupation: ['Nu', [Validators.required]],
      adresse: ['Quartier Al Qods, Rue 15, Secteur 4'],
      observations: ['Parcelle d\'angle, accès facile, proche équipements publics']
    });

    // Formulaire Fiscal
    this.fiscalForm = this.fb.group({
      montant_tnb: [11800],
      exonere_tnb: [false],
      duree_exoneration: [null],
      date_debut_exoneration: [null],
      date_fin_exoneration: [null],
      tarif_applique: [10]
    });

    // Formulaire Géométrie
    this.geometrieForm = this.fb.group({
      geometry: [null],
      perimetre: [142.35],
      coordonnees: ['Lambert EPSG:26191']
    });

    // Formulaire Propriétaires
    this.proprietairesForm = this.fb.group({
      proprietaire_principal: ['ALAMI Ahmed'],
      proprietaires_secondaires: [[]],
      type_propriete: ['INDIVIDUELLE']
    });

    // Formulaire Documents
    this.documentsForm = this.fb.group({
      documents: [[]],
      photos: [[]],
      plans: [[]]
    });
  }

  private loadParcelleData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.parcelleId = +id;
      this.loading = true;
      
      // Simulation des données
      setTimeout(() => {
        this.parcelleData = {
          id: this.parcelleId!,
          reference_fonciere: 'TF 45872/O',
          proprietaire_principal: 'ALAMI Ahmed',
          statut_foncier: StatutFoncier.TF,
          etat_validation: EtatValidation.VALIDE,
          surface_totale: 1250,
          surface_imposable: 1180,
          zone_urbanistique: 'R+4',
          etat_occupation: 'Nu',
          adresse: 'Quartier Al Qods, Rue 15, Secteur 4',
          observations: 'Parcelle d\'angle, accès facile, proche équipements publics',
          montant_tnb: 11800,
          exonere_tnb: false,
          date_creation: '2024-03-15T10:30:00Z',
          date_modification: '2024-03-22T14:45:00Z',
          version: 3
        };
        
        this.patchFormsWithData();
        this.loading = false;
      }, 1000);
    }
  }

  private patchFormsWithData(): void {
    if (!this.parcelleData) return;

    // Remplir les formulaires avec les données
    this.generalForm.patchValue({
      reference_fonciere: this.parcelleData.reference_fonciere,
      statut_foncier: this.parcelleData.statut_foncier,
      surface_totale: this.parcelleData.surface_totale,
      surface_imposable: this.parcelleData.surface_imposable,
      zone_urbanistique: this.parcelleData.zone_urbanistique,
      etat_occupation: this.parcelleData.etat_occupation,
      adresse: this.parcelleData.adresse,
      observations: this.parcelleData.observations
    });

    this.fiscalForm.patchValue({
      montant_tnb: this.parcelleData.montant_tnb,
      exonere_tnb: this.parcelleData.exonere_tnb
    });
  }

  // =====================================================
  // ACTIONS
  // =====================================================

  onSupprimer(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette parcelle ?')) {
      this.showSuccess('Parcelle supprimée');
      // TODO: Implémenter la suppression
      this.router.navigate(['/parcelles']);
    }
  }

  onAnnuler(): void {
    this.router.navigate(['/parcelles', this.parcelleId]);
  }

  onSauvegarderBrouillon(): void {
    const formData = this.collectFormData();
    console.log('Sauvegarde brouillon:', formData);
    this.showSuccess('Modifications sauvegardées en brouillon');
  }

  onEnregistrerModifications(): void {
    if (this.validateForms()) {
      const formData = this.collectFormData();
      console.log('Enregistrement modifications:', formData);
      this.showSuccess('Modifications enregistrées avec succès');
      
      // Redirection vers la vue détaillée
      setTimeout(() => {
        this.router.navigate(['/parcelles', this.parcelleId]);
      }, 1500);
    }
  }

  // Actions rapides (panneau latéral)
  onGenererFicheTNB(): void {
    this.showSuccess('Génération de la fiche TNB en cours...');
    // TODO: Implémenter la génération de fiche
  }

  onVoirSurCarte(): void {
    this.router.navigate(['/parcelles/sig'], { 
      queryParams: { parcelle: this.parcelleId } 
    });
  }

  onDocumentsJoints(): void {
    this.showSuccess('Ouverture des documents joints...');
    // TODO: Implémenter l'ouverture des documents
  }

  onHistorique(): void {
    this.showSuccess('Affichage de l\'historique...');
    // TODO: Implémenter l'historique
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  private validateForms(): boolean {
    const forms = [this.generalForm, this.fiscalForm];
    let isValid = true;

    forms.forEach(form => {
      if (!form.valid) {
        form.markAllAsTouched();
        isValid = false;
      }
    });

    if (!isValid) {
      this.showError('Veuillez corriger les erreurs dans le formulaire');
    }

    return isValid;
  }

  private collectFormData(): any {
    return {
      ...this.generalForm.value,
      ...this.fiscalForm.value,
      id: this.parcelleId,
      date_modification: new Date().toISOString(),
      version: (this.parcelleData?.version || 0) + 1
    };
  }

  getEtatBadgeClass(etat: EtatValidation): string {
    switch (etat) {
      case EtatValidation.VALIDE:
        return 'etat-valide';
      case EtatValidation.BROUILLON:
        return 'etat-brouillon';
      case EtatValidation.PUBLIE:
        return 'etat-publie';
      default:
        return 'etat-default';
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
