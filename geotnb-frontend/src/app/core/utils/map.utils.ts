import { Feature, FeatureCollection, Geometry } from '../models/interfaces/geometry.interface';

export enum GeometryType {
  POINT = 'Point',
  LINE = 'LineString',
  POLYGON = 'Polygon',
  MULTIPOINT = 'MultiPoint',
  MULTILINE = 'MultiLineString',
  MULTIPOLYGON = 'MultiPolygon',
  GEOMETRYCOLLECTION = 'GeometryCollection'
}

export class MapUtils {
  static readonly DEFAULT_ZOOM = 12;
  static readonly DEFAULT_CENTER = [517000, 377000]; // Centre approximatif d'Oujda en Lambert Maroc Nord
  static readonly MIN_ZOOM = 8;
  static readonly MAX_ZOOM = 20;

  /**
   * Convertit des coordonnées GeoJSON en format OpenLayers
   */
  static convertGeoJSONToOL(geojson: any): any {
    // Cette fonction dépendra de la bibliothèque OpenLayers utilisée
    return geojson;
  }

  /**
   * Calcule le zoom optimal pour afficher une bbox
   */
  static calculateOptimalZoom(bbox: [number, number, number, number], mapSize: [number, number]): number {
    const [minX, minY, maxX, maxY] = bbox;
    const [width, height] = mapSize;
    
    const bboxWidth = maxX - minX;
    const bboxHeight = maxY - minY;
    
    const zoomX = Math.log2(width / bboxWidth);
    const zoomY = Math.log2(height / bboxHeight);
    
    return Math.min(zoomX, zoomY, MapUtils.MAX_ZOOM);
  }

  /**
   * Crée une feature GeoJSON à partir de coordonnées
   */
  static createFeature(coordinates: number[][], properties: any = {}): Feature {
    return {
      type: 'Feature',
      geometry: {
        type: GeometryType.POLYGON as any,
        coordinates: [coordinates]
      },
      properties
    };
  }
  /**
   * Crée une FeatureCollection
   */
  static createFeatureCollection(features: Feature[]): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Style par défaut pour les parcelles
   */
  static getDefaultParcelleStyle(statut?: string) {
    const styles: { [key: string]: any } = {
      'Brouillon': { color: '#gray', opacity: 0.7 },
      'En_attente': { color: '#orange', opacity: 0.8 },
      'Valide': { color: '#green', opacity: 0.8 },
      'Rejete': { color: '#red', opacity: 0.8 },
      'Publie': { color: '#blue', opacity: 0.9 }
    };
    
    return styles[statut || 'default'] || { color: '#blue', opacity: 0.7 };
  }
}