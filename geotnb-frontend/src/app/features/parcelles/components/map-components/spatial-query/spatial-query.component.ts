// =====================================================
// COMPOSANT REQUÊTES SPATIALES - RECHERCHE GÉOGRAPHIQUE
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
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';

// Services
import { SpatialQueryService, SpatialQueryResult, SpatialQueryOptions } from '../../../services/spatial-query.service';

// Models
import { Parcelle } from '../../../models/parcelle.models';

export interface SpatialFilter {
  type: 'intersect' | 'within' | 'contains' | 'nearby' | 'bounds';
  geometry?: any;
  distance?: number;
  bounds?: [number, number, number, number];
  options?: SpatialQueryOptions;
}

export interface QueryPreset {
  id: string;
  name: string;
  description: string;
  filter: SpatialFilter;
}

@Component({
  selector: 'app-spatial-query',
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
    MatSliderModule,
    MatExpansionModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    RouterModule,
    MatMenuModule,
    MatBadgeModule
  ],
  templateUrl: './spatial-query.component.html',
  styleUrls: ['./spatial-query.component.scss']
})
export class SpatialQueryComponent implements OnInit, OnDestroy {
  @Input() targetGeometry?: any;
  @Input() availableParcelles: Parcelle[] = [];
  @Input() compact = false;

  @Output() queryExecuted = new EventEmitter<SpatialQueryResult[]>();
  @Output() queryCleared = new EventEmitter<void>();
  @Output() resultsHighlight = new EventEmitter<SpatialQueryResult[]>();
  @Output() geometryRequired = new EventEmitter<string>(); // Pour demander une géométrie
  @Output() selectionChanged = new EventEmitter<number[]>();
  @Output() resultSelected = new EventEmitter<SpatialQueryResult>();

  // Formulaires
  spatialForm!: FormGroup;
  
  // État
  isQuerying = false;
  isExecuting = false;
  hasExecutedQuery = false; // Renommé pour éviter le conflit
  isDrawing = false;
  queryResults: SpatialQueryResult[] = [];
  selectedResults: SpatialQueryResult[] = [];
  selectedParcelles: number[] = [];
  resultsViewMode: 'table' | 'cards' = 'table';
  
  // Propriétés pour le template
  selectedQueryType = 'intersect';
  queryForm!: FormGroup;
  drawnGeometry: any = null;
  filteredAdminZones: any[] = [];
  attributeConditions: any[] = [{ field: '', operator: 'equals', value: '' }];
  availableFields: any[] = [
    { name: 'reference_fonciere', label: 'Référence foncière', type: 'string' },
    { name: 'surface_totale', label: 'Surface totale', type: 'number' },
    { name: 'zonage', label: 'Zonage', type: 'string' }
  ];
  logicalOperator = 'AND';
  autoExecute = false;
  
  // Propriétés calculées
  get hasResults(): boolean {
    return this.queryResults.length > 0;
  }
  
  get hasDrawnGeometry(): boolean {
    return !!this.drawnGeometry;
  }

  get hasActiveQuery(): boolean {
    return this.hasExecutedQuery && this.queryResults.length > 0;
  }
  
  // Configuration
  queryTypes = [
    { value: 'intersect', label: 'Intersecte avec', icon: 'compare_arrows', description: 'Parcelles qui se croisent' },
    { value: 'within', label: 'Contenues dans', icon: 'crop_free', description: 'Parcelles complètement à l\'intérieur' },
    { value: 'contains', label: 'Contient', icon: 'fullscreen', description: 'Parcelles qui contiennent la géométrie' },
    { value: 'nearby', label: 'À proximité de', icon: 'near_me', description: 'Parcelles dans un rayon donné' },
    { value: 'bounds', label: 'Dans l\'emprise', icon: 'crop_din', description: 'Parcelles dans une zone rectangulaire' }
  ];

  distanceUnits = [
    { value: 'meters', label: 'mètres' },
    { value: 'kilometers', label: 'kilomètres' }
  ];

