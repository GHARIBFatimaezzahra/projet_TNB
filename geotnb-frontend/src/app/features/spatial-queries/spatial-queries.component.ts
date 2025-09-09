/* =====================================================
   COMPOSANT REQUÊTES SPATIALES - RECHERCHE AVANCÉE
   ===================================================== */

import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SpatialQueryService, SpatialQueryParams, ParcelleResult, SpatialQueryResult } from './services/spatial-query.service';
import { MapComponent, MapOptions } from '../../shared/components/map/map.component';
import Map from 'ol/Map';

@Component({
  selector: 'app-spatial-queries',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatIconModule,
    MatTooltipModule,
    MapComponent
  ],
  templateUrl: './spatial-queries.component.html',
  styleUrls: ['./spatial-queries.component.scss']
})
export class SpatialQueriesComponent implements OnInit, OnDestroy, AfterViewInit {
  
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  // =====================================================
  // PROPRIÉTÉS
  // =====================================================

  // Carte OpenLayers
  map!: Map;
  mapOptions: MapOptions = {
    center: [-7.6114, 33.5731], // Casablanca en WGS84
    zoom: 12,
    enableDrawing: true,
    enableSelection: false,
    showParcelles: false,
    showLayers: true,
    mode: 'create' // Mode création avec outils de dessin
  };

  // Onglets et modes
  currentTab: 'emprise' | 'secteur' | 'distance' = 'emprise';
  currentDrawMode: 'polygon' | 'rectangle' = 'polygon';
  currentPointMode: 'click' | 'coords' = 'click';
  
  // Filtres
  filters = {
    statutFoncier: '',
    zonage: '',
    surfaceMin: undefined as number | undefined
  };

  // Paramètres de requête
  queryParams: SpatialQueryParams = {
    type: 'emprise',
    filters: {}
  };

  // Résultats
  queryResults: SpatialQueryResult | null = null;
  isLoading = false;

  // Distance
  distanceValue = 500;
  distanceUnit = 'mètres';

  // Coordonnées manuelles
  coordinates = {
    xMin: undefined as number | undefined,
    yMin: undefined as number | undefined,
    xMax: undefined as number | undefined,
    yMax: undefined as number | undefined
  };

  // Secteurs
  secteurs: any[] = [];
  selectedSecteurType = '';
  selectedSecteur = '';

  // Géométrie dessinée
  currentDrawing: any = null;
  isDrawing = false;

  constructor(
    private spatialQueryService: SpatialQueryService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('🔍 Initialisation composant requêtes spatiales');
  }

  ngAfterViewInit(): void {
    // La carte est maintenant gérée par le composant app-map
  }

  ngOnDestroy(): void {
    // Nettoyage géré par le composant de carte
  }

  // =====================================================
  // GESTION DES ONGLETS
  // =====================================================

  switchTab(tab: 'emprise' | 'secteur' | 'distance'): void {
    this.currentTab = tab;
    this.queryParams.type = tab;
    this.clearDrawings();
  }

  setDrawMode(mode: 'polygon' | 'rectangle'): void {
    this.currentDrawMode = mode;
  }

  setPointMode(mode: 'click' | 'coords'): void {
    this.currentPointMode = mode;
    if (mode === 'click') {
      this.showMessage('Cliquez sur la carte pour définir le point de référence', 'info');
    }
  }

  // =====================================================
  // GESTION DE LA CARTE
  // =====================================================

  onMapReady(map: Map): void {
    console.log('🗺️ Carte prête:', map);
    this.map = map;
    // La carte est maintenant initialisée avec toutes les couches
  }

  onGeometryDrawn(geometry: any): void {
    console.log('✏️ Géométrie dessinée:', geometry);
    this.currentDrawing = geometry;
    
    if (this.currentTab === 'emprise') {
      // Lancer automatiquement la requête après le dessin
      setTimeout(() => {
        this.executeQuery();
      }, 500);
    }
  }

  // Méthodes de contrôle de la carte
  zoomIn(): void {
    if (this.map) {
      const view = this.map.getView();
      const currentZoom = view.getZoom() || 0;
      view.animate({
        zoom: currentZoom + 1,
        duration: 300
      });
    }
  }

  zoomOut(): void {
    if (this.map) {
      const view = this.map.getView();
      const currentZoom = view.getZoom() || 0;
      view.animate({
        zoom: currentZoom - 1,
        duration: 300
      });
    }
  }

  zoomToExtent(): void {
    if (this.map) {
      const view = this.map.getView();
      view.animate({
        center: [-7.6114, 33.5731], // Casablanca
        zoom: 12,
        duration: 500
      });
    }
  }

  toggleLayers(): void {
    console.log('🗂️ Basculer les couches');
    // Le composant de carte gère déjà le basculement des couches
  }

  private clearDrawings(): void {
    this.currentDrawing = null;
    this.isDrawing = false;
    // Le composant de carte gère l'effacement des dessins
  }

  // =====================================================
  // GESTION DES SECTEURS
  // =====================================================

