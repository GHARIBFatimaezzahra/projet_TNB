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
    MatTooltipModule
  ],
  templateUrl: './spatial-queries.component.html',
  styleUrls: ['./spatial-queries.component.scss']
})
export class SpatialQueriesComponent implements OnInit, OnDestroy, AfterViewInit {
  
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  // =====================================================
  // PROPRIÉTÉS
  // =====================================================

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

  // Carte (sera initialisée avec OpenLayers)
  map: any = null;
  drawInteraction: any = null;
  drawSource: any = null;
  vectorLayer: any = null;
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
    // Initialiser la carte après que la vue soit prête
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.dispose();
    }
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

  private initializeMap(): void {
    // Cette méthode sera implémentée avec OpenLayers
    // Pour l'instant, on simule l'initialisation
    console.log('🗺️ Initialisation de la carte OpenLayers');
    
    // TODO: Intégrer la même carte que celle de la création de parcelles
    // avec les mêmes fonds de carte et couches
  }

  // Méthodes de contrôle de la carte
  zoomIn(): void {
    console.log('Zoom avant');
    // TODO: Implémenter avec OpenLayers
  }

  zoomOut(): void {
    console.log('Zoom arrière');
    // TODO: Implémenter avec OpenLayers
  }

  zoomToExtent(): void {
    console.log('Étendue complète');
    // TODO: Implémenter avec OpenLayers
  }

  toggleLayers(): void {
    console.log('Basculer les couches');
    // TODO: Implémenter avec OpenLayers
  }

  private clearDrawings(): void {
    if (this.drawInteraction) {
      this.map?.removeInteraction(this.drawInteraction);
    }
    if (this.drawSource) {
      this.drawSource.clear();
    }
    this.currentDrawing = null;
    this.isDrawing = false;
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
    this.distanceValue = event.value || event.target?.value || 500;
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
