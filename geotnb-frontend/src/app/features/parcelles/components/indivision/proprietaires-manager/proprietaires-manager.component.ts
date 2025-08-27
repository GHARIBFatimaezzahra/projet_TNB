// =====================================================
// GESTIONNAIRE DE PROPRIÉTAIRES - INDIVISION
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
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';

// Services et modèles
import { Proprietaire, ParcelleProprietaire } from '../../../models/parcelle.models';

// Validators
import { CinValidator } from '../../../../../shared/validators/cin.validator';
import { PhoneValidator } from '../../../../../shared/validators/phone.validator';

export interface ProprietaireSearchResult {
  proprietaire: Proprietaire;
  isExisting: boolean;
  matchScore: number;
}

export interface ProprietaireAction {
  type: 'add' | 'edit' | 'remove' | 'activate' | 'deactivate';
  proprietaire: Proprietaire;
  quotePart?: number;
}

@Component({
  selector: 'app-proprietaires-manager',
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
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatBadgeModule,
    MatMenuModule
  ],
  templateUrl: './proprietaires-manager.component.html',
  styleUrls: ['./proprietaires-manager.component.scss']
})
export class ProprietairesManagerComponent implements OnInit, OnDestroy {
  @Input() parcelleId!: number;
  @Input() currentProprietaires: ParcelleProprietaire[] = [];
  @Input() readonly = false;

  @Output() proprietairesChange = new EventEmitter<ParcelleProprietaire[]>();
  @Output() proprietaireAction = new EventEmitter<ProprietaireAction>();

  // Formulaires
  searchForm!: FormGroup;
  newProprietaireForm!: FormGroup;
  
  // État
  proprietaires: ParcelleProprietaire[] = [];
  availableProprietaires: Proprietaire[] = [];
  searchResults: ProprietaireSearchResult[] = [];
  isSearching = false;
  isCreatingNew = false;
  showNewProprietaireForm = false;
  
  // Mode d'affichage
  viewMode: 'list' | 'cards' = 'list';
  
  // Configuration
  natureOptions = [
    { value: 'Physique', label: 'Personne Physique', icon: 'person' },
    { value: 'Morale', label: 'Personne Morale', icon: 'business' }
  ];

  // Colonnes du tableau
  displayedColumns = ['proprietaire', 'nature', 'contact', 'quotePart', 'statut', 'actions'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.initializeData();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initializeForms(): void {
    // Formulaire de recherche
    this.searchForm = this.fb.group({
      searchTerm: [''],
      searchType: ['all'], // 'all', 'nom', 'cin', 'email'
      nature: ['all'] // 'all', 'Physique', 'Morale'
    });

    // Formulaire nouveau propriétaire
    this.newProprietaireForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: [''],
      nature: ['Physique', Validators.required],
              cin_ou_rc: ['', [Validators.required, CinValidator.validate]],
      adresse: [''],
      telephone: ['', [PhoneValidator.validate]],
      email: ['', [Validators.email]],
      quotePart: [0, [Validators.required, Validators.min(0.01), Validators.max(1)]]
    });

