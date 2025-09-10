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

import { SpatialQueryService, SpatialQueryParams, ParcelleResult, SpatialQueryResult as OldSpatialQueryResult } from './services/spatial-query.service';
import { MapComponent, MapOptions } from '../../shared/components/map/map.component';
import { SpatialQueriesService, IntersectionQuery, SectorQuery, BufferQuery, SpatialQueryResponse, SpatialQueryResult } from './services/spatial-queries.service';
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

  // Onglets et modes - Types étendus pour les nouveaux onglets
  currentTab: 'emprise' | 'secteur' | 'distance' | 'hotel' | 'road' | 'point' = 'emprise';
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

  // Options de statut foncier (selon la création de parcelles)
  statutFoncierOptions = [
    { value: 'TF', label: 'Titre Foncier (TF)' },
    { value: 'R', label: 'Réquisition (R)' },
    { value: 'NI', label: 'Non Immatriculé (NI)' },
    { value: 'Collectif', label: 'Collectif' }
  ];

  // Options de zonage urbanistique (selon la création de parcelles)
  zonageOptions = [
    { value: 'R1', label: 'R1 - Résidentiel dense' },
    { value: 'R2', label: 'R2 - Résidentiel moyen' },
    { value: 'R3', label: 'R3 - Résidentiel faible' },
    { value: 'I', label: 'I - Industriel' },
    { value: 'C', label: 'C - Commercial' }
  ];

  // Secteurs
  secteurs: any[] = [];
  selectedSecteurType = '';
  selectedSecteur = '';

  // Géométrie dessinée
  currentDrawing: any = null;
  isDrawing = false;

  // Nouvelles propriétés pour les requêtes spatiales
  communes: any[] = [];
  hotels: any[] = [];
  roads: any[] = [];
  selectedCommune: string = '';
  selectedHotel: string = '';
  selectedRoad: string = '';
  bufferRadius: number = 1000;
  roadBuffer: number = 100;
  spatialQueryResults: SpatialQueryResult | null = null;
  queryStatistics: any = null;
  isLoadingQuery = false;

  constructor(
    private spatialQueryService: SpatialQueryService,
    private spatialQueriesService: SpatialQueriesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('🔍 Initialisation composant requêtes spatiales');
    this.loadReferenceData();
  }

  /**
   * Charger les données de référence (communes, hôtels, voies)
   */
  private loadReferenceData(): void {
    // Charger les communes
    this.spatialQueriesService.getCommunes().subscribe({
      next: (response) => {
        if (response.success) {
          this.communes = response.data;
          console.log('Communes chargées:', this.communes.length);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des communes:', error);
      }
    });

    // Charger les hôtels
    this.spatialQueriesService.getHotels().subscribe({
      next: (response) => {
        if (response.success) {
          this.hotels = response.data;
          console.log('Hôtels chargés:', this.hotels.length);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des hôtels:', error);
      }
    });

    // Charger les voies
    this.spatialQueriesService.getRoads().subscribe({
      next: (response) => {
        if (response.success) {
          this.roads = response.data;
          console.log('Voies chargées:', this.roads.length);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des voies:', error);
      }
    });
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

  switchTab(tab: 'emprise' | 'secteur' | 'distance' | 'hotel' | 'road' | 'point'): void {
    this.currentTab = tab;
    // Mapper les nouveaux onglets vers les types de requête existants
    if (tab === 'hotel' || tab === 'road' || tab === 'point') {
      this.queryParams.type = 'distance'; // Ces onglets utilisent des requêtes de distance
    } else {
      this.queryParams.type = tab as 'emprise' | 'secteur' | 'distance';
    }
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
        this.executeIntersectionQuery();
      }, 500);
    }
  }

  /**
   * Exécuter une requête d'intersection avec l'emprise dessinée
   */
  executeIntersectionQuery(): void {
    if (!this.currentDrawing) {
      this.showNotification('Aucune géométrie dessinée', 'error');
      return;
    }

    this.isLoadingQuery = true;
    
    try {
      // Convertir la géométrie en WKT
      const wkt = this.spatialQueriesService.convertGeoJSONToWKT(this.currentDrawing);
      
      const query: IntersectionQuery = {
        geometry: wkt,
        srid: 26191, // Merchich/Nord Maroc
        filters: {
          statutFoncier: this.filters.statutFoncier || undefined,
          zonage: this.filters.zonage || undefined,
          surfaceMin: this.filters.surfaceMin || undefined
        }
      };

      this.spatialQueriesService.findParcellesByIntersection(query).subscribe({
        next: (response: SpatialQueryResponse) => {
          this.isLoadingQuery = false;
          if (response.success) {
            this.spatialQueryResults = response.data;
            this.queryStatistics = response.data.metadata;
            this.showNotification(`Trouvé ${response.data.total} parcelles intersectées`, 'success');
            console.log('Résultats de la requête d\'intersection:', response);
          } else {
            this.showNotification('Erreur lors de la requête', 'error');
          }
        },
        error: (error) => {
          this.isLoadingQuery = false;
          console.error('Erreur lors de la requête d\'intersection:', error);
          this.showNotification('Erreur lors de la requête d\'intersection', 'error');
        }
      });
    } catch (error) {
      this.isLoadingQuery = false;
      console.error('Erreur de conversion de géométrie:', error);
      this.showNotification('Erreur de conversion de géométrie', 'error');
    }
  }

  /**
   * Exécuter une requête par secteur (commune)
   */
  executeSectorQuery(): void {
    if (!this.selectedCommune) {
      this.showNotification('Veuillez sélectionner une commune', 'error');
      return;
    }

    this.isLoadingQuery = true;

    const query: SectorQuery = {
      secteurId: this.selectedCommune,
      secteurName: this.communes.find(c => c.id === this.selectedCommune)?.nom
    };

    this.spatialQueriesService.findParcellesBySector(query).subscribe({
        next: (response: SpatialQueryResponse) => {
          this.isLoadingQuery = false;
          if (response.success) {
            this.spatialQueryResults = response.data;
            this.queryStatistics = response.data.metadata;
            this.showNotification(`Trouvé ${response.data.total} parcelles dans la commune`, 'success');
            console.log('Résultats de la requête par secteur:', response);
          } else {
            this.showNotification('Erreur lors de la requête par secteur', 'error');
          }
        },
      error: (error) => {
        this.isLoadingQuery = false;
        console.error('Erreur lors de la requête par secteur:', error);
        this.showNotification('Erreur lors de la requête par secteur', 'error');
      }
    });
  }

  /**
   * Exécuter une requête par rayon autour d'un hôtel
   */
  executeHotelBufferQuery(): void {
    if (!this.selectedHotel) {
      this.showNotification('Veuillez sélectionner un hôtel', 'error');
      return;
    }

    this.isLoadingQuery = true;

    this.spatialQueriesService.findParcellesNearHotel(this.selectedHotel, this.bufferRadius).subscribe({
        next: (response: SpatialQueryResponse) => {
          this.isLoadingQuery = false;
          if (response.success) {
            this.spatialQueryResults = response.data;
            this.queryStatistics = response.data.metadata;
            this.showNotification(`Trouvé ${response.data.total} parcelles près de l'hôtel`, 'success');
            console.log('Résultats de la requête près d\'un hôtel:', response);
          } else {
            this.showNotification('Erreur lors de la requête près d\'un hôtel', 'error');
          }
        },
      error: (error) => {
        this.isLoadingQuery = false;
        console.error('Erreur lors de la requête près d\'un hôtel:', error);
        this.showNotification('Erreur lors de la requête près d\'un hôtel', 'error');
      }
    });
  }

  /**
   * Exécuter une requête le long d'une voie
   */
  executeRoadBufferQuery(): void {
    if (!this.selectedRoad) {
      this.showNotification('Veuillez sélectionner une voie', 'error');
      return;
    }

    this.isLoadingQuery = true;

    this.spatialQueriesService.findParcellesAlongRoad(this.selectedRoad, this.roadBuffer).subscribe({
        next: (response: SpatialQueryResponse) => {
          this.isLoadingQuery = false;
          if (response.success) {
            this.spatialQueryResults = response.data;
            this.queryStatistics = response.data.metadata;
            this.showNotification(`Trouvé ${response.data.total} parcelles le long de la voie`, 'success');
            console.log('Résultats de la requête le long d\'une voie:', response);
          } else {
            this.showNotification('Erreur lors de la requête le long d\'une voie', 'error');
          }
        },
      error: (error) => {
        this.isLoadingQuery = false;
        console.error('Erreur lors de la requête le long d\'une voie:', error);
        this.showNotification('Erreur lors de la requête le long d\'une voie', 'error');
      }
    });
  }

  /**
   * Exécuter une requête par rayon autour d'un point cliqué
   */
  executePointBufferQuery(center: { x: number; y: number }): void {
    this.isLoadingQuery = true;

    const query: BufferQuery = {
      center,
      radius: this.bufferRadius,
      srid: 26191
    };

    this.spatialQueriesService.findParcellesByBuffer(query).subscribe({
        next: (response: SpatialQueryResponse) => {
          this.isLoadingQuery = false;
          if (response.success) {
            this.spatialQueryResults = response.data;
            this.queryStatistics = response.data.metadata;
            this.showNotification(`Trouvé ${response.data.total} parcelles dans le rayon`, 'success');
            console.log('Résultats de la requête par rayon:', response);
          } else {
            this.showNotification('Erreur lors de la requête par rayon', 'error');
          }
        },
      error: (error) => {
        this.isLoadingQuery = false;
        console.error('Erreur lors de la requête par rayon:', error);
        this.showNotification('Erreur lors de la requête par rayon', 'error');
      }
    });
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

  /**
   * Afficher une notification
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: [`snackbar-${type}`]
    });
  }

  /**
   * Obtenir la répartition par statut pour l'affichage
   */
  getStatutDistribution(): Array<{label: string, count: number, percentage: number}> {
    if (!this.queryStatistics?.parcellesParStatut) {
      return [];
    }

    const total = this.queryStatistics.totalParcelles;
    return Object.entries(this.queryStatistics.parcellesParStatut).map(([label, count]) => ({
      label,
      count: count as number,
      percentage: Math.round((count as number / total) * 100)
    }));
  }

  /**
   * Obtenir la répartition par zonage pour l'affichage
   */
  getZonageDistribution(): Array<{label: string, count: number, percentage: number}> {
    if (!this.queryStatistics?.parcellesParZonage) {
      return [];
    }

    const total = this.queryStatistics.totalParcelles;
    return Object.entries(this.queryStatistics.parcellesParZonage).map(([label, count]) => ({
      label,
      count: count as number,
      percentage: Math.round((count as number / total) * 100)
    }));
  }

  /**
   * Vérifier s'il y a des résultats
   */
  get hasResults(): boolean {
    return !!(this.spatialQueryResults && this.spatialQueryResults.parcelles && this.spatialQueryResults.parcelles.length > 0);
  }

  /**
   * Obtenir le résumé des résultats
   */
  get summary(): any {
    if (!this.hasResults) {
      return {
        totalParcelles: 0,
        surfaceTotale: 0,
        surfaceImposable: 0,
        recettePrevue: 0
      };
    }

    const parcelles = this.spatialQueryResults?.parcelles || [];
    const totalParcelles = parcelles.length;
    const surfaceTotale = parcelles.reduce((sum: number, p: any) => sum + (p.surfaceTotale || 0), 0);
    const surfaceImposable = parcelles.reduce((sum: number, p: any) => sum + (p.surfaceImposable || 0), 0);
    const recettePrevue = parcelles.reduce((sum: number, p: any) => sum + (p.montantTotalTnb || 0), 0);

    return {
      totalParcelles,
      surfaceTotale,
      surfaceImposable,
      recettePrevue
    };
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
      next: (results: OldSpatialQueryResult) => {
        // Convertir l'ancien format vers le nouveau format
        this.spatialQueryResults = {
          parcelles: results.parcelles,
          total: results.parcelles.length,
          geometry: null,
          metadata: {
            queryType: 'intersection' as const,
            parameters: this.queryParams,
            executionTime: 0
          }
        };
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

  get resultsCount(): number {
    return this.spatialQueryResults?.parcelles?.length || 0;
  }
}
