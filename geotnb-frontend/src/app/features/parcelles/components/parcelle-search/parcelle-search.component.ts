// =====================================================
// COMPOSANT RECHERCHE DE PARCELLES
// =====================================================

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, startWith, map } from 'rxjs';

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
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';

// Services et modèles
import { ParcelleService } from '../../services/parcelle.service';
import { Parcelle, SearchParcelleDto, PaginatedResult } from '../../models/parcelle.models';

// Pipes
import { SurfaceFormatPipe } from '../../pipes/surface-format.pipe';

export interface SearchFilter {
  field: string;
  operator: string;
  value: any;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
}

export interface SearchCriteria extends SearchParcelleDto {
  // Critères étendus pour l'interface
  surfaceMin?: number;
  surfaceMax?: number;
  montantMin?: number;
  montantMax?: number;
  dateCreationDebut?: Date;
  dateCreationFin?: Date;
}

@Component({
  selector: 'app-parcelle-search',
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
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatSliderModule,
    MatButtonToggleModule,
    MatBadgeModule,
    SurfaceFormatPipe
  ],
  templateUrl: './parcelle-search.component.html',
  styleUrls: ['./parcelle-search.component.scss']
})
export class ParcelleSearchComponent implements OnInit, OnDestroy {
  @Input() showAdvancedSearch = true;
  @Input() showQuickFilters = true;
  @Input() showSavedSearches = true;
  @Input() autoSearch = true;
  @Input() maxResults = 100;

  @Output() searchResults = new EventEmitter<PaginatedResult<Parcelle>>();
  @Output() searchCriteria = new EventEmitter<SearchCriteria>();
  @Output() parcelleSelected = new EventEmitter<Parcelle>();

  // Formulaires
  quickSearchForm!: FormGroup;
  advancedSearchForm!: FormGroup;
  
  // État
  searchMode: 'quick' | 'advanced' = 'quick';
  isSearching = false;
  hasSearched = false;
  currentResults: PaginatedResult<Parcelle> | null = null;
  activeFilters: SearchFilter[] = [];
  
  // Configuration
  statutFoncierOptions = [
    { value: 'TF', label: 'Titre Foncier (TF)' },
    { value: 'R', label: 'Réquisition (R)' },
    { value: 'NI', label: 'Non Immatriculé (NI)' },
    { value: 'Domanial', label: 'Domanial' },
    { value: 'Collectif', label: 'Collectif' }
  ];

  statutOccupationOptions = [
    { value: 'Nu', label: 'Nu' },
    { value: 'Construit', label: 'Construit' },
    { value: 'En_Construction', label: 'En Construction' },
    { value: 'Partiellement_Construit', label: 'Partiellement Construit' }
  ];

  etatValidationOptions = [
    { value: 'Brouillon', label: 'Brouillon' },
    { value: 'Valide', label: 'Validé' },
    { value: 'Publie', label: 'Publié' },
    { value: 'Archive', label: 'Archivé' }
  ];

  // Filtres rapides prédéfinis
  quickFilters = [
    { id: 'all', label: 'Toutes', icon: 'select_all', criteria: {} },
    { id: 'published', label: 'Publiées', icon: 'public', criteria: { etat_validation: 'Publie' } },
    { id: 'draft', label: 'Brouillons', icon: 'edit', criteria: { etat_validation: 'Brouillon' } },
    { id: 'exempted', label: 'Exonérées', icon: 'money_off', criteria: { exonere_tnb: true } },
    { id: 'large', label: 'Grandes (>1000m²)', icon: 'crop_landscape', criteria: { surfaceMin: 1000 } }
  ];

  selectedQuickFilter = 'all';