  // Presets de requêtes
  queryPresets: QueryPreset[] = [
    {
      id: 'adjacent',
      name: 'Parcelles adjacentes',
      description: 'Trouver les parcelles qui touchent la sélection',
      filter: { type: 'nearby', distance: 1, options: { buffer: 1 } }
    },
    {
      id: 'neighborhood',
      name: 'Voisinage proche',
      description: 'Parcelles dans un rayon de 100m',
      filter: { type: 'nearby', distance: 100 }
    },
    {
      id: 'same_zone',
      name: 'Même zone urbanistique',
      description: 'Parcelles de la même zone',
      filter: { type: 'intersect', options: { fields: ['zonage'] } }
    },
    {
      id: 'overlapping',
      name: 'Chevauchements',
      description: 'Détecter les parcelles qui se chevauchent',
      filter: { type: 'intersect', options: { includeGeometry: true } }
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private spatialQueryService: SpatialQueryService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
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
    this.spatialForm = this.fb.group({
      queryType: ['intersect', Validators.required],
      distance: [100, [Validators.min(1), Validators.max(10000)]],
      distanceUnit: ['meters'],
      includeGeometry: [false],
      limit: [50, [Validators.min(1), Validators.max(1000)]],
      
      // Bounds
      minX: [null],
      minY: [null],
      maxX: [null],
      maxY: [null],
      
      // Options avancées
      buffer: [0, [Validators.min(0), Validators.max(1000)]],
      fields: [[]],
      
      // Filtres attributaires
      etatValidation: [[]],
      statutFoncier: [[]],
      zonage: ['']
    });
  }

  private setupFormListeners(): void {
    // Écouter les changements de type de requête
    this.spatialForm.get('queryType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.onQueryTypeChange(type);
      });

    // Auto-exécution avec debounce pour certains champs
    this.spatialForm.get('distance')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.spatialForm.get('queryType')?.value === 'nearby' && this.targetGeometry) {
          this.executeQuery();
        }
      });
  }

  // =====================================================
  // EXÉCUTION DES REQUÊTES
  // =====================================================

  executeQuery(): void {
    if (!this.spatialForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    const queryType = this.spatialForm.get('queryType')?.value;
    
    // Vérifier si une géométrie est requise
    if (this.requiresGeometry(queryType) && !this.targetGeometry) {
      this.geometryRequired.emit(queryType);
      return;
    }

    this.isQuerying = true;
    this.queryResults = [];

    const options = this.buildQueryOptions();
    
    switch (queryType) {
      case 'intersect':
        this.executeIntersectQuery(options);
        break;
      case 'within':
        this.executeWithinQuery(options);
        break;
      case 'contains':
        this.executeContainsQuery(options);
        break;
      case 'nearby':
        this.executeNearbyQuery(options);
        break;
      case 'bounds':
        this.executeBoundsQuery(options);
        break;
    }
  }

  private executeIntersectQuery(options: SpatialQueryOptions): void {
    if (!this.targetGeometry) return;

    this.spatialQueryService.findIntersecting(this.targetGeometry, options)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => this.handleQueryResults(results),
        error: (error) => this.handleQueryError(error),
        complete: () => this.isQuerying = false
      });
  }

  private executeWithinQuery(options: SpatialQueryOptions): void {
    if (!this.targetGeometry) return;

    this.spatialQueryService.findWithin(this.targetGeometry, options)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => this.handleQueryResults(results),
        error: (error) => this.handleQueryError(error),
        complete: () => this.isQuerying = false
      });
  }

  private executeContainsQuery(options: SpatialQueryOptions): void {
    if (!this.targetGeometry) return;

    // Pour contains, on cherche les parcelles qui contiennent la géométrie cible
    // Ici on simule avec findIntersecting
    this.spatialQueryService.findIntersecting(this.targetGeometry, options)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => this.handleQueryResults(results),
        error: (error) => this.handleQueryError(error),
        complete: () => this.isQuerying = false
      });
  }

  private executeNearbyQuery(options: SpatialQueryOptions): void {
    if (!this.targetGeometry) return;

    const distance = this.spatialForm.get('distance')?.value || 100;
    
    this.spatialQueryService.findNearby(this.targetGeometry, distance, options)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => this.handleQueryResults(results),
        error: (error) => this.handleQueryError(error),
        complete: () => this.isQuerying = false
      });
  }

  private executeBoundsQuery(options: SpatialQueryOptions): void {
    const bounds = {
      minX: this.spatialForm.get('minX')?.value,
      minY: this.spatialForm.get('minY')?.value,
      maxX: this.spatialForm.get('maxX')?.value,
      maxY: this.spatialForm.get('maxY')?.value
    };

    if (!bounds.minX || !bounds.minY || !bounds.maxX || !bounds.maxY) {
      this.handleQueryError('Coordonnées d\'emprise incomplètes');
      return;
    }

    this.spatialQueryService.findInBounds(bounds, options)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => this.handleQueryResults(results),
        error: (error) => this.handleQueryError(error),
        complete: () => this.isQuerying = false
      });
  }

  // =====================================================
  // GESTION DES RÉSULTATS
  // =====================================================

  private handleQueryResults(results: SpatialQueryResult[]): void {
    this.queryResults = results;
    this.queryExecuted.emit(results);
    
    // Auto-highlight des résultats
    if (results.length > 0 && results.length <= 20) {
      this.highlightResults(results);
    }
  }

  private handleQueryError(error: any): void {
    console.error('Erreur requête spatiale:', error);
    this.isQuerying = false;
    // Afficher un message d'erreur à l'utilisateur
  }

  highlightResults(results: SpatialQueryResult[]): void {
    this.selectedResults = results;
    this.resultsHighlight.emit(results);
  }

  clearResults(): void {
    this.queryResults = [];
    this.selectedResults = [];
    this.queryCleared.emit();
  }

  // =====================================================
  // PRESETS ET RACCOURCIS
  // =====================================================

  applyPreset(preset: QueryPreset): void {
    const filter = preset.filter;
    
    this.spatialForm.patchValue({
      queryType: filter.type,
      distance: filter.distance || 100,
      buffer: filter.options?.buffer || 0,
      includeGeometry: filter.options?.includeGeometry || false,
      fields: filter.options?.fields || []
    });

    // Exécuter automatiquement si possible
    if (this.targetGeometry || !this.requiresGeometry(filter.type)) {
      setTimeout(() => this.executeQuery(), 100);
    }
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  private buildQueryOptions(): SpatialQueryOptions {
    const formValue = this.spatialForm.value;
    
    return {
      buffer: formValue.buffer || 0,
      limit: formValue.limit || 50,
      includeGeometry: formValue.includeGeometry || false,
      fields: formValue.fields || []
    };
  }

  private onQueryTypeChange(type: string): void {
    // Réinitialiser certains champs selon le type
    if (type === 'bounds') {
      this.spatialForm.get('distance')?.clearValidators();
    } else if (type === 'nearby') {
      this.spatialForm.get('distance')?.setValidators([Validators.required, Validators.min(1)]);
    }
    
    this.spatialForm.get('distance')?.updateValueAndValidity();
  }

  private requiresGeometry(queryType: string): boolean {
    return ['intersect', 'within', 'contains', 'nearby'].includes(queryType);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.spatialForm.controls).forEach(key => {
      this.spatialForm.get(key)?.markAsTouched();
    });
  }

  // =====================================================
  // GETTERS POUR LE TEMPLATE
  // =====================================================

  get currentQueryType(): any {
    const type = this.spatialForm.get('queryType')?.value;
    return this.queryTypes.find(qt => qt.value === type);
  }

  get showDistanceField(): boolean {
    return this.spatialForm.get('queryType')?.value === 'nearby';
  }

  get showBoundsFields(): boolean {
    return this.spatialForm.get('queryType')?.value === 'bounds';
  }

  get resultsCount(): number {
    return this.queryResults.length;
  }

  get canExecuteQuery(): boolean {
    const queryType = this.spatialForm.get('queryType')?.value;
    return !this.isQuerying && 
           this.spatialForm.valid && 
           (!this.requiresGeometry(queryType) || !!this.targetGeometry);
  }

  formatDistance(distance: number): string {
    const unit = this.spatialForm.get('distanceUnit')?.value;
    return unit === 'kilometers' ? `${(distance / 1000).toFixed(2)} km` : `${distance} m`;
  }

  // =====================================================
  // MÉTHODES POUR LE TEMPLATE
  // =====================================================

  selectParcelle(parcelle: SpatialQueryResult): void {
    const index = this.selectedParcelles.indexOf(parcelle.id);
    if (index > -1) {
      this.selectedParcelles.splice(index, 1);
    } else {
      this.selectedParcelles.push(parcelle.id);
    }
    this.selectionChanged.emit(this.selectedParcelles);
  }

  viewOnMap(parcelle: SpatialQueryResult): void {
    // Émettre un événement pour centrer la carte sur cette parcelle
    this.resultSelected.emit(parcelle);
  }

  resetQuery(): void {
    this.spatialForm.reset();
    this.queryResults = [];
    this.selectedParcelles = [];
    this.hasExecutedQuery = false;
    this.isQuerying = false;
    this.isExecuting = false;
    this.targetGeometry = null;
    this.drawnGeometry = null;
    this.isDrawing = false;
  }

  // =====================================================
  // MÉTHODES MANQUANTES POUR LE TEMPLATE
  // =====================================================

  activateMapSelection(): void {
    console.log('Activation de la sélection sur carte');
  }

  startPolygonDrawing(): void {
    this.isDrawing = true;
    console.log('Début du dessin de polygone');
  }

  clearDrawing(): void {
    this.drawnGeometry = null;
    this.isDrawing = false;
    console.log('Dessin effacé');
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('Fichier sélectionné:', file.name);
    }
  }

  viewGeometry(): void {
    if (this.drawnGeometry) {
      console.log('Affichage de la géométrie sur la carte');
    }
  }

  getAdminZoneIcon(type: string): string {
    switch (type) {
      case 'commune': return 'location_city';
      case 'province': return 'map';
      case 'region': return 'public';
      default: return 'place';
    }
  }

  updateConditionField(index: number, field: string): void {
    this.attributeConditions[index].field = field;
  }

  updateConditionOperator(index: number, operator: string): void {
    this.attributeConditions[index].operator = operator;
  }

  updateConditionValue(index: number, value: string): void {
    this.attributeConditions[index].value = value;
  }

  getFieldPlaceholder(field: string): string {
    const fieldInfo = this.availableFields.find(f => f.name === field);
    return fieldInfo ? `Entrer ${fieldInfo.label.toLowerCase()}` : 'Entrer une valeur';
  }

  removeCondition(index: number): void {
    if (this.attributeConditions.length > 1) {
      this.attributeConditions.splice(index, 1);
    }
  }

  addCondition(): void {
    this.attributeConditions.push({ field: '', operator: 'equals', value: '' });
  }

  // Méthodes manquantes pour le template
  clearAll(): void {
    this.resetQuery();
    this.queryCleared.emit();
  }

  toggleAutoExecute(): void {
    this.autoExecute = !this.autoExecute;
  }

  exportResults(format?: string): void {
    if (this.queryResults.length === 0) return;
    console.log(`Export des résultats en format: ${format || 'default'}`);
  }

  resetSettings(): void {
    this.autoExecute = false;
    this.resultsViewMode = 'table';
  }

  selectQueryType(typeValue: string): void {
    this.selectedQueryType = typeValue;
    this.spatialForm.patchValue({ queryType: typeValue });
  }

  getSelectedQueryType(): any {
    return this.queryTypes.find(type => type.value === this.selectedQueryType);
  }

  saveQuery(): void {
    if (this.spatialForm.valid) {
      console.log('Sauvegarde de la requête');
    }
  }

  toggleResultsView(): void {
    this.resultsViewMode = this.resultsViewMode === 'table' ? 'cards' : 'table';
  }

  getTotalSurface(): number {
    return this.queryResults.reduce((sum, parcelle) => sum + (parcelle.surface_totale || 0), 0);
  }

  getTotalTnb(): number {
    return this.queryResults.reduce((sum, parcelle) => sum + (parcelle.montant_total_tnb || 0), 0);
  }

  getAverageDistance(): number {
    if (this.queryResults.length === 0) return 0;
    const total = this.queryResults.reduce((sum, parcelle) => sum + (parcelle.distance || 0), 0);
    return total / this.queryResults.length;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'brouillon': 'warn',
      'valide': 'accent',
      'publie': 'primary',
      'archive': ''
    };
    return colors[status] || '';
  }

  getDisplayedColumns(): string[] {
    return ['reference_fonciere', 'surface_totale', 'etat_validation', 'actions'];
  }
}
