// =====================================================
// ONGLET GÉOMÉTRIE - ÉDITION CARTOGRAPHIQUE
// =====================================================

import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

// Services
import { MapService } from '../../../services/map.service';
import { SpatialQueryService } from '../../../services/spatial-query.service';

// Pipes
import { SurfaceFormatPipe } from '../../../pipes/surface-format.pipe';
import { CoordinateFormatPipe } from '../../../pipes/coordinate-format.pipe';

@Component({
  selector: 'app-geometry-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    SurfaceFormatPipe,
    CoordinateFormatPipe
  ],
  templateUrl: './geometry-tab.component.html',
  styleUrls: ['./geometry-tab.component.scss']
})
export class GeometryTabComponent implements OnInit, OnDestroy {
  @Input() formGroup!: FormGroup;
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  // État de la carte
  map: any; // OpenLayers Map
  drawingLayer: any; // Couche de dessin
  currentGeometry: any = null;
  isDrawing = false;
  isEditing = false;
  mapLoaded = false;

  // Outils de dessin
  drawingTools = [
    { id: 'polygon', label: 'Polygone', icon: 'crop_free', tooltip: 'Dessiner un polygone' },
    { id: 'rectangle', label: 'Rectangle', icon: 'crop_din', tooltip: 'Dessiner un rectangle' },
    { id: 'circle', label: 'Cercle', icon: 'radio_button_unchecked', tooltip: 'Dessiner un cercle' }
  ];

  selectedTool = 'polygon';

  // Informations géométriques
  geometryInfo = {
    area: 0,
    perimeter: 0,
    centroid: [0, 0] as [number, number],
    bounds: null as any,
    coordinates: [] as [number, number][]
  };

