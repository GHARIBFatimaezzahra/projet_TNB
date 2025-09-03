import { Component, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import { fromLonLat, toLonLat, transform, addProjection, get as getProjection } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { Style, Fill, Stroke, Circle, Text } from 'ol/style';
import { Feature } from 'ol';
import { Point, Polygon, LineString, MultiPolygon } from 'ol/geom';
import { defaults as defaultInteractions, Select, Draw, Modify } from 'ol/interaction';
import { SelectEvent } from 'ol/interaction/Select';
import { DrawEvent } from 'ol/interaction/Draw';
import { ParcelleAPI } from './../../../features/parcelles/services/parcelles-api.service';

// Interface pour les options de la carte
export interface MapOptions {
  center?: [number, number];
  zoom?: number;
  enableDrawing?: boolean;
  enableSelection?: boolean;
  enableModify?: boolean;
  showParcelles?: boolean;
  showLayers?: boolean;
  mode?: 'view' | 'create' | 'sig'; // Nouveaux modes
}

// Interface pour les couches shapefile
export interface ShapefileLayer {
  name: string;
  url: string;
  visible: boolean;
  style?: Style;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div #mapElement class="map" [id]="mapId"></div>
      
      <!-- Contrôles de la carte -->
      <div class="map-controls" *ngIf="showControls">
        <!-- Contrôles des couches -->
        <div class="layer-controls" *ngIf="showLayers">
          <h4>Couches</h4>
          <div class="layer-item" *ngFor="let layer of shapefileLayers">
            <label>
              <input type="checkbox" 
                     [checked]="layer.visible" 
                     (change)="toggleLayer(layer)">
              {{ layer.name }}
            </label>
          </div>
        </div>
        
        <!-- Outils de dessin -->
        <div class="drawing-tools" *ngIf="enableDrawing">
          <h4>Outils de dessin</h4>
          <button class="btn btn-primary btn-sm" 
                  (click)="startDrawing('Polygon')"
                  [class.active]="currentTool === 'Polygon'">
            <i class="fas fa-draw-polygon"></i> Polygone
          </button>
          <button class="btn btn-secondary btn-sm" 
                  (click)="clearDrawing()">
            <i class="fas fa-trash"></i> Effacer
          </button>
        </div>
        
        <!-- Informations de sélection -->
        <div class="selection-info" *ngIf="selectedParcelle">
          <h4>Parcelle sélectionnée</h4>
          <p><strong>Référence:</strong> {{ selectedParcelle.referenceFonciere }}</p>
          <p><strong>Surface:</strong> {{ selectedParcelle.surfaceTotale }} m²</p>
          <p><strong>Statut:</strong> {{ selectedParcelle.etatValidation }}</p>
          <button class="btn btn-primary btn-sm" (click)="viewParcelleDetails()">
            Voir détails
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;
  
  @Input() mapId: string = 'map';
  @Input() options: MapOptions = {};
  @Input() parcelles: ParcelleAPI[] = [];
  @Input() showControls: boolean = true;
  @Input() showLayers: boolean = true;
  @Input() enableDrawing: boolean = false;
  @Input() enableSelection: boolean = true;
  @Input() enableModify: boolean = false;
  
  @Output() parcelleSelected = new EventEmitter<ParcelleAPI>();
  @Output() geometryDrawn = new EventEmitter<any>();
  @Output() mapReady = new EventEmitter<Map>();

  // Propriétés de la carte
  private map!: Map;
  private parcelleLayer!: VectorLayer<VectorSource>;
  private drawingLayer!: VectorLayer<VectorSource>;
  private selectInteraction!: Select;
  private drawInteraction!: Draw;
  private modifyInteraction!: Modify;
  public currentTool: string = '';
  
  // Couches shapefile pour Casablanca
  public shapefileLayers: ShapefileLayer[] = [
    {
      name: 'OSM_Base',
      url: '/assets/shapefiles/casablanca/OSM.geojson',
      visible: true
    },
    {
      name: 'Casablanca_Communes',
      url: '/assets/shapefiles/casablanca/commune.geojson',
      visible: true
    },
    {
      name: 'Quartiers_Casa',
      url: '/assets/shapefiles/casablanca/quartiers.geojson',
      visible: false
    },
    {
      name: 'voirie casa',
      url: '/assets/shapefiles/casablanca/voirie.geojson',
      visible: true
    },
    {
      name: 'site_acceuil_wgs',
      url: '/assets/shapefiles/casablanca/sites.geojson',
      visible: false
    },
    {
      name: 'bidonvilles84',
      url: '/assets/shapefiles/casablanca/bidonvilles.geojson',
      visible: false
    }
  ];

  // Parcelle sélectionnée
  public selectedParcelle: ParcelleAPI | null = null;

  // Coordonnées de Casablanca
  private readonly CASABLANCA_CENTER: [number, number] = [-7.6114, 33.5731]; // Longitude, Latitude (WGS84)
  private readonly CASABLANCA_CENTER_26191: [number, number] = [-842000, 3950000]; // X, Y en EPSG:26191 (Merchich/Nord Maroc)
  private readonly DEFAULT_ZOOM = 10; // Zoom plus large pour voir toute la région de Casablanca

  // Couches shapefile chargées (Map des couches vectorielles)
  private loadedLayers: { [key: string]: VectorLayer<VectorSource> } = {};

  constructor(private http: HttpClient) {
    // Configurer la projection EPSG:26191 (Merchich/Nord Maroc)
    this.setupProjection();
  }

  private setupProjection(): void {
    // Définir la projection EPSG:26191
    proj4.defs('EPSG:26191', '+proj=tmerc +lat_0=33.3 +lon_0=-7.5 +k=0.999625769 +x_0=500000 +y_0=300000 +ellps=clrk80 +units=m +no_defs');
    
    // Enregistrer la projection avec OpenLayers
    register(proj4);
    
    // Ajouter la projection à OpenLayers
    const projection = getProjection('EPSG:26191');
    if (projection) {
      addProjection(projection);
    }
  }

  ngOnInit(): void {
    // Configuration par défaut selon le mode
    this.options = {
      center: this.CASABLANCA_CENTER,
      zoom: this.DEFAULT_ZOOM,
      enableDrawing: false,
      enableSelection: true,
      enableModify: false,
      showParcelles: true,
      showLayers: true,
      mode: 'view', // Mode par défaut
      ...this.options
    };

    // Configuration spécifique selon le mode
    this.configureMapForMode();
  }

  private configureMapForMode(): void {
    switch (this.options.mode) {
      case 'view': // Dashboard parcelles - Carte Interactive
        this.options.enableDrawing = false;
        this.options.enableSelection = true;
        this.options.enableModify = false;
        this.options.showParcelles = true;
        this.options.showLayers = true;
        break;
        
      case 'create': // Création de parcelle - Phase géométrie
        this.options.enableDrawing = true;
        this.options.enableSelection = false;
        this.options.enableModify = true;
        this.options.showParcelles = false;
        this.options.showLayers = true;
        break;
        
      case 'sig': // Page Carte SIG - Consultation détaillée
        this.options.enableDrawing = false;
        this.options.enableSelection = true;
        this.options.enableModify = false;
        this.options.showParcelles = true;
        this.options.showLayers = true;
        break;
    }
  }

  ngAfterViewInit(): void {
    console.log('MapComponent ngAfterViewInit - mapElement:', this.mapElement);
    if (this.mapElement && this.mapElement.nativeElement) {
      this.initializeMap();
    } else {
      console.error('MapElement not found!');
      // Retry after a short delay
      setTimeout(() => {
        if (this.mapElement && this.mapElement.nativeElement) {
          this.initializeMap();
        } else {
          console.error('MapElement still not found after retry!');
        }
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.dispose();
    }
  }

  private initializeMap(): void {
    console.log('Initializing map with options:', this.options);
    console.log('MapElement:', this.mapElement.nativeElement);
    
    try {
      // Créer la carte
      this.map = new Map({
        target: this.mapElement.nativeElement,
        layers: [
          // Couche de base WMS en EPSG:26191
          new TileLayer({
            source: new TileWMS({
              url: 'https://www.ign.ma/wms',
              params: {
                'LAYERS': 'ign:ortho',
                'TILED': true,
                'CRS': 'EPSG:26191'
              },
              serverType: 'geoserver'
            })
          })
        ],
        view: new View({
          center: this.CASABLANCA_CENTER_26191, // Utiliser EPSG:26191
          zoom: this.options.zoom || this.DEFAULT_ZOOM,
          projection: 'EPSG:26191'
        }),
        interactions: defaultInteractions()
      });

      console.log('Map created successfully:', this.map);

      // Initialiser les couches
      this.initializeBaseLayer();
      this.initializeParcelleLayer();
      this.initializeDrawingLayer();
      this.initializeShapefileLayers();
      
      // Initialiser les interactions
      this.initializeInteractions();
      
      // Émettre l'événement de prêt
      this.mapReady.emit(this.map);
      
      console.log('Map initialization completed');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private initializeBaseLayer(): void {
    // La couche de base OpenStreetMap est déjà ajoutée dans initializeMap()
    // Pas besoin d'ajouter d'autres couches de base
  }



  private initializeParcelleLayer(): void {
    const source = new VectorSource();
    
    this.parcelleLayer = new VectorLayer({
      source: source,
      style: (feature) => this.getParcelleStyle(feature)
    });

    this.map.addLayer(this.parcelleLayer);
    this.loadParcelles();
  }

  private initializeDrawingLayer(): void {
    const source = new VectorSource();
    
    this.drawingLayer = new VectorLayer({
      source: source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2
        })
      })
    });

    this.map.addLayer(this.drawingLayer);
  }

  private initializeShapefileLayers(): void {
    this.shapefileLayers.forEach(layer => {
      this.loadShapefileLayer(layer);
    });
  }

  private loadShapefileLayer(layer: ShapefileLayer): void {
    const source = new VectorSource();
    
    // Créer la couche vectorielle
    const vectorLayer = new VectorLayer({
      source: source,
      style: this.getShapefileStyle(layer.name),
      visible: layer.visible
    });

    // Ajouter la couche à la carte
    this.map.addLayer(vectorLayer);
    
    // Forcer la visibilité
    vectorLayer.setVisible(true);
    
    // Stocker la référence
    this.loadedLayers[layer.name] = vectorLayer;
    
    console.log(`Couche ${layer.name} ajoutée à la carte, visible: ${vectorLayer.getVisible()}`);
    console.log(`🔍 Nombre de couches sur la carte:`, this.map.getLayers().getLength());
    console.log(`🔍 Couche ajoutée:`, vectorLayer);

    // Charger les données GeoJSON réelles
    this.loadGeoJSONData(layer, source);
    
    // Zoomer sur les features après chargement
    source.on('addfeature', () => {
      if (source.getFeatures().length > 0) {
        const extent = source.getExtent();
        if (extent && extent[0] !== Infinity) {
          this.map.getView().fit(extent, { padding: [50, 50, 50, 50] });
        }
      }
    });
  }

  private getShapefileStyle(layerName: string): Style {
    switch (layerName) {
      case 'OSM_Base':
        // Style pour le fond de carte OSM - plus visible
        return new Style({
          stroke: new Stroke({
            color: '#000000',
            width: 3
          }),
          fill: new Fill({
            color: 'rgba(200, 200, 200, 0.8)'
          })
        });
      
      case 'Casablanca_Communes':
        // Bleu foncé plus visible
        return new Style({
          fill: new Fill({
            color: 'rgba(0, 0, 255, 0.6)'
          }),
          stroke: new Stroke({
            color: '#0000ff',
            width: 3
          })
        });
      
      case 'voirie casa':
        // Rouge plus visible pour les voiries
        return new Style({
          stroke: new Stroke({
            color: '#ff0000',
            width: 4
          })
        });
      
      case 'Quartiers_Casa':
        // Bleu clair/teal plus visible
        return new Style({
          fill: new Fill({
            color: 'rgba(11, 195, 115, 0.6)'
          }),
          stroke: new Stroke({
            color: '#00ffff',
            width: 2
          }),
          text: new Text({
            font: '12px Arial',
            fill: new Fill({
              color: '#00ffff'
            })
          })
        });
      
      case 'site_acceuil_wgs':
        // Rose plus visible
        return new Style({
          fill: new Fill({
            color: 'rgba(255, 105, 180, 0.8)'
          }),
          stroke: new Stroke({
            color: '#ff69b4',
            width: 3
          })
        });
      
      case 'bidonvilles84':
        // Rose plus visible
        return new Style({
          fill: new Fill({
            color: 'rgba(255, 105, 180, 0.7)'
          }),
          stroke: new Stroke({
            color: '#ff1493',
            width: 3
          })
        });
      
      default:
        return new Style({
          fill: new Fill({
            color: 'rgba(108, 117, 125, 0.1)'
          }),
          stroke: new Stroke({
            color: '#6c757d',
            width: 1
          })
        });
    }
  }

  private loadGeoJSONData(layer: ShapefileLayer, source: VectorSource): void {
    console.log(`🔄 Tentative de chargement de ${layer.name} depuis: ${layer.url}`);
    
    // Vérifier si c'est un fichier GPKG
    if (layer.url.endsWith('.gpkg')) {
      console.log(`📦 Fichier GPKG détecté pour ${layer.name}`);
      this.loadGPKGData(layer, source);
      return;
    }
    
    this.http.get(layer.url).subscribe({
      next: (data: any) => {
        console.log(`📄 Données GeoJSON reçues pour ${layer.name}:`, data);
        // Créer les features à partir des données GeoJSON
        const features = this.createFeaturesFromGeoJSON(data);
        source.addFeatures(features);
        console.log(`✅ Couche ${layer.name} chargée: ${features.length} éléments`);
        console.log(`🔍 Features ajoutées à la source:`, features.length);
        console.log(`🔍 Source features count:`, source.getFeatures().length);
        console.log(`🔍 Couche visible:`, this.loadedLayers[layer.name]?.getVisible());
      },
      error: (error) => {
        console.warn(`❌ Impossible de charger la couche ${layer.name} depuis ${layer.url}:`, error);
        console.log(`🔄 Utilisation des données de démonstration pour ${layer.name}`);
        // Créer des données de démonstration si les fichiers n'existent pas
        this.createDemoData(layer, source);
      }
    });
  }

  private async loadGPKGData(layer: ShapefileLayer, source: VectorSource): Promise<void> {
    try {
      console.log(`🔄 Chargement du fichier GPKG: ${layer.url}`);
      
      // Charger le fichier GPKG avec GDAL-JS
      const gdal = await import('gdal-js') as any;
      const dataset = await gdal.open(layer.url);
      console.log(`📦 Dataset GPKG ouvert:`, dataset);
      
      // Obtenir les couches du dataset
      const layers = dataset.layers;
      console.log(`📋 Nombre de couches dans le GPKG:`, layers.length);
      
      const features: Feature[] = [];
      
      // Parcourir toutes les couches
      for (let i = 0; i < layers.length; i++) {
        const gdalLayer = layers.get(i);
        console.log(`🗺️ Couche ${i}:`, gdalLayer.name);
        
        // Parcourir les features de la couche
        gdalLayer.features.forEach((gdalFeature: any) => {
          try {
            const geometry = gdalFeature.getGeometry();
            const properties = gdalFeature.fields.toObject();
            
            // Convertir la géométrie GDAL en géométrie OpenLayers
            const olGeometry = this.convertGDALGeometryToOL(geometry);
            
            if (olGeometry) {
              const feature = new Feature({
                geometry: olGeometry,
                properties: properties
              });
              features.push(feature);
            }
          } catch (error) {
            console.warn('Erreur lors de la conversion de la feature:', error);
          }
        });
      }
      
      // Ajouter les features à la source
      source.addFeatures(features);
      console.log(`✅ GPKG ${layer.name} chargé: ${features.length} éléments`);
      console.log(`🔍 Features ajoutées à la source:`, features.length);
      console.log(`🔍 Couche visible:`, this.loadedLayers[layer.name]?.getVisible());
      
    } catch (error) {
      console.error(`❌ Erreur lors du chargement du GPKG ${layer.name}:`, error);
      console.log(`🔄 Utilisation des données de démonstration pour ${layer.name}`);
      this.createDemoData(layer, source);
    }
  }

  private convertGDALGeometryToOL(gdalGeometry: any): any {
    if (!gdalGeometry) return null;
    
    const type = gdalGeometry.type;
    const coordinates = gdalGeometry.getCoordinates();
    
    switch (type) {
      case 'Point':
        return new Point(coordinates);
      case 'LineString':
        return new LineString(coordinates);
      case 'Polygon':
        return new Polygon(coordinates);
      case 'MultiPolygon':
        return new MultiPolygon(coordinates);
      default:
        console.warn('Type de géométrie non supporté:', type);
        return null;
    }
  }

  private createFeaturesFromGeoJSON(geoJsonData: any): Feature[] {
    const features: Feature[] = [];
    
    if (geoJsonData.type === 'FeatureCollection' && geoJsonData.features) {
      geoJsonData.features.forEach((featureData: any) => {
        try {
          const feature = new Feature({
            geometry: this.createGeometryFromGeoJSON(featureData.geometry),
            properties: featureData.properties
          });
          features.push(feature);
        } catch (error) {
          console.warn('Erreur lors de la création de la feature:', error);
        }
      });
    }
    
    return features;
  }

  private createGeometryFromGeoJSON(geometry: any): any {
    switch (geometry.type) {
      case 'Point':
        return new Point(geometry.coordinates);
      case 'LineString':
        return new LineString(geometry.coordinates);
      case 'MultiLineString':
        return new LineString(geometry.coordinates[0]); // Prendre la première ligne
      case 'Polygon':
        return new Polygon(geometry.coordinates);
      case 'MultiPolygon':
        return new MultiPolygon(geometry.coordinates);
      default:
        return new Point([0, 0]);
    }
  }

  private convertToCasablanca(coords: number[]): number[] {
    // Conversion approximative vers Casablanca
    // Les coordonnées semblent être dans un système local
    const x = coords[0];
    const y = coords[1];
    
    // Conversion approximative vers WGS84 Casablanca
    const lon = -7.6114 + (x + 28) * 0.1; // Ajustement longitude
    const lat = 33.5731 + (y - 63) * 0.1; // Ajustement latitude
    
    return [lon, lat];
  }

  private convertCoordinatesArray(coordsArray: number[][]): number[][] {
    if (!coordsArray || !Array.isArray(coordsArray)) {
      return [];
    }
    return coordsArray.map(coords => this.convertToCasablanca(coords));
  }

  private convertMultiPolygonCoordinates(multiCoords: number[][][]): number[][][] {
    if (!multiCoords || !Array.isArray(multiCoords)) {
      return [];
    }
    return multiCoords.map(polygon => this.convertCoordinatesArray(polygon));
  }



  private createDemoData(layer: ShapefileLayer, source: VectorSource): void {
    // Créer des données de démonstration pour Casablanca
    const demoFeatures: Feature[] = [];
    
    switch (layer.name) {
      case 'OSM_Base':
        // Créer un fond de carte simple avec des routes et bâtiments en EPSG:26191
        const osmRoutes = [
          { name: 'Route principale', coords: [[-842000, 3950000], [-840000, 3950000]] },
          { name: 'Route secondaire', coords: [[-841000, 3945000], [-841000, 3955000]] },
          { name: 'Route côtière', coords: [[-843000, 3952000], [-840000, 3952000]] }
        ];
        
        osmRoutes.forEach(route => {
          const feature = new Feature({
            geometry: new LineString(route.coords),
            properties: { name: route.name, type: 'road' }
          });
          demoFeatures.push(feature);
        });
        
        // Ajouter quelques bâtiments
        const osmBuildings = [
          { name: 'Bâtiment 1', coords: [[[-841500, 3948000], [-841400, 3948000], [-841400, 3949000], [-841500, 3949000], [-841500, 3948000]]] },
          { name: 'Bâtiment 2', coords: [[[-840500, 3951000], [-840400, 3951000], [-840400, 3952000], [-840500, 3952000], [-840500, 3951000]]] }
        ];
        
        osmBuildings.forEach(building => {
          const feature = new Feature({
            geometry: new Polygon(building.coords),
            properties: { name: building.name, type: 'building' }
          });
          demoFeatures.push(feature);
        });
        
        console.log(`🏗️ OSM_Base - Routes créées:`, osmRoutes.length);
        console.log(`🏢 OSM_Base - Bâtiments créés:`, osmBuildings.length);
        console.log(`📊 OSM_Base - Total features:`, demoFeatures.length);
        break;
      case 'Commune de Casablanca':
        // Communes complètes de Casablanca comme dans QGIS
        const communes = [
          { name: 'Casablanca', coords: [[-7.7, 33.5], [-7.5, 33.5], [-7.5, 33.7], [-7.7, 33.7], [-7.7, 33.5]] },
          { name: 'Ain Harrouda', coords: [[-7.6, 33.6], [-7.5, 33.6], [-7.5, 33.7], [-7.6, 33.7], [-7.6, 33.6]] },
          { name: 'Mohammedia', coords: [[-7.4, 33.6], [-7.3, 33.6], [-7.3, 33.7], [-7.4, 33.7], [-7.4, 33.6]] },
          { name: 'Bouskoura', coords: [[-7.6, 33.4], [-7.5, 33.4], [-7.5, 33.5], [-7.6, 33.5], [-7.6, 33.4]] },
          { name: 'Dar Bouazza', coords: [[-7.8, 33.4], [-7.7, 33.4], [-7.7, 33.5], [-7.8, 33.5], [-7.8, 33.4]] }
        ];
        
        communes.forEach(commune => {
          demoFeatures.push(new Feature({
            geometry: new Polygon([commune.coords]),
            properties: { name: commune.name }
          }));
        });
        break;
        
      case 'Quartiers':
        // Quartiers complets de Casablanca comme dans QGIS
        const quartiers = [
          { name: 'Centre', coords: [[-7.62, 33.58], [-7.60, 33.58], [-7.60, 33.60], [-7.62, 33.60], [-7.62, 33.58]] },
          { name: 'Maarif', coords: [[-7.65, 33.57], [-7.63, 33.57], [-7.63, 33.59], [-7.65, 33.59], [-7.65, 33.57]] },
          { name: 'Ain Diab', coords: [[-7.68, 33.55], [-7.66, 33.55], [-7.66, 33.57], [-7.68, 33.57], [-7.68, 33.55]] },
          { name: 'Hay Mohammadi', coords: [[-7.69, 33.56], [-7.67, 33.56], [-7.67, 33.58], [-7.69, 33.58], [-7.69, 33.56]] },
          { name: 'Sidi Maarouf', coords: [[-7.61, 33.59], [-7.59, 33.59], [-7.59, 33.61], [-7.61, 33.61], [-7.61, 33.59]] },
          { name: 'Ain Sebaa', coords: [[-7.70, 33.54], [-7.68, 33.54], [-7.68, 33.56], [-7.70, 33.56], [-7.70, 33.54]] },
          { name: 'Hay Hassani', coords: [[-7.64, 33.54], [-7.62, 33.54], [-7.62, 33.56], [-7.64, 33.56], [-7.64, 33.54]] },
          { name: 'Oulfa', coords: [[-7.66, 33.58], [-7.64, 33.58], [-7.64, 33.60], [-7.66, 33.60], [-7.66, 33.58]] }
        ];
        
        quartiers.forEach(quartier => {
          demoFeatures.push(new Feature({
            geometry: new Polygon([quartier.coords]),
            properties: { name: quartier.name }
          }));
        });
        break;
        
      case 'voirie casa':
        // Réseau routier complet de Casablanca comme dans QGIS
        const voirieRoutes = [
          { name: 'Boulevard Mohammed V', coords: [[-7.65, 33.6], [-7.6, 33.6]] },
          { name: 'Avenue Hassan II', coords: [[-7.62, 33.55], [-7.62, 33.65]] },
          { name: 'Boulevard Zerktouni', coords: [[-7.64, 33.58], [-7.60, 33.58]] },
          { name: 'Avenue des FAR', coords: [[-7.66, 33.56], [-7.60, 33.56]] },
          { name: 'Boulevard de la Corniche', coords: [[-7.68, 33.54], [-7.60, 33.54]] },
          { name: 'Avenue Moulay Rachid', coords: [[-7.70, 33.55], [-7.68, 33.55]] },
          { name: 'Boulevard Sidi Mohammed Ben Abdellah', coords: [[-7.64, 33.60], [-7.60, 33.60]] },
          { name: 'Avenue Lalla Yacout', coords: [[-7.66, 33.58], [-7.64, 33.58]] },
          { name: 'Boulevard Moulay Youssef', coords: [[-7.68, 33.57], [-7.66, 33.57]] },
          { name: 'Avenue Al Fida', coords: [[-7.62, 33.57], [-7.60, 33.57]] }
        ];
        
        voirieRoutes.forEach(route => {
          demoFeatures.push(new Feature({
            geometry: new LineString(route.coords),
            properties: { name: route.name }
          }));
        });
        break;
        
      case 'site_acceuil_wgs':
        // Sites d'accueil complets de Casablanca comme dans QGIS
        const sites = [
          { name: 'Site Centre', coords: [-7.61, 33.58] },
          { name: 'Site Maarif', coords: [-7.64, 33.57] },
          { name: 'Site Ain Diab', coords: [-7.67, 33.56] },
          { name: 'Site Hay Mohammadi', coords: [-7.68, 33.57] },
          { name: 'Site Sidi Maarouf', coords: [-7.60, 33.60] },
          { name: 'Site Ain Sebaa', coords: [-7.69, 33.55] },
          { name: 'Site Hay Hassani', coords: [-7.63, 33.55] },
          { name: 'Site Oulfa', coords: [-7.65, 33.59] },
          { name: 'Site Mers Sultan', coords: [-7.62, 33.56] },
          { name: 'Site Derb Ghalef', coords: [-7.66, 33.55] }
        ];
        
        sites.forEach(site => {
          demoFeatures.push(new Feature({
            geometry: new Point(site.coords),
            properties: { name: site.name }
          }));
        });
        break;
        
      case 'bidonvilles84':
        // Zones bidonvilles complètes de Casablanca comme dans QGIS
        const bidonvilles = [
          { name: 'Sidi Moumen', coords: [[-7.68, 33.52], [-7.66, 33.52], [-7.66, 33.54], [-7.68, 33.54], [-7.68, 33.52]] },
          { name: 'Hay Mohammadi', coords: [[-7.69, 33.56], [-7.67, 33.56], [-7.67, 33.58], [-7.69, 33.58], [-7.69, 33.56]] },
          { name: 'Ain Sebaa', coords: [[-7.70, 33.54], [-7.68, 33.54], [-7.68, 33.56], [-7.70, 33.56], [-7.70, 33.54]] },
          { name: 'Derb Ghalef', coords: [[-7.66, 33.55], [-7.64, 33.55], [-7.64, 33.57], [-7.66, 33.57], [-7.66, 33.55]] },
          { name: 'Hay Hassani', coords: [[-7.64, 33.54], [-7.62, 33.54], [-7.62, 33.56], [-7.64, 33.56], [-7.64, 33.54]] },
          { name: 'Oulfa', coords: [[-7.66, 33.58], [-7.64, 33.58], [-7.64, 33.60], [-7.66, 33.60], [-7.66, 33.58]] },
          { name: 'Mers Sultan', coords: [[-7.62, 33.56], [-7.60, 33.56], [-7.60, 33.58], [-7.62, 33.58], [-7.62, 33.56]] },
          { name: 'Hay Riad', coords: [[-7.60, 33.54], [-7.58, 33.54], [-7.58, 33.56], [-7.60, 33.56], [-7.60, 33.54]] }
        ];
        
        bidonvilles.forEach(zone => {
          demoFeatures.push(new Feature({
            geometry: new Polygon([zone.coords]),
            properties: { name: zone.name }
          }));
        });
        break;
    }
    
    source.addFeatures(demoFeatures);
    console.log(`Données de démonstration créées pour ${layer.name}: ${demoFeatures.length} éléments`);
    console.log(`Couche ${layer.name} ajoutée à la carte avec ${demoFeatures.length} features`);
  }

  private initializeInteractions(): void {
    // Interaction de sélection
    if (this.options.enableSelection) {
      this.selectInteraction = new Select({
        layers: [this.parcelleLayer]
      });

      this.selectInteraction.on('select', (event: SelectEvent) => {
        const features = event.selected;
        if (features.length > 0) {
          const feature = features[0];
          const parcelle = feature.get('parcelle') as ParcelleAPI;
          this.selectedParcelle = parcelle;
          this.parcelleSelected.emit(parcelle);
        }
      });

      this.map.addInteraction(this.selectInteraction);
    }

    // Interaction de dessin
    if (this.options.enableDrawing) {
      this.drawInteraction = new Draw({
        source: this.drawingLayer.getSource()!,
        type: 'Polygon'
      });

      this.drawInteraction.on('drawend', (event: DrawEvent) => {
        const feature = event.feature;
        const geometry = feature.getGeometry();
        this.geometryDrawn.emit(geometry);
      });

      this.map.addInteraction(this.drawInteraction);
    }

    // Interaction de modification
    if (this.options.enableModify) {
      this.modifyInteraction = new Modify({
        source: this.parcelleLayer.getSource()!
      });

      this.map.addInteraction(this.modifyInteraction);
    }
  }

  private loadParcelles(): void {
    if (!this.parcelles || this.parcelles.length === 0) {
      return;
    }

    const features: Feature[] = [];
    
    this.parcelles.forEach(parcelle => {
      if (parcelle.geometry) {
        const feature = new Feature({
          geometry: new Polygon(parcelle.geometry.coordinates),
          parcelle: parcelle
        });
        features.push(feature);
      }
    });

    this.parcelleLayer.getSource()?.addFeatures(features);
  }

  private getParcelleStyle(feature: any): Style {
    const parcelle = feature.get('parcelle') as ParcelleAPI;
    
    // Couleurs selon le statut
    let fillColor = 'rgba(108, 117, 125, 0.3)'; // Gris par défaut
    let strokeColor = '#6c757d';
    
    switch (parcelle.etatValidation) {
      case 'Brouillon':
        fillColor = 'rgba(0, 123, 255, 0.3)'; // Bleu
        strokeColor = '#007bff';
        break;
      case 'Valide':
        fillColor = 'rgba(253, 126, 20, 0.3)'; // Orange
        strokeColor = '#fd7e14';
        break;
      case 'Publie':
        fillColor = 'rgba(40, 167, 69, 0.3)'; // Vert
        strokeColor = '#28a745';
        break;
      case 'Archive':
        fillColor = 'rgba(108, 117, 125, 0.3)'; // Gris
        strokeColor = '#6c757d';
        break;
    }

    return new Style({
      fill: new Fill({
        color: fillColor
      }),
      stroke: new Stroke({
        color: strokeColor,
        width: 2
      })
    });
  }

  // Méthodes publiques
  public toggleLayer(layer: ShapefileLayer): void {
    layer.visible = !layer.visible;
    const vectorLayer = this.loadedLayers[layer.name];
    if (vectorLayer) {
      vectorLayer.setVisible(layer.visible);
    }
  }

  public getStatusClass(statut: string): string {
    switch (statut) {
      case 'Brouillon': return 'badge-brouillon';
      case 'Valide': return 'badge-valide';
      case 'Publie': return 'badge-publie';
      case 'Archive': return 'badge-archive';
      default: return 'badge-secondary';
    }
  }

  public getStatusLabel(statut: string): string {
    switch (statut) {
      case 'Brouillon': return 'Brouillon';
      case 'Valide': return 'Validé';
      case 'Publie': return 'Publié';
      case 'Archive': return 'Archivé';
      default: return statut;
    }
  }

  public startDrawing(type: string): void {
    if (this.drawInteraction) {
      this.map.removeInteraction(this.drawInteraction);
    }

    this.currentTool = type;
    this.drawInteraction = new Draw({
      source: this.drawingLayer.getSource()!,
      type: type as any
    });

    this.drawInteraction.on('drawend', (event: DrawEvent) => {
      const feature = event.feature;
      const geometry = feature.getGeometry();
      this.geometryDrawn.emit(geometry);
    });

    this.map.addInteraction(this.drawInteraction);
  }

  public clearDrawing(): void {
    this.drawingLayer.getSource()?.clear();
    this.currentTool = '';
  }

  public viewParcelleDetails(): void {
    if (this.selectedParcelle) {
      // TODO: Naviguer vers la page de détails
      console.log('Voir détails de la parcelle:', this.selectedParcelle);
    }
  }

  public updateParcelles(parcelles: ParcelleAPI[]): void {
    this.parcelles = parcelles;
    this.parcelleLayer.getSource()?.clear();
    this.loadParcelles();
  }

  public fitToParcelles(): void {
    if (this.parcelles.length > 0) {
      const extent = this.parcelleLayer.getSource()?.getExtent();
      if (extent) {
        this.map.getView().fit(extent, { padding: [50, 50, 50, 50] });
      }
    }
  }
}