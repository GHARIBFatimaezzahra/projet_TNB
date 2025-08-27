// =====================================================
// COMPOSANT CARTE PARCELLE - VISUALISATION SIG
// =====================================================

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

// Services
import { MapService } from '../../../services/map.service';
import { SpatialQueryService } from '../../../services/spatial-query.service';

// Models
import { Parcelle } from '../../../models/parcelle.models';

// Composants
import { LayerControlComponent } from '../layer-control/layer-control.component';
import { DrawingToolsComponent } from '../drawing-tools/drawing-tools.component';

export interface MapOptions {
  center?: [number, number];
  zoom?: number;
  enableDrawing?: boolean;
  enableSelection?: boolean;
  showControls?: boolean;
  layers?: string[];
}

export interface MapLayer {
  id: string;
  name: string;
  type: 'base' | 'overlay' | 'data';
  visible: boolean;
  opacity: number;
  url?: string;
  data?: any;
}

@Component({
  selector: 'app-parcelle-map',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSliderModule,
    MatCheckboxModule,
    MatMenuModule,
    MatDividerModule,
    LayerControlComponent,
    DrawingToolsComponent
  ],
  templateUrl: './parcelle-map.component.html',
  styleUrls: ['./parcelle-map.component.scss']
})
export class ParcelleMapComponent implements OnInit, OnDestroy {
  @Input() parcelles: Parcelle[] = [];
  @Input() parcelle?: Parcelle; // Pour une parcelle unique
  @Input() selectedParcelle?: Parcelle;
  @Input() readonly = false; // Mode lecture seule
  @Input() readOnly = false; // Alias pour readonly
  @Input() options: MapOptions = {};
  @Input() height = '400px';
  @Input() width = '100%';

  @Output() parcelleClick = new EventEmitter<Parcelle>();
  @Output() parcelleSelect = new EventEmitter<Parcelle>();
  @Output() geometryCreate = new EventEmitter<any>();
  @Output() geometryUpdate = new EventEmitter<any>();
  @Output() mapReady = new EventEmitter<any>();

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  // État de la carte
  map: any;
  mapLoaded = false;
  isLoading = false;

  // Couches
  baseLayers: MapLayer[] = [
    { id: 'osm', name: 'OpenStreetMap', type: 'base', visible: true, opacity: 1 },
    { id: 'satellite', name: 'Satellite', type: 'base', visible: false, opacity: 1 },
    { id: 'cadastre', name: 'Cadastre', type: 'overlay', visible: false, opacity: 0.7 }
  ];

  overlayLayers: MapLayer[] = [
    { id: 'parcelles', name: 'Parcelles', type: 'data', visible: true, opacity: 0.8 },
    { id: 'zones', name: 'Zones urbanistiques', type: 'overlay', visible: false, opacity: 0.5 },
    { id: 'limites', name: 'Limites administratives', type: 'overlay', visible: false, opacity: 0.6 }
  ];

  // Configuration par défaut
  defaultOptions: MapOptions = {
    center: [-7.0926, 31.7917], // Casablanca
    zoom: 12,
    enableDrawing: false,
    enableSelection: true,
    showControls: true,
    layers: ['osm', 'parcelles']
  };

  // État des outils
  selectedTool = '';
  isDrawingMode = false;
  isSelectionMode = true;

  // Statistiques
  mapStats = {
    totalParcelles: 0,
    visibleParcelles: 0,
    selectedParcelles: 0,
    mapBounds: null as any
  };

  private destroy$ = new Subject<void>();

  constructor(
    private mapService: MapService,
    private spatialQueryService: SpatialQueryService
  ) {}