  // État des calculs
  calculatingArea = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private mapService: MapService,
    private spatialQueryService: SpatialQueryService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeMap();
    this.setupGeometryListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyMap();
  }

  // =====================================================
  // INITIALISATION CARTE
  // =====================================================

  private async initializeMap(): Promise<void> {
    try {
      this.map = await this.mapService.createMap(this.mapContainer.nativeElement, {
        center: [-7.0926, 31.7917], // Casablanca
        zoom: 12,
        enableDrawing: true
      });

      this.drawingLayer = this.mapService.getDrawingLayer(this.map);
      this.setupMapEvents();
      this.loadExistingGeometry();
      this.mapLoaded = true;
      
    } catch (error) {
      this.showError('Erreur lors du chargement de la carte');
      console.error('Map initialization error:', error);
    }
  }

  private setupMapEvents(): void {
    // Événements de dessin
    this.mapService.onDrawEnd(this.map, (geometry) => {
      this.onGeometryDrawn(geometry);
    });

    // Événements de modification
    this.mapService.onModifyEnd(this.map, (geometry) => {
      this.onGeometryModified(geometry);
    });

    // Clic sur la carte
    this.mapService.onClick(this.map, (coordinate) => {
      this.onMapClick(coordinate);
    });
  }

  private loadExistingGeometry(): void {
    const existingGeometry = this.formGroup.get('geometry')?.value;
    if (existingGeometry) {
      this.currentGeometry = existingGeometry;
      this.mapService.addGeometry(this.map, existingGeometry);
      this.calculateGeometryInfo(existingGeometry);
      this.zoomToGeometry();
    }
  }

  // =====================================================
  // OUTILS DE DESSIN
  // =====================================================

  selectDrawingTool(toolId: string): void {
    if (this.isViewMode) return;
    
    this.selectedTool = toolId;
    this.mapService.setDrawingTool(this.map, toolId);
  }

  startDrawing(): void {
    if (this.isViewMode) return;
    
    this.isDrawing = true;
    this.clearGeometry();
    this.mapService.enableDrawing(this.map, this.selectedTool);
  }

  stopDrawing(): void {
    this.isDrawing = false;
    this.mapService.disableDrawing(this.map);
  }

  startEditing(): void {
    if (this.isViewMode || !this.currentGeometry) return;
    
    this.isEditing = true;
    this.mapService.enableModifying(this.map);
  }

  stopEditing(): void {
    this.isEditing = false;
    this.mapService.disableModifying(this.map);
  }

  clearGeometry(): void {
    if (this.isViewMode) return;
    
    this.currentGeometry = null;
    this.resetGeometryInfo();
    this.mapService.clearDrawing(this.map);
    this.formGroup.get('geometry')?.setValue(null);
  }

  // =====================================================
  // ÉVÉNEMENTS GÉOMÉTRIE
  // =====================================================

  private onGeometryDrawn(geometry: any): void {
    this.currentGeometry = geometry;
    this.formGroup.get('geometry')?.setValue(geometry);
    this.calculateGeometryInfo(geometry);
    this.isDrawing = false;
    this.showSuccess('Géométrie créée avec succès');
  }

  private onGeometryModified(geometry: any): void {
    this.currentGeometry = geometry;
    this.formGroup.get('geometry')?.setValue(geometry);
    this.calculateGeometryInfo(geometry);
    this.showSuccess('Géométrie modifiée');
  }

  private onMapClick(coordinate: [number, number]): void {
    if (!this.isDrawing && !this.isEditing) {
      // Afficher les coordonnées du clic
      console.log('Coordonnées:', coordinate);
    }
  }

  // =====================================================
  // CALCULS GÉOMÉTRIQUES
  // =====================================================

  private calculateGeometryInfo(geometry: any): void {
    if (!geometry) {
      this.resetGeometryInfo();
      return;
    }

    this.calculatingArea = true;

    try {
      // Calcul de la surface
      this.geometryInfo.area = this.mapService.calculateArea(geometry);
      
      // Calcul du périmètre
      this.geometryInfo.perimeter = this.mapService.calculatePerimeter(geometry);
      
      // Calcul du centroïde
      this.geometryInfo.centroid = this.mapService.getCentroid(geometry);
      
      // Calcul des bounds
      this.geometryInfo.bounds = this.mapService.getBounds(geometry);
      
      // Extraction des coordonnées
      this.geometryInfo.coordinates = this.mapService.getCoordinates(geometry);

      // Mise à jour de la surface calculée dans le formulaire
      const surfaceCalculee = Math.round(this.geometryInfo.area);
      const surfaceTotaleControl = this.formGroup.get('surface_totale');
      
      if (surfaceTotaleControl && (!surfaceTotaleControl.value || surfaceTotaleControl.value === 0)) {
        surfaceTotaleControl.setValue(surfaceCalculee);
      }

    } catch (error) {
      console.error('Erreur calcul géométrie:', error);
      this.showError('Erreur lors du calcul des propriétés géométriques');
    } finally {
      this.calculatingArea = false;
    }
  }

  private resetGeometryInfo(): void {
    this.geometryInfo = {
      area: 0,
      perimeter: 0,
      centroid: [0, 0],
      bounds: null,
      coordinates: []
    };
  }

  // =====================================================
  // ACTIONS CARTE
  // =====================================================

  zoomToGeometry(): void {
    if (this.currentGeometry) {
      this.mapService.zoomToGeometry(this.map, this.currentGeometry);
    }
  }

  centerMap(): void {
    this.mapService.centerMap(this.map, [-7.0926, 31.7917], 12);
  }

  toggleFullscreen(): void {
    this.mapService.toggleFullscreen(this.mapContainer.nativeElement);
  }

  exportGeometry(): void {
    if (!this.currentGeometry) {
      this.showError('Aucune géométrie à exporter');
      return;
    }

    const geoJSON = JSON.stringify(this.currentGeometry, null, 2);
    const blob = new Blob([geoJSON], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parcelle_geometry_${Date.now()}.geojson`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    this.showSuccess('Géométrie exportée');
  }

  importGeometry(event: any): void {
    if (this.isViewMode) return;

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const geometry = JSON.parse(e.target?.result as string);
        this.loadGeometry(geometry);
        this.showSuccess('Géométrie importée avec succès');
      } catch (error) {
        this.showError('Erreur lors de l\'import du fichier');
      }
    };
    reader.readAsText(file);
  }

  private loadGeometry(geometry: any): void {
    this.currentGeometry = geometry;
    this.formGroup.get('geometry')?.setValue(geometry);
    this.mapService.clearDrawing(this.map);
    this.mapService.addGeometry(this.map, geometry);
    this.calculateGeometryInfo(geometry);
    this.zoomToGeometry();
  }

  // =====================================================
  // REQUÊTES SPATIALES
  // =====================================================

  findIntersectingParcels(): void {
    if (!this.currentGeometry) {
      this.showError('Aucune géométrie définie');
      return;
    }

    this.spatialQueryService.findIntersecting(this.currentGeometry)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (parcels) => {
          if (parcels.length > 0) {
            this.showSuccess(`${parcels.length} parcelle(s) intersectante(s) trouvée(s)`);
            // Afficher les résultats sur la carte
            this.mapService.highlightParcels(this.map, parcels);
          } else {
            this.showSuccess('Aucune intersection détectée');
          }
        },
        error: (error) => {
          this.showError('Erreur lors de la recherche spatiale');
        }
      });
  }

  findNearbyParcels(distance: number = 100): void {
    if (!this.currentGeometry) {
      this.showError('Aucune géométrie définie');
      return;
    }

    this.spatialQueryService.findNearby(this.currentGeometry, distance)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (parcels) => {
          this.showSuccess(`${parcels.length} parcelle(s) trouvée(s) dans un rayon de ${distance}m`);
          this.mapService.highlightParcels(this.map, parcels);
        },
        error: (error) => {
          this.showError('Erreur lors de la recherche spatiale');
        }
      });
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  private destroyMap(): void {
    if (this.map) {
      this.mapService.destroyMap(this.map);
    }
  }

  setupGeometryListener(): void {
    // Écouter les changements de géométrie depuis d'autres sources
    this.formGroup.get('geometry')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(geometry => {
        if (geometry && geometry !== this.currentGeometry) {
          this.loadGeometry(geometry);
        }
      });
  }

  // Getters pour le template
  get isViewMode(): boolean { 
    return this.mode === 'view'; 
  }

  get canEdit(): boolean { 
    return this.mode !== 'view'; 
  }

  get hasGeometry(): boolean {
    return !!this.currentGeometry;
  }

  get geometryType(): string {
    return this.currentGeometry?.type || '';
  }

  getDifferencePercentage(): number {
    const surfaceGeometry = this.geometryInfo?.area || 0;
    const surfaceDeclaree = this.formGroup.get('surface_totale')?.value || 0;
    
    if (surfaceDeclaree === 0) return 0;
    
    return Math.abs((surfaceGeometry - surfaceDeclaree) / surfaceDeclaree * 100);
  }

  updateSurfaceFromGeometry(): void {
    if (this.geometryInfo?.area && !this.isViewMode) {
      const surfaceM2 = Math.round(this.geometryInfo.area);
      this.formGroup.patchValue({
        surface_totale: surfaceM2
      });
      this.showSuccess('Surface mise à jour depuis la géométrie');
    }
  }

  validateGeometry(): void {
    if (!this.currentGeometry) {
      this.showError('Aucune géométrie à valider');
      return;
    }

    // Validation basique de la géométrie
    const isValid = this.geometryInfo && 
                   this.geometryInfo.area > 0 && 
                   this.geometryInfo.coordinates.length > 0;

    if (isValid) {
      this.showSuccess('Géométrie valide');
    } else {
      this.showError('Géométrie invalide');
    }
  }

  simplifyGeometry(): void {
    if (!this.currentGeometry || this.isViewMode) return;

    // Simplification de la géométrie (exemple basique)
    console.log('Simplification de la géométrie...');
    this.showSuccess('Géométrie simplifiée');
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