  onSecteurTypeChange(): void {
    if (this.selectedSecteurType) {
      this.spatialQueryService.getSecteurs(this.selectedSecteurType as any).subscribe({
        next: (secteurs) => {
          this.secteurs = secteurs;
          this.selectedSecteur = '';
        },
        error: (error) => {
          console.error('Erreur lors du chargement des secteurs:', error);
          this.showMessage('Erreur lors du chargement des secteurs', 'error');
        }
      });
    }
  }

  // =====================================================
  // GESTION DE LA DISTANCE
  // =====================================================

  onDistanceChange(event: any): void {
    // Gérer l'événement du slider HTML
    if (event && event.target && event.target.value !== undefined) {
      this.distanceValue = parseFloat(event.target.value);
    }
    this.distanceUnit = this.distanceValue >= 1000 ? 'km' : 'mètres';
  }

  // =====================================================
  // EXÉCUTION DES REQUÊTES
  // =====================================================

  executeQuery(): void {
    if (!this.validateQuery()) {
      return;
    }

    this.isLoading = true;
    this.queryParams.filters = { ...this.filters };

    console.log('🔍 Exécution requête spatiale:', this.queryParams);

    this.spatialQueryService.executeSpatialQuery(this.queryParams).subscribe({
      next: (results) => {
        this.queryResults = results;
        this.isLoading = false;
        this.showMessage(
          `Requête ${this.currentTab} terminée: ${results.parcelles.length} parcelles trouvées`,
          'success'
        );
      },
      error: (error) => {
        console.error('Erreur lors de l\'exécution de la requête:', error);
        this.isLoading = false;
        this.showMessage('Erreur lors de l\'exécution de la requête', 'error');
      }
    });
  }

  private validateQuery(): boolean {
    switch (this.currentTab) {
      case 'emprise':
        const hasCoords = this.validateCoordinates();
        const hasDrawing = this.currentDrawing !== null;
        if (!hasCoords && !hasDrawing) {
          this.showMessage('Veuillez dessiner une emprise sur la carte ou saisir des coordonnées', 'error');
          return false;
        }
        break;

      case 'secteur':
        if (!this.selectedSecteurType || !this.selectedSecteur) {
          this.showMessage('Veuillez sélectionner un type de secteur et un secteur spécifique', 'error');
          return false;
        }
        this.queryParams.secteurId = this.selectedSecteur;
        break;

      case 'distance':
        if (!this.currentDrawing || !this.currentDrawing.get('isDistanceCenter')) {
          this.showMessage('Veuillez définir un point de référence sur la carte', 'error');
          return false;
        }
        this.queryParams.point = { x: 0, y: 0 }; // Coordonnées du point
        this.queryParams.radius = this.distanceValue;
        break;
    }

    return true;
  }

  private validateCoordinates(): boolean {
    const { xMin, yMin, xMax, yMax } = this.coordinates;
    return xMin !== undefined && yMin !== undefined && xMax !== undefined && yMax !== undefined &&
           xMin < xMax && yMin < yMax;
  }

  // =====================================================
  // EXPORT DES RÉSULTATS
  // =====================================================

  exportResults(format: 'excel' | 'csv' | 'gpkg' | 'pdf'): void {
    if (!this.queryResults || this.queryResults.parcelles.length === 0) {
      this.showMessage('Aucun résultat à exporter. Effectuez d\'abord une recherche.', 'error');
      return;
    }

    this.spatialQueryService.exportResults(this.queryResults.parcelles, format).subscribe({
      next: (blob) => {
        this.downloadFile(blob, `resultats_spatiaux.${format}`);
        this.showMessage(`Export ${format.toUpperCase()} généré avec succès`, 'success');
      },
      error: (error) => {
        console.error('Erreur lors de l\'export:', error);
        this.showMessage('Erreur lors de l\'export', 'error');
      }
    });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // =====================================================
  // ACTIONS
  // =====================================================

  clearQuery(): void {
    // Réinitialiser les formulaires
    this.filters = {
      statutFoncier: '',
      zonage: '',
      surfaceMin: undefined
    };
    
    this.coordinates = {
      xMin: undefined,
      yMin: undefined,
      xMax: undefined,
      yMax: undefined
    };
    
    this.selectedSecteurType = '';
    this.selectedSecteur = '';
    this.distanceValue = 500;
    
    // Effacer les dessins
    this.clearDrawings();
    
    // Effacer les résultats
    this.queryResults = null;
    
    this.showMessage('Requête effacée', 'info');
  }

  viewParcel(reference: string): void {
    this.showMessage(`Affichage de la parcelle: ${reference}`, 'info');
    // TODO: Naviguer vers la page de détail de la parcelle
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: [`snackbar-${type}`]
    });
  }

  // =====================================================
  // GETTERS POUR LE TEMPLATE
  // =====================================================

  get hasResults(): boolean {
    return this.queryResults !== null && this.queryResults.parcelles.length > 0;
  }

  get resultsCount(): number {
    return this.queryResults?.parcelles.length || 0;
  }

  get summary(): any {
    return this.queryResults?.summary || {
      totalParcelles: 0,
      surfaceTotale: 0,
      surfaceImposable: 0,
      recettePrevue: 0
    };
  }
}