    if (this.readonly) {
      this.searchForm.disable();
      this.newProprietaireForm.disable();
    }
  }

  private initializeData(): void {
    this.proprietaires = [...this.currentProprietaires];
    this.loadAvailableProprietaires();
  }

  private setupFormListeners(): void {
    // Recherche en temps réel
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(term => {
        if (term && term.length >= 2) {
          this.searchProprietaires(term);
        } else {
          this.searchResults = [];
        }
      });

    // Validation CIN/RC selon la nature
    this.newProprietaireForm.get('nature')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(nature => {
        const cinControl = this.newProprietaireForm.get('cin_ou_rc');
        if (nature === 'Physique') {
          cinControl?.setValidators([Validators.required, CinValidator.validate]);
        } else {
          cinControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]+$/)]);
        }
        cinControl?.updateValueAndValidity();
      });
  }

  private loadAvailableProprietaires(): void {
    // Simuler le chargement des propriétaires disponibles
    this.availableProprietaires = [
      {
        id: 1,
        nom: 'ALAMI',
        prenom: 'Ahmed',
        nature: 'Physique',
        cin_ou_rc: 'AB123456',
        adresse: '123 Rue Mohammed V, Casablanca',
        telephone: '0661234567',
        email: 'ahmed.alami@email.com',
        date_creation: new Date('2023-01-15'),
        date_modification: new Date('2023-01-15'),
        est_actif: true
      },
      {
        id: 2,
        nom: 'BENALI',
        prenom: 'Fatima',
        nature: 'Physique',
        cin_ou_rc: 'CD789012',
        adresse: '456 Avenue Hassan II, Rabat',
        telephone: '0662345678',
        email: 'fatima.benali@email.com',
        date_creation: new Date('2023-02-10'),
        date_modification: new Date('2023-02-10'),
        est_actif: true
      },
      {
        id: 3,
        nom: 'SOCIÉTÉ IMMOBILIÈRE DU MAROC',
        prenom: undefined,
        nature: 'Morale',
        cin_ou_rc: '123456789',
        adresse: '789 Boulevard Zerktouni, Casablanca',
        telephone: '0522123456',
        email: 'contact@sim.ma',
        date_creation: new Date('2023-03-05'),
        date_modification: new Date('2023-03-05'),
        est_actif: true
      }
    ];
  }

  // =====================================================
  // RECHERCHE DE PROPRIÉTAIRES
  // =====================================================

  private searchProprietaires(term: string): void {
    this.isSearching = true;
    const searchType = this.searchForm.get('searchType')?.value;
    const nature = this.searchForm.get('nature')?.value;

    // Filtrer les propriétaires disponibles
    let filteredProprietaires = this.availableProprietaires.filter(p => {
      // Exclure ceux déjà ajoutés
      const alreadyAdded = this.proprietaires.some(pp => pp.proprietaire_id === p.id);
      if (alreadyAdded) return false;

      // Filtrer par nature
      if (nature !== 'all' && p.nature !== nature) return false;

      // Recherche textuelle
      const searchTerm = term.toLowerCase();
      
      switch (searchType) {
        case 'nom':
          return p.nom.toLowerCase().includes(searchTerm) || 
                 (p.prenom && p.prenom.toLowerCase().includes(searchTerm));
        case 'cin':
          return p.cin_ou_rc?.toLowerCase().includes(searchTerm);
        case 'email':
          return p.email?.toLowerCase().includes(searchTerm);
        default:
          return p.nom.toLowerCase().includes(searchTerm) ||
                 (p.prenom && p.prenom.toLowerCase().includes(searchTerm)) ||
                 (p.cin_ou_rc && p.cin_ou_rc.toLowerCase().includes(searchTerm)) ||
                 (p.email && p.email.toLowerCase().includes(searchTerm));
      }
    });

    // Calculer le score de correspondance et créer les résultats
    this.searchResults = filteredProprietaires.map(p => ({
      proprietaire: p,
      isExisting: true,
      matchScore: this.calculateMatchScore(p, term, searchType)
    })).sort((a, b) => b.matchScore - a.matchScore);

    this.isSearching = false;
  }

  private calculateMatchScore(proprietaire: Proprietaire, term: string, searchType: string): number {
    let score = 0;
    const searchTerm = term.toLowerCase();

    // Score basé sur la correspondance exacte
    if (proprietaire.nom.toLowerCase() === searchTerm) score += 100;
    else if (proprietaire.nom.toLowerCase().startsWith(searchTerm)) score += 80;
    else if (proprietaire.nom.toLowerCase().includes(searchTerm)) score += 60;

    if (proprietaire.prenom && proprietaire.prenom.toLowerCase() === searchTerm) score += 90;
    else if (proprietaire.prenom && proprietaire.prenom.toLowerCase().startsWith(searchTerm)) score += 70;
    else if (proprietaire.prenom && proprietaire.prenom.toLowerCase().includes(searchTerm)) score += 50;

    if (proprietaire.cin_ou_rc === term.toUpperCase()) score += 100;
    else if (proprietaire.cin_ou_rc?.includes(term.toUpperCase())) score += 80;

    if (proprietaire.email === term.toLowerCase()) score += 100;
    else if (proprietaire.email?.includes(term.toLowerCase())) score += 70;

    return score;
  }

  // =====================================================
  // GESTION DES PROPRIÉTAIRES
  // =====================================================

  addExistingProprietaire(proprietaire: Proprietaire): void {
    const newParcelleProprietaire: ParcelleProprietaire = {
      id: 0, // Sera assigné par le backend
      parcelle_id: this.parcelleId,
      proprietaire_id: proprietaire.id,
      proprietaire: proprietaire,
      quote_part: 0, // Sera défini dans l'éditeur de quote-parts
      montant_individuel: 0,
      date_debut: new Date(),
              date_fin: undefined,
        est_actif: true,
        date_creation: new Date()
    };

    this.proprietaires.push(newParcelleProprietaire);
    this.proprietairesChange.emit(this.proprietaires);
    this.proprietaireAction.emit({
      type: 'add',
      proprietaire,
      quotePart: 0
    });

    // Nettoyer la recherche
    this.searchForm.patchValue({ searchTerm: '' });
    this.searchResults = [];

    this.showSuccess(`${proprietaire.nom} ${proprietaire.prenom || ''} ajouté à la liste`);
  }

  createNewProprietaire(): void {
    if (!this.newProprietaireForm.valid) return;

    this.isCreatingNew = true;
    const formValue = this.newProprietaireForm.value;

    // Créer le nouveau propriétaire (simulation)
    const newProprietaire: Proprietaire = {
      id: Date.now(), // ID temporaire
      nom: formValue.nom,
      prenom: formValue.prenom,
      nature: formValue.nature,
      cin_ou_rc: formValue.cin_ou_rc,
      adresse: formValue.adresse,
      telephone: formValue.telephone,
      email: formValue.email,
      date_creation: new Date(),
      date_modification: new Date(),
      est_actif: true
    };

    // Créer la relation parcelle-propriétaire
    const newParcelleProprietaire: ParcelleProprietaire = {
      id: 0,
      parcelle_id: this.parcelleId,
      proprietaire_id: newProprietaire.id,
      proprietaire: newProprietaire,
      quote_part: formValue.quotePart,
      montant_individuel: 0,
      date_debut: new Date(),
              date_fin: undefined,
        est_actif: true,
        date_creation: new Date()
    };

    this.proprietaires.push(newParcelleProprietaire);
    this.proprietairesChange.emit(this.proprietaires);
    this.proprietaireAction.emit({
      type: 'add',
      proprietaire: newProprietaire,
      quotePart: formValue.quotePart
    });

    // Réinitialiser le formulaire
    this.newProprietaireForm.reset({
      nature: 'Physique',
      quotePart: 0
    });
    this.showNewProprietaireForm = false;
    this.isCreatingNew = false;

    this.showSuccess(`Nouveau propriétaire ${newProprietaire.nom} créé et ajouté`);
  }

  removeProprietaire(parcelleProprietaire: ParcelleProprietaire): void {
    const proprietaire = parcelleProprietaire.proprietaire;
    const nom = `${proprietaire?.nom} ${proprietaire?.prenom || ''}`.trim();

    if (confirm(`Supprimer ${nom} de la liste des propriétaires ?`)) {
      this.proprietaires = this.proprietaires.filter(pp => pp.id !== parcelleProprietaire.id);
      this.proprietairesChange.emit(this.proprietaires);
      
      if (proprietaire) {
        this.proprietaireAction.emit({
          type: 'remove',
          proprietaire
        });
      }

      this.showSuccess(`${nom} supprimé de la liste`);
    }
  }

  toggleProprietaireStatus(parcelleProprietaire: ParcelleProprietaire): void {
    parcelleProprietaire.est_actif = !parcelleProprietaire.est_actif;
    this.proprietairesChange.emit(this.proprietaires);

    if (parcelleProprietaire.proprietaire) {
      this.proprietaireAction.emit({
        type: parcelleProprietaire.est_actif ? 'activate' : 'deactivate',
        proprietaire: parcelleProprietaire.proprietaire
      });
    }

    const status = parcelleProprietaire.est_actif ? 'activé' : 'désactivé';
    this.showSuccess(`Propriétaire ${status}`);
  }

  editProprietaire(parcelleProprietaire: ParcelleProprietaire): void {
    // Ouvrir un dialog d'édition (à implémenter)
    console.log('Édition du propriétaire:', parcelleProprietaire);
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  getProprietaireDisplay(proprietaire: Proprietaire): string {
    const nom = `${proprietaire.nom} ${proprietaire.prenom || ''}`.trim();
    const identifiant = proprietaire.cin_ou_rc ? ` (${proprietaire.cin_ou_rc})` : '';
    return nom + identifiant;
  }

  getProprietaireIcon(nature: string): string {
    return nature === 'Physique' ? 'person' : 'business';
  }

  getProprietaireTypeLabel(nature: string): string {
    return nature === 'Physique' ? 'Personne Physique' : 'Personne Morale';
  }

  getStatusIcon(estActif: boolean): string {
    return estActif ? 'check_circle' : 'cancel';
  }

  getStatusColor(estActif: boolean): string {
    return estActif ? 'primary' : 'warn';
  }

  formatQuotePart(quotePart: number): string {
    return `${(quotePart * 100).toFixed(2)}%`;
  }

  // =====================================================
  // ACTIONS D'INTERFACE
  // =====================================================

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'cards' : 'list';
  }

  toggleNewProprietaireForm(): void {
    this.showNewProprietaireForm = !this.showNewProprietaireForm;
    if (this.showNewProprietaireForm) {
      this.newProprietaireForm.reset({
        nature: 'Physique',
        quotePart: 0
      });
    }
  }

  clearSearch(): void {
    this.searchForm.patchValue({ searchTerm: '' });
    this.searchResults = [];
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
  get hasProprietaires(): boolean {
    return this.proprietaires.length > 0;
  }

  get activeProprietaires(): ParcelleProprietaire[] {
    return this.proprietaires.filter(pp => pp.est_actif);
  }

  get inactiveProprietaires(): ParcelleProprietaire[] {
    return this.proprietaires.filter(pp => !pp.est_actif);
  }

  get hasSearchResults(): boolean {
    return this.searchResults.length > 0;
  }

  get canAddProprietaire(): boolean {
    return !this.readonly;
  }
}
