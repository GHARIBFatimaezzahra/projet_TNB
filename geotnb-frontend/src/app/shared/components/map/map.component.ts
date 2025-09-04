import { Component, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import { XYZ } from 'ol/source';
import { TileGrid } from 'ol/tilegrid';
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
import GeoJSON from 'ol/format/GeoJSON';

// ArcGIS Online API Key
const ARCGIS_API_KEY = "AAPTxy8BH1VEsoebNVZXo8HurOSE9hKbMgk3NnyJSolFXjbhcEX0Y2DiHVwgEXLwyDPhDRJoKSzMQfIF9P2j2Il7rIbcsReg902LKml_ysfPz7P0FNBf1RRp6ZlULPMhOJY_lMIFfLtqWHT6plbwOgaJal3-yaPbElwyjVMz2A3gqljYNBZ9c8oDSq9O1E0GP0_QvtmbFWD-nPtVMKpV_sRNa4GMFNba8ieQbBi-iH35HIsAV68T7K9q43tJ2jOu2AvgAT1_OGou6MIV";

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
  imports: [
    CommonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './map.component.html',
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
  
  // Propriétés d'état
  public isLoading: boolean = false;
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
  
  // Les couches shapefile locales ont été remplacées par les couches ArcGIS

  // Parcelle sélectionnée
  public selectedParcelle: ParcelleAPI | null = null;

  // Coordonnées de Casablanca (version qui fonctionnait)
  private readonly CASABLANCA_CENTER: [number, number] = [-7.6114, 33.5731]; // Longitude, Latitude (WGS84)
  private readonly CASABLANCA_CENTER_26191: [number, number] = [-842000, 3950000]; // X, Y en EPSG:26191 (Merchich/Nord Maroc)
  private readonly DEFAULT_ZOOM = 10; // Zoom plus large pour voir toute la région de Casablanca

  // Couches shapefile chargées (Map des couches vectorielles)
  private loadedLayers: { [key: string]: VectorLayer<VectorSource> } = {};
  
  // Propriétés pour les calculs de géométrie
  public calculatedSurface: number = 0;
  public calculatedPerimeter: number = 0;
  public calculatedPoints: number = 0;

  constructor(private http: HttpClient) {
    // Configurer la projection EPSG:26191 (Merchich/Nord Maroc)
    this.setupProjection();
  }

  private setupProjection(): void {
    // Définir la projection EPSG:26191 (Merchich/Nord Maroc)
    proj4.defs('EPSG:26191', '+proj=tmerc +lat_0=33.3 +lon_0=-7.5 +k=0.999625769 +x_0=500000 +y_0=300000 +ellps=clrk80 +towgs84=-31,146,47,0,0,0,0 +units=m +no_defs');
    
    // Enregistrer la projection avec OpenLayers
    register(proj4);
    
    // Ajouter la projection à OpenLayers
    const projection = getProjection('EPSG:26191');
    if (projection) {
      addProjection(projection);
      console.log('✅ Projection EPSG:26191 configurée avec succès');
    } else {
      console.warn('⚠️ Impossible de configurer la projection EPSG:26191');
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
          // Couche de base ArcGIS Online avec API key
          new TileLayer({
            source: new XYZ({
              url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=YOUR_API_KEY',
              crossOrigin: 'anonymous'
            }),
            visible: true
          })
        ],
        view: new View({
          center: fromLonLat(this.CASABLANCA_CENTER), // Convertir WGS84 vers Web Mercator
          zoom: this.options.zoom || this.DEFAULT_ZOOM,
          projection: 'EPSG:3857' // Web Mercator pour OpenStreetMap
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
      
      // S'assurer que la carte est centrée sur Casablanca
      setTimeout(() => {
        if (this.map) {
          const casablancaCenter = fromLonLat(this.CASABLANCA_CENTER);
          this.map.getView().setCenter(casablancaCenter);
          this.map.getView().setZoom(11); // Zoom optimal pour voir Casablanca
          console.log('🗺️ Map centered on Casablanca (WGS84):', casablancaCenter);
          console.log('🗺️ Map projection:', this.map.getView().getProjection().getCode());
          
          // Forcer un refresh de la vue
          setTimeout(() => {
            this.map.getView().setCenter(casablancaCenter);
            this.map.getView().setZoom(11);
            console.log('🗺️ Map view refreshed with projection EPSG:3857');
          }, 500);
        }
      }, 1000);
      
      console.log('Map initialization completed');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private initializeBaseLayer(): void {
    // Ajouter les couches ArcGIS Online
    this.addArcGISLayers();
  }

  private addArcGISLayers(): void {
    console.log('🗺️ Ajout des couches ArcGIS...');
    
    // 1. Couche des Communes (visible par défaut)
    const communesLayer = new VectorLayer({
      source: new VectorSource({
        url: `https://services5.arcgis.com/MihR3tFxJ3v2wyRZ/arcgis/rest/services/communes_wgs/FeatureServer/0/query?where=1%3D1&outFields=PREFECTURE,COMMUNE_AR,Shape_Area&f=geojson&token=${ARCGIS_API_KEY}`,
        format: new GeoJSON()
      }),
      style: new Style({
        fill: new Fill({
          color: 'rgba(0, 123, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: '#007bff',
          width: 2
        })
      }),
      visible: true
    });
    this.map.addLayer(communesLayer);
    this.loadedLayers['communes'] = communesLayer;
    console.log('✅ Couche Communes ajoutée');

    // 2. Couche des Hôtels
    const hotelsLayer = new VectorLayer({
      source: new VectorSource({
        url: `https://services5.arcgis.com/MihR3tFxJ3v2wyRZ/arcgis/rest/services/Hotels_wgs/FeatureServer/0/query?where=1%3D1&outFields=CATÉGORIE,ADRESSE,HOTEL&f=geojson&token=${ARCGIS_API_KEY}`,
        format: new GeoJSON()
      }),
      style: new Style({
        image: new Circle({
          radius: 12,
          fill: new Fill({ color: 'orange' }),
          stroke: new Stroke({ color: 'white', width: 2 })
        })
      }),
      visible: true // Rendre visible par défaut
    });
    this.map.addLayer(hotelsLayer);
    this.loadedLayers['hotels'] = hotelsLayer;
    console.log('✅ Couche Hôtels ajoutée et visible');

    // 3. Couche des Grandes Surfaces
    const largeSurfaceLayer = new VectorLayer({
      source: new VectorSource({
        url: `https://services5.arcgis.com/MihR3tFxJ3v2wyRZ/arcgis/rest/services/Grande_surface_wgs_shp/FeatureServer/0/query?where=1%3D1&outFields=Adresse,Type&f=geojson&token=${ARCGIS_API_KEY}`,
        format: new GeoJSON()
      }),
      style: new Style({
        image: new Circle({
          radius: 15,
          fill: new Fill({ color: 'blue' }),
          stroke: new Stroke({ color: 'white', width: 2 })
        })
      }),
      visible: true // Rendre visible par défaut
    });
    this.map.addLayer(largeSurfaceLayer);
    this.loadedLayers['grandes_surfaces'] = largeSurfaceLayer;
    console.log('✅ Couche Grandes Surfaces ajoutée et visible');

    // 4. Couche de Voirie
    const voirieLayer = new VectorLayer({
      source: new VectorSource({
        url: `https://services5.arcgis.com/MihR3tFxJ3v2wyRZ/arcgis/rest/services/voirie_casa_1/FeatureServer/0/query?where=1%3D1&outFields=NOM,LENGTH&f=geojson&token=${ARCGIS_API_KEY}`,
        format: new GeoJSON()
      }),
      style: new Style({
        stroke: new Stroke({
          color: 'purple',
          width: 2
        })
      }),
      visible: true // Rendre visible par défaut
    });
    this.map.addLayer(voirieLayer);
    this.loadedLayers['voirie'] = voirieLayer;
    console.log('✅ Couche Voirie ajoutée et visible');
    
    console.log('🗺️ Toutes les couches ArcGIS ont été ajoutées:', Object.keys(this.loadedLayers));
  }

  // Méthode pour changer le fond de carte ArcGIS
  public changeBasemap(basemapType: string): void {
    if (!this.map) return;

    // Supprimer toutes les couches de base existantes
    const layers = this.map.getLayers().getArray();
    layers.forEach(layer => {
      if (layer instanceof TileLayer) {
        this.map.removeLayer(layer);
      }
    });

    // Ajouter le nouveau fond de carte
    let newBasemapLayer: TileLayer;
    
    switch (basemapType) {
      case 'arcgis-topographic':
        newBasemapLayer = new TileLayer({
          source: new XYZ({
            url: `https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}?token=${ARCGIS_API_KEY}`,
            crossOrigin: 'anonymous'
          })
        });
        break;
      case 'arcgis-imagery':
        newBasemapLayer = new TileLayer({
          source: new XYZ({
            url: `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=${ARCGIS_API_KEY}`,
            crossOrigin: 'anonymous'
          })
        });
        break;
      case 'arcgis-streets':
        newBasemapLayer = new TileLayer({
          source: new XYZ({
            url: `https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}?token=${ARCGIS_API_KEY}`,
            crossOrigin: 'anonymous'
          })
        });
        break;
      case 'arcgis-navigation':
        newBasemapLayer = new TileLayer({
          source: new XYZ({
            url: `https://services.arcgisonline.com/ArcGIS/rest/services/World_Navigation_Charts/MapServer/tile/{z}/{y}/{x}?token=${ARCGIS_API_KEY}`,
            crossOrigin: 'anonymous'
          })
        });
        break;
      default:
        // Retour à OpenStreetMap par défaut
        newBasemapLayer = new TileLayer({
          source: new OSM({
            crossOrigin: 'anonymous'
          })
        });
    }

    // Ajouter le nouveau fond de carte en première position
    this.map.getLayers().insertAt(0, newBasemapLayer);
    console.log(`🗺️ Fond de carte changé vers: ${basemapType}`);
  }

  // Méthode pour basculer les couches ArcGIS
  public toggleArcGISLayer(layerName: string, event: any): void {
    const layer = this.loadedLayers[layerName];
    if (layer) {
      layer.setVisible(event.target.checked);
      console.log(`🗺️ Couche ${layerName} ${event.target.checked ? 'activée' : 'désactivée'}`);
    }
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
    // Les couches GeoJSON locales sont remplacées par les couches ArcGIS
    // Plus besoin de charger les shapefiles locaux
    console.log('🗺️ Couches GeoJSON locales désactivées - utilisation des couches ArcGIS uniquement');
  }

  // Méthode supprimée - remplacée par les couches ArcGIS

  // Méthode supprimée - styles gérés par les couches ArcGIS

  // Méthode supprimée - remplacée par les couches ArcGIS

  // Méthode supprimée - GPKG non utilisé avec ArcGIS

  // Méthodes supprimées - conversion gérée par les couches ArcGIS

  // Méthode supprimée - conversion gérée par les couches ArcGIS

  // Méthodes supprimées - conversion gérée par les couches ArcGIS



  // Méthode supprimée - données de démonstration non nécessaires avec ArcGIS

  private initializeInteractions(): void {
    // Interaction de sélection
    if (this.options?.enableSelection) {
      this.selectInteraction = new Select({
        style: new Style({
          fill: new Fill({ color: 'rgba(255, 255, 0, 0.3)' }),
          stroke: new Stroke({ color: '#ffcc00', width: 2 })
        })
      });

      this.selectInteraction.on('select', (event: SelectEvent) => {
        const features = event.selected;
        if (features.length > 0) {
          const feature = features[0];
          console.log('Feature selected:', feature);
        }
      });

      this.map.addInteraction(this.selectInteraction);
    }

    // Interaction de dessin
    if (this.options?.enableDrawing) {
      this.drawInteraction = new Draw({
        source: this.drawingLayer.getSource()!,
        type: 'Polygon',
        style: new Style({
          fill: new Fill({ color: 'rgba(0, 255, 0, 0.3)' }),
          stroke: new Stroke({ color: '#00ff00', width: 2 })
        })
      });

      this.drawInteraction.on('drawend', (event: DrawEvent) => {
        const feature = event.feature;
        const geometry = feature.getGeometry();
        if (geometry) {
          this.geometryDrawn.emit(geometry);
        }
      });

      this.map.addInteraction(this.drawInteraction);
    }

    // Interaction de modification
    if (this.options?.enableModify && this.selectInteraction) {
      this.modifyInteraction = new Modify({
        features: this.selectInteraction.getFeatures()
      });

      this.modifyInteraction.on('modifyend', (event: any) => {
        const features = event.features.getArray();
        if (features.length > 0) {
          const feature = features[0];
          const geometry = feature.getGeometry();
          if (geometry) {
            this.geometryDrawn.emit(geometry);
          }
        }
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