  // Autocomplétion
  filteredZonages: string[] = [];
  allZonages = ['U1', 'U2', 'U3', 'R1', 'R2', 'I1', 'I2', 'A1', 'A2'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private parcelleService: ParcelleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.setupFormListeners();
    this.initializeAutoComplete();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initializeForms(): void {
    // Formulaire de recherche rapide
    this.quickSearchForm = this.fb.group({
      searchTerm: [''],
      searchType: ['all'] // 'all', 'reference', 'proprietaire', 'zonage'
    });

    // Formulaire de recherche avancée
    this.advancedSearchForm = this.fb.group({
      // Identification
      reference_fonciere: [''],
      
      // Localisation
      zonage: [''],
      secteur: [''],
      
      // Caractéristiques foncières
      statut_foncier: [''],
      statut_occupation: [''],
      
      // Surfaces
      surface_totale_min: [''],
      surface_totale_max: [''],
      surface_imposable_min: [''],
      surface_imposable_max: [''],
      
      // Aspects fiscaux
      exonere_tnb: [''],
      montant_tnb_min: [''],
      montant_tnb_max: [''],
      
      // Dates
      date_creation_debut: [''],
      date_creation_fin: [''],
      date_permis_debut: [''],
      date_permis_fin: [''],
      
      // État
      etat_validation: [''],
      
      // Propriétaires
      proprietaire_nom: [''],
      proprietaire_cin: [''],
      nombre_proprietaires_min: [''],
      nombre_proprietaires_max: ['']
    });
  }

  private setupFormListeners(): void {
    // Recherche automatique sur le formulaire rapide
    if (this.autoSearch) {
      this.quickSearchForm.get('searchTerm')?.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          if (this.searchMode === 'quick') {
            this.executeSearch();
          }
        });
    }

