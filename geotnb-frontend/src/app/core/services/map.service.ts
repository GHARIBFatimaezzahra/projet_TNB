// =====================================================
// SERVICE CARTOGRAPHIQUE OPENLAYERS - COMMUNE D'OUJDA
// =====================================================

import { Injectable } from '@angular/core';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, transform } from 'ol/proj';
import { Draw, Modify, Select } from 'ol/interaction';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import { Feature } from 'ol';
import { Polygon, Point } from 'ol/geom';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MapConfig {
  center: [number, number]; // [longitude, latitude]
  zoom: number;
  projection: string;
}

export interface ParcelleGeometry {
  id?: number;
  coordinates: number[][];
  surface: number;
  perimeter: number;
  properties?: any;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {

  // =====================================================
  // PROPRIÉTÉS
  // =====================================================

  private map!: Map;
  private vectorSource = new VectorSource();
  private vectorLayer!: VectorLayer<VectorSource>;
  private drawInteraction!: Draw;
  private modifyInteraction!: Modify;
  private selectInteraction!: Select;

  // Configuration pour Oujda, Maroc
  private readonly OUJDA_CONFIG: MapConfig = {
    center: [-2.0372, 34.6814], // Oujda coordinates
    zoom: 13,
    projection: 'EPSG:3857'
  };

  // Observables pour les événements
  private parcelleDrawn$ = new BehaviorSubject<ParcelleGeometry | null>(null);
  private parcelleSelected$ = new BehaviorSubject<ParcelleGeometry | null>(null);

  // =====================================================
  // INITIALISATION
  // =====================================================

  constructor() {
    this.initializeVectorLayer();
  }

  private initializeVectorLayer(): void {
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: this.getParcelleStyle()
    });
  }

  // =====================================================
  // CRÉATION ET CONFIGURATION DE LA CARTE
  // =====================================================

  createMap(targetElement: string | HTMLElement): Map {
    // Couches de base
    const osmLayer = new TileLayer({
      source: new OSM(),
      visible: true
    });

    // Couche orthophoto (optionnelle)
    const orthophotoLayer = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        crossOrigin: 'anonymous'
      }),
      visible: false
    });

    // Vue centrée sur Oujda
    const view = new View({
      center: fromLonLat(this.OUJDA_CONFIG.center),
      zoom: this.OUJDA_CONFIG.zoom,
      projection: this.OUJDA_CONFIG.projection
    });

    // Création de la carte
    this.map = new Map({
      target: targetElement,
      layers: [
        osmLayer,
        orthophotoLayer,
        this.vectorLayer
      ],
      view: view,
      controls: []
    });

    this.initializeInteractions();
    return this.map;
  }

  // =====================================================
  // INTERACTIONS DE DESSIN
  // =====================================================

  private initializeInteractions(): void {
    // Interaction de sélection
    this.selectInteraction = new Select({
      layers: [this.vectorLayer]
    });

    // Interaction de modification
    this.modifyInteraction = new Modify({
      source: this.vectorSource
    });

    // Événements
    this.selectInteraction.on('select', (event) => {
      const selected = event.selected[0];
      if (selected) {
        const geometry = this.featureToParcelleGeometry(selected);
        this.parcelleSelected$.next(geometry);
      } else {
        this.parcelleSelected$.next(null);
      }
    });

    this.modifyInteraction.on('modifyend', (event) => {
      const feature = event.features.getArray()[0];
      if (feature) {
        const geometry = this.featureToParcelleGeometry(feature);
        this.parcelleDrawn$.next(geometry);
      }
    });
  }

  // =====================================================
  // OUTILS DE DESSIN
  // =====================================================

  activateDrawPolygon(): void {
    this.clearInteractions();
    
    this.drawInteraction = new Draw({
      source: this.vectorSource,
      type: 'Polygon',
      style: this.getDrawingStyle()
    });

    this.drawInteraction.on('drawend', (event) => {
      const feature = event.feature;
      const geometry = this.featureToParcelleGeometry(feature);
      this.parcelleDrawn$.next(geometry);
    });

    this.map.addInteraction(this.drawInteraction);
  }

  activateSelect(): void {
    this.clearInteractions();
    this.map.addInteraction(this.selectInteraction);
  }

  activateModify(): void {
    this.clearInteractions();
    this.map.addInteraction(this.selectInteraction);
    this.map.addInteraction(this.modifyInteraction);
  }

  clearInteractions(): void {
    if (this.drawInteraction) {
      this.map.removeInteraction(this.drawInteraction);
    }
    if (this.selectInteraction) {
      this.map.removeInteraction(this.selectInteraction);
    }
    if (this.modifyInteraction) {
      this.map.removeInteraction(this.modifyInteraction);
    }
  }

  // =====================================================
  // GESTION DES PARCELLES
  // =====================================================

  addParcelle(geometry: ParcelleGeometry): void {
    const coordinates = geometry.coordinates.map(coord => 
      fromLonLat([coord[0], coord[1]])
    );
    
    const polygon = new Polygon([coordinates]);
    const feature = new Feature({ geometry: polygon });
    
    feature.setProperties({
      id: geometry.id,
      surface: geometry.surface,
      perimeter: geometry.perimeter,
      ...geometry.properties
    });

    this.vectorSource.addFeature(feature);
  }

  removeParcelle(id: number): void {
    const features = this.vectorSource.getFeatures();
    const feature = features.find(f => f.get('id') === id);
    if (feature) {
      this.vectorSource.removeFeature(feature);
    }
  }

  clearParcelles(): void {
    this.vectorSource.clear();
  }

  zoomToParcelle(id: number): void {
    const features = this.vectorSource.getFeatures();
    const feature = features.find(f => f.get('id') === id);
    if (feature) {
      const extent = feature.getGeometry()!.getExtent();
      this.map.getView().fit(extent, { padding: [50, 50, 50, 50] });
    }
  }

  // =====================================================
  // COUCHES DE FOND
  // =====================================================

  toggleOrthophoto(visible: boolean): void {
    const layers = this.map.getLayers().getArray();
    const orthophotoLayer = layers[1] as TileLayer<XYZ>; // Index 1 = orthophoto
    orthophotoLayer.setVisible(visible);
  }

  toggleOSM(visible: boolean): void {
    const layers = this.map.getLayers().getArray();
    const osmLayer = layers[0] as TileLayer<OSM>; // Index 0 = OSM
    osmLayer.setVisible(visible);
  }

  // =====================================================
  // STYLES
  // =====================================================

  private getParcelleStyle(): Style {
    return new Style({
      fill: new Fill({
        color: 'rgba(99, 102, 241, 0.2)'
      }),
      stroke: new Stroke({
        color: '#6366f1',
        width: 2
      })
    });
  }

  private getDrawingStyle(): Style {
    return new Style({
      fill: new Fill({
        color: 'rgba(255, 152, 0, 0.2)'
      }),
      stroke: new Stroke({
        color: '#ff9800',
        width: 2,
        lineDash: [5, 5]
      }),
      image: new Circle({
        radius: 5,
        fill: new Fill({
          color: '#ff9800'
        })
      })
    });
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  private featureToParcelleGeometry(feature: Feature): ParcelleGeometry {
    const geometry = feature.getGeometry() as Polygon;
    const coordinates = geometry.getCoordinates()[0].map(coord =>
      transform(coord, this.OUJDA_CONFIG.projection, 'EPSG:4326')
    );

    // Calculs de surface et périmètre (approximatifs)
    const surface = this.calculateArea(coordinates);
    const perimeter = this.calculatePerimeter(coordinates);

    return {
      id: feature.get('id'),
      coordinates: coordinates,
      surface: surface,
      perimeter: perimeter,
      properties: feature.getProperties()
    };
  }

  private calculateArea(coordinates: number[][]): number {
    // Formule de Shoelace pour calculer l'aire
    let area = 0;
    const n = coordinates.length;
    
    for (let i = 0; i < n - 1; i++) {
      area += coordinates[i][0] * coordinates[i + 1][1];
      area -= coordinates[i + 1][0] * coordinates[i][1];
    }
    
    return Math.abs(area) / 2 * 111320 * 111320; // Approximation en m²
  }

  private calculatePerimeter(coordinates: number[][]): number {
    let perimeter = 0;
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      const dx = coordinates[i + 1][0] - coordinates[i][0];
      const dy = coordinates[i + 1][1] - coordinates[i][1];
      perimeter += Math.sqrt(dx * dx + dy * dy) * 111320; // Approximation en mètres
    }
    
    return perimeter;
  }

  // =====================================================
  // OBSERVABLES
  // =====================================================

  getParcelleDrawn(): Observable<ParcelleGeometry | null> {
    return this.parcelleDrawn$.asObservable();
  }

  getParcelleSelected(): Observable<ParcelleGeometry | null> {
    return this.parcelleSelected$.asObservable();
  }

  // =====================================================
  // NETTOYAGE
  // =====================================================

  destroy(): void {
    this.clearInteractions();
    if (this.map) {
      this.map.setTarget(undefined);
    }
  }
}