  ngOnInit(): void {
    this.initializeMap();
    this.setupEventListeners();
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
      this.isLoading = true;
      const mapOptions = { 
        ...this.defaultOptions, 
        ...this.options
      };
      
      // S'assurer que center est toujours défini
      if (!mapOptions.center) {
        mapOptions.center = this.defaultOptions.center;
      }

      // Créer la carte
      this.map = await this.mapService.createMap(this.mapContainer.nativeElement, mapOptions as any);
      
      // Ajouter les couches de base
      await this.addBaseLayers();
      
      // Ajouter les données
      await this.loadParcellesData();
      
      // Configurer les interactions
      this.setupMapInteractions();
      
      this.mapLoaded = true;
      this.mapReady.emit(this.map);
      
    } catch (error) {
      console.error('Erreur initialisation carte:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async addBaseLayers(): Promise<void> {
    // Ajouter les couches de base visibles
    for (const layer of this.baseLayers.filter(l => l.visible)) {
      await this.mapService.addBaseLayer(this.map, layer.id as any);
    }
  }

  private async loadParcellesData(): Promise<void> {
    if (this.parcelles.length > 0) {
      // Ajouter les parcelles à la carte
      this.parcelles.forEach(parcelle => {
        if (parcelle.geometry) {
          this.addParcelleToMap(parcelle);
        }
      });

      // Zoomer sur l'ensemble des parcelles
      this.zoomToAllParcelles();
    }
  }

  private setupMapInteractions(): Promise<void> {
    return new Promise((resolve) => {
      // Clic sur parcelle
      this.mapService.onClick(this.map, (coordinate) => {
        this.handleMapClick(coordinate);
      });

      // Fin de dessin
      this.mapService.onDrawEnd(this.map, (geometry) => {
        this.handleGeometryCreate(geometry);
      });

      // Fin de modification
      this.mapService.onModifyEnd(this.map, (geometry) => {
        this.handleGeometryUpdate(geometry);
      });

      resolve();
    });
  }

  private setupEventListeners(): void {
    // Écouter les changements de parcelles
    // (sera connecté via @Input() changes)
  }

  // =====================================================
  // GESTION DES PARCELLES
  // =====================================================

  private addParcelleToMap(parcelle: Parcelle): void {
    if (!parcelle.geometry || !this.map) return;

    try {
      // Ajouter la géométrie avec style selon l'état
      const style = this.getParcelleStyle(parcelle);
      this.mapService.addGeometry(this.map, {
        geometry: parcelle.geometry,
        id: `parcelle_${parcelle.id}`,
        data: parcelle,
        style: style
      });

    } catch (error) {
      console.error('Erreur ajout parcelle:', error);
    }
  }

  private getParcelleStyle(parcelle: Parcelle): any {
    const isSelected = this.selectedParcelle?.id === parcelle.id;
    
    switch (parcelle.etat_validation) {
      case 'Brouillon':
        return {
          fillColor: isSelected ? '#FF9800' : '#FFC107',
          strokeColor: isSelected ? '#F57C00' : '#FF8F00',
          fillOpacity: isSelected ? 0.6 : 0.4,
          strokeWidth: isSelected ? 3 : 2
        };
      case 'Valide':
        return {
          fillColor: isSelected ? '#4CAF50' : '#8BC34A',
          strokeColor: isSelected ? '#388E3C' : '#689F38',
          fillOpacity: isSelected ? 0.6 : 0.4,
          strokeWidth: isSelected ? 3 : 2
        };
      case 'Publie':
        return {
          fillColor: isSelected ? '#2196F3' : '#03A9F4',
          strokeColor: isSelected ? '#1976D2' : '#0288D1',
          fillOpacity: isSelected ? 0.6 : 0.4,
          strokeWidth: isSelected ? 3 : 2
        };
      case 'Archive':
        return {
          fillColor: isSelected ? '#757575' : '#BDBDBD',
          strokeColor: isSelected ? '#424242' : '#757575',
          fillOpacity: isSelected ? 0.4 : 0.2,
          strokeWidth: isSelected ? 3 : 1
        };
      default:
        return {
          fillColor: isSelected ? '#9C27B0' : '#E1BEE7',
          strokeColor: isSelected ? '#7B1FA2' : '#9C27B0',
          fillOpacity: isSelected ? 0.6 : 0.4,
          strokeWidth: isSelected ? 3 : 2
        };
    }
  }

  private handleMapClick(coordinate: [number, number]): void {
    if (!this.isSelectionMode) return;

    // Trouver la parcelle cliquée
    const clickedParcelle = this.findParcelleAtCoordinate(coordinate);
    
    if (clickedParcelle) {
      this.parcelleClick.emit(clickedParcelle);
      
      if (this.selectedParcelle?.id !== clickedParcelle.id) {
        this.selectParcelle(clickedParcelle);
      }
    }
  }

  private findParcelleAtCoordinate(coordinate: [number, number]): Parcelle | null {
    // Simulation - en réalité, utiliser les fonctionnalités OpenLayers
    return this.parcelles.find(p => {
      // Vérification simplifiée si le point est dans la parcelle
      return this.isPointInParcelle(coordinate, p);
    }) || null;
  }

  private isPointInParcelle(point: [number, number], parcelle: Parcelle): boolean {
    // Simulation - utiliser les vraies fonctions géométriques
    return Math.random() > 0.7; // Simulation
  }

  // =====================================================
  // SÉLECTION ET NAVIGATION
  // =====================================================

  selectParcelle(parcelle: Parcelle): void {
    // Désélectionner l'ancienne parcelle
    if (this.selectedParcelle) {
      this.updateParcelleStyle(this.selectedParcelle);
    }

    // Sélectionner la nouvelle parcelle
    this.selectedParcelle = parcelle;
    this.updateParcelleStyle(parcelle);
    this.parcelleSelect.emit(parcelle);

    // Centrer sur la parcelle
    this.zoomToParcelle(parcelle);
  }

  private updateParcelleStyle(parcelle: Parcelle): void {
    const newStyle = this.getParcelleStyle(parcelle);
    // Mettre à jour le style sur la carte
    // this.mapService.updateFeatureStyle(this.map, `parcelle_${parcelle.id}`, newStyle);
  }

  zoomToParcelle(parcelle: Parcelle): void {
    if (parcelle.geometry) {
      this.mapService.zoomToGeometry(this.map, parcelle.geometry);
    }
  }

  zoomToAllParcelles(): void {
    if (this.parcelles.length === 0) return;

    const geometries = this.parcelles
      .filter(p => p.geometry)
      .map(p => p.geometry);

    if (geometries.length > 0) {
      // Calculer les bounds de toutes les géométries
      const bounds = this.calculateBounds(geometries);
      // Implémentation temporaire - à remplacer par la méthode du MapService
      console.log('Zoom vers toutes les parcelles:', bounds);
      // this.mapService.zoomToBounds(this.map, bounds);
    }
  }

  private calculateBounds(geometries: any[]): [number, number, number, number] {
    // Simulation - calculer les vraies bounds
    return [-7.2, 31.6, -6.9, 31.9];
  }

  // =====================================================
  // OUTILS DE DESSIN
  // =====================================================

  enableDrawing(toolType: string): void {
    this.isDrawingMode = true;
    this.isSelectionMode = false;
    this.selectedTool = toolType;
    this.mapService.enableDrawing(this.map, toolType);
  }

  disableDrawing(): void {
    this.isDrawingMode = false;
    this.isSelectionMode = true;
    this.selectedTool = '';
    this.mapService.disableDrawing(this.map);
  }

  private handleGeometryCreate(geometry: any): void {
    this.geometryCreate.emit(geometry);
    this.disableDrawing();
  }

  private handleGeometryUpdate(geometry: any): void {
    this.geometryUpdate.emit(geometry);
  }

  // =====================================================
  // GESTION DES COUCHES
  // =====================================================

  toggleLayer(layerId: string): void {
    const layer = [...this.baseLayers, ...this.overlayLayers]
      .find(l => l.id === layerId);
    
    if (layer) {
      layer.visible = !layer.visible;
      // Implémentation temporaire - à remplacer par la méthode du MapService
      console.log('Toggle layer:', layerId, layer.visible);
      // this.mapService.toggleLayer(this.map, layerId, layer.visible);
    }
  }

  setLayerOpacity(layerId: string, opacity: number): void {
    const layer = [...this.baseLayers, ...this.overlayLayers]
      .find(l => l.id === layerId);
    
    if (layer) {
      layer.opacity = opacity;
      // Implémentation temporaire - à remplacer par la méthode du MapService
      console.log('Set layer opacity:', layerId, opacity);
      // this.mapService.setLayerOpacity(this.map, layerId, opacity);
    }
  }

  // =====================================================
  // ACTIONS CARTE
  // =====================================================

  centerMap(): void {
    const center = this.options.center || this.defaultOptions.center!;
    const zoom = this.options.zoom || this.defaultOptions.zoom!;
    this.mapService.centerMap(this.map, center, zoom);
  }

  toggleFullscreen(): void {
    this.mapService.toggleFullscreen(this.mapContainer.nativeElement);
  }

  refreshMap(): void {
    this.loadParcellesData();
  }

  exportMap(): void {
    // Exporter la carte comme image
    // Implémentation temporaire - à remplacer par la méthode du MapService
    console.log('Export map as image - fonctionnalité temporairement désactivée');
    // TODO: Implémenter l'export d'image quand le MapService sera complet
  }

  // =====================================================
  // RECHERCHE SPATIALE
  // =====================================================

  searchInBounds(): void {
    // Implémentation temporaire - à remplacer par la méthode du MapService
    const bounds = [0, 0, 0, 0]; // this.mapService.getCurrentBounds(this.map);
    
    this.spatialQueryService.findInBounds({
      minX: bounds[0],
      minY: bounds[1],
      maxX: bounds[2],
      maxY: bounds[3]
    }).pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        console.log('Parcelles dans la vue:', results);
        this.updateMapStats();
      });
  }

  private updateMapStats(): void {
    this.mapStats = {
      totalParcelles: this.parcelles.length,
      visibleParcelles: this.parcelles.filter(p => this.isParcelleVisible(p)).length,
      selectedParcelles: this.selectedParcelle ? 1 : 0,
      mapBounds: [0, 0, 0, 0] // this.mapService.getCurrentBounds(this.map)
    };
  }

  private isParcelleVisible(parcelle: Parcelle): boolean {
    // Vérifier si la parcelle est dans la vue actuelle
    return true; // Simulation
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  private destroyMap(): void {
    if (this.map) {
      this.mapService.destroyMap(this.map);
    }
  }

  // Getters pour le template
  get canDraw(): boolean {
    return this.options.enableDrawing === true;
  }

  get showControls(): boolean {
    return this.options.showControls !== false;
  }

  get visibleBaseLayers(): MapLayer[] {
    return this.baseLayers.filter(l => l.visible);
  }

  get visibleOverlayLayers(): MapLayer[] {
    return this.overlayLayers.filter(l => l.visible);
  }
}