    // Écouter les changements sur le formulaire avancé
    this.advancedSearchForm.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateActiveFilters();
        if (this.autoSearch && this.searchMode === 'advanced') {
          this.executeSearch();
        }
      });
  }

  private initializeAutoComplete(): void {
    // Autocomplétion pour les zonages
    this.advancedSearchForm.get('zonage')?.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filterZonages(value || '')),
        takeUntil(this.destroy$)
      )
      .subscribe(filtered => {
        this.filteredZonages = filtered;
      });
  }

  private filterZonages(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allZonages.filter(zonage => 
      zonage.toLowerCase().includes(filterValue)
    );
  }

  // =====================================================
  // GESTION DES MODES DE RECHERCHE
  // =====================================================

  toggleSearchMode(): void {
    if (this.searchMode === 'quick') {
      // Rediriger vers les requêtes spatiales au lieu du mode avancé
      this.navigateToSpatialQueries();
    } else {
      this.searchMode = 'quick';
      this.clearSearch();
    }
  }

  // Méthode pour rediriger directement vers les requêtes spatiales
  goToSpatialQueries(): void {
    this.navigateToSpatialQueries();
  }

  navigateToSpatialQueries(): void {
    this.router.navigate(['/spatial-queries']);
  }

  selectQuickFilter(filterId: string): void {
    this.selectedQuickFilter = filterId;
    const filter = this.quickFilters.find(f => f.id === filterId);
    
    if (filter) {
      // Appliquer les critères du filtre rapide
      this.applyQuickFilterCriteria(filter.criteria);
      
      if (this.autoSearch) {
        this.executeSearch();
      }
    }
  }

  private applyQuickFilterCriteria(criteria: any): void {
    // Réinitialiser les formulaires
    this.quickSearchForm.patchValue({ searchTerm: '' });
    this.advancedSearchForm.reset();

    // Appliquer les critères
    Object.keys(criteria).forEach(key => {
      if (key === 'surfaceMin') {
        this.advancedSearchForm.patchValue({ surface_totale_min: criteria[key] });
      } else if (key === 'surfaceMax') {
        this.advancedSearchForm.patchValue({ surface_totale_max: criteria[key] });
      } else if (key === 'montantMin') {
        this.advancedSearchForm.patchValue({ montant_tnb_min: criteria[key] });
      } else if (key === 'montantMax') {
        this.advancedSearchForm.patchValue({ montant_tnb_max: criteria[key] });
      } else {
        this.advancedSearchForm.patchValue({ [key]: criteria[key] });
      }
    });
  }

  // =====================================================
  // EXÉCUTION DE LA RECHERCHE
  // =====================================================

  executeSearch(): void {
    if (this.isSearching) return;

    const criteria = this.buildSearchCriteria();
    
    if (this.isEmptySearch(criteria)) {
      this.clearResults();
      return;
    }

    this.isSearching = true;
    this.hasSearched = true;

    this.parcelleService.searchParcelles(criteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.currentResults = results;
          this.searchResults.emit(results);
          this.searchCriteria.emit(criteria);
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Erreur lors de la recherche:', error);
          this.isSearching = false;
          this.clearResults();
        }
      });
  }

  private buildSearchCriteria(): SearchCriteria {
    const criteria: SearchCriteria = {
      page: 1,
      limit: this.maxResults
    };

    if (this.searchMode === 'quick') {
      const searchTerm = this.quickSearchForm.get('searchTerm')?.value;
      const searchType = this.quickSearchForm.get('searchType')?.value;

      if (searchTerm) {
        switch (searchType) {
          case 'reference':
            criteria.reference_fonciere = searchTerm;
            break;
          case 'proprietaire':
            criteria.proprietaire_nom = searchTerm;
            break;
          case 'zonage':
            criteria.zonage = searchTerm;
            break;
          default:
            criteria.search = searchTerm; // Recherche globale
        }
      }
    } else {
      // Mode avancé
      const formValue = this.advancedSearchForm.value;
      
      Object.keys(formValue).forEach(key => {
        const value = formValue[key];
        if (value !== null && value !== undefined && value !== '') {
          // Mapper les champs spéciaux
          switch (key) {
            case 'surface_totale_min':
              criteria.surfaceMin = value;
              break;
            case 'surface_totale_max':
              criteria.surfaceMax = value;
              break;
            case 'surface_imposable_min':
              criteria.surface_imposable_min = value;
              break;
            case 'surface_imposable_max':
              criteria.surface_imposable_max = value;
              break;
            case 'montant_tnb_min':
              criteria.montantMin = value;
              break;
            case 'montant_tnb_max':
              criteria.montantMax = value;
              break;
            case 'date_creation_debut':
              criteria.dateCreationDebut = value;
              break;
            case 'date_creation_fin':
              criteria.dateCreationFin = value;
              break;
            default:
              (criteria as any)[key] = value;
          }
        }
      });
    }

    // Appliquer les critères du filtre rapide sélectionné
    if (this.selectedQuickFilter !== 'all') {
      const quickFilter = this.quickFilters.find(f => f.id === this.selectedQuickFilter);
      if (quickFilter) {
        Object.assign(criteria, quickFilter.criteria);
      }
    }

    return criteria;
  }

  private isEmptySearch(criteria: SearchCriteria): boolean {
    const { page, limit, ...searchFields } = criteria;
    return Object.keys(searchFields).length === 0;
  }

  // =====================================================
  // GESTION DES FILTRES ACTIFS
  // =====================================================

  private updateActiveFilters(): void {
    this.activeFilters = [];
    const formValue = this.advancedSearchForm.value;

    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        const filter = this.createFilterFromField(key, value);
        if (filter) {
          this.activeFilters.push(filter);
        }
      }
    });
  }

  private createFilterFromField(field: string, value: any): SearchFilter | null {
    const fieldLabels: { [key: string]: string } = {
      reference_fonciere: 'Référence foncière',
      zonage: 'Zonage',
      statut_foncier: 'Statut foncier',
      statut_occupation: 'Statut occupation',
      surface_totale_min: 'Surface min',
      surface_totale_max: 'Surface max',
      montant_tnb_min: 'Montant TNB min',
      montant_tnb_max: 'Montant TNB max',
      etat_validation: 'État de validation',
      proprietaire_nom: 'Nom propriétaire'
    };

    const label = fieldLabels[field];
    if (!label) return null;

    return {
      field,
      operator: 'eq',
      value,
      label: `${label}: ${value}`,
      type: this.getFieldType(field)
    };
  }

  private getFieldType(field: string): 'text' | 'number' | 'date' | 'select' | 'boolean' {
    const numberFields = ['surface_totale_min', 'surface_totale_max', 'montant_tnb_min', 'montant_tnb_max'];
    const dateFields = ['date_creation_debut', 'date_creation_fin'];
    const selectFields = ['statut_foncier', 'statut_occupation', 'etat_validation'];
    const booleanFields = ['exonere_tnb'];

    if (numberFields.includes(field)) return 'number';
    if (dateFields.includes(field)) return 'date';
    if (selectFields.includes(field)) return 'select';
    if (booleanFields.includes(field)) return 'boolean';
    return 'text';
  }

  removeFilter(filter: SearchFilter): void {
    this.advancedSearchForm.patchValue({ [filter.field]: '' });
    this.updateActiveFilters();
    
    if (this.autoSearch) {
      this.executeSearch();
    }
  }

  clearAllFilters(): void {
    this.advancedSearchForm.reset();
    this.activeFilters = [];
    this.selectedQuickFilter = 'all';
    
    if (this.autoSearch) {
      this.clearResults();
    }
  }

  // =====================================================
  // GESTION DES RÉSULTATS
  // =====================================================

  clearSearch(): void {
    this.quickSearchForm.reset();
    this.advancedSearchForm.reset();
    this.activeFilters = [];
    this.selectedQuickFilter = 'all';
    this.clearResults();
  }

  private clearResults(): void {
    this.currentResults = null;
    this.hasSearched = false;
    this.searchResults.emit(null as any);
  }

  selectParcelle(parcelle: Parcelle): void {
    this.parcelleSelected.emit(parcelle);
  }

  // =====================================================
  // RECHERCHES SAUVEGARDÉES
  // =====================================================

  saveCurrentSearch(): void {
    // Implémentation de la sauvegarde
    const criteria = this.buildSearchCriteria();
    const searchName = prompt('Nom de la recherche sauvegardée:');
    
    if (searchName) {
      // Sauvegarder dans le localStorage ou via un service
      const savedSearches = this.getSavedSearches();
      savedSearches.push({
        name: searchName,
        criteria,
        date: new Date(),
        mode: this.searchMode
      });
      localStorage.setItem('parcelle-saved-searches', JSON.stringify(savedSearches));
    }
  }

  loadSavedSearch(searchName: string): void {
    const savedSearches = this.getSavedSearches();
    const savedSearch = savedSearches.find(s => s.name === searchName);
    
    if (savedSearch) {
      this.searchMode = savedSearch.mode;
      this.applyCriteria(savedSearch.criteria);
      this.executeSearch();
    }
  }

  getSavedSearches(): any[] {
    const saved = localStorage.getItem('parcelle-saved-searches');
    return saved ? JSON.parse(saved) : [];
  }

  getTotalSurface(): number {
    if (!this.currentResults?.items) return 0;
    return this.currentResults.items.reduce((sum, p) => sum + (p.surface_totale || 0), 0);
  }

  getTotalTNB(): number {
    if (!this.currentResults?.items) return 0;
    return this.currentResults.items.reduce((sum, p) => sum + (p.montant_total_tnb || 0), 0);
  }

  private applyCriteria(criteria: SearchCriteria): void {
    if (this.searchMode === 'quick') {
      this.quickSearchForm.patchValue({
        searchTerm: criteria.search || criteria.reference_fonciere || ''
      });
    } else {
      // Mapper les critères vers le formulaire avancé
      const formData: any = {};
      
      Object.keys(criteria).forEach(key => {
        const value = (criteria as any)[key];
        if (value !== undefined && value !== null) {
          switch (key) {
            case 'surfaceMin':
              formData.surface_totale_min = value;
              break;
            case 'surfaceMax':
              formData.surface_totale_max = value;
              break;
            case 'montantMin':
              formData.montant_tnb_min = value;
              break;
            case 'montantMax':
              formData.montant_tnb_max = value;
              break;
            default:
              formData[key] = value;
          }
        }
      });
      
      this.advancedSearchForm.patchValue(formData);
    }
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  getQuickFilterIcon(filterId: string): string {
    const filter = this.quickFilters.find(f => f.id === filterId);
    return filter?.icon || 'search';
  }

  // Getters pour le template
  get hasActiveFilters(): boolean {
    return this.activeFilters.length > 0;
  }

  get hasResults(): boolean {
    return !!this.currentResults && this.currentResults.items.length > 0;
  }

  get resultsCount(): number {
    return this.currentResults?.items.length || 0;
  }

  get totalCount(): number {
    return this.currentResults?.total || 0;
  }

  get isQuickMode(): boolean {
    return this.searchMode === 'quick';
  }

  get isAdvancedMode(): boolean {
    return this.searchMode === 'advanced';
  }
}
