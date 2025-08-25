import { Injectable } from '@angular/core';
import * as proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import Projection from 'ol/proj/Projection';

export interface Coordinate {
  x: number;
  y: number;
  srid?: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  srid: number;
}

@Injectable({
  providedIn: 'root'
})
export class SpatialProjectionService {
  // Définition des SRID standards
  private readonly SRID_26191 = 26191; // Maroc (Merchich)
  private readonly SRID_4326 = 4326;   // WGS84 (GPS)
  private readonly SRID_3857 = 3857;   // Web Mercator
  
  constructor() {
    this.initializeProjections();
  }
  
  /**
   * Initialisation des projections Proj4 et OpenLayers
   */
  private initializeProjections(): void {
    // Définition de la projection EPSG:26191 (Maroc - Merchich)
    (proj4 as any).defs('EPSG:26191', 
      '+proj=lcc +lat_1=33.3 +lat_0=33.3 +lon_0=-5.4 +k_0=0.999625769 ' +
      '+x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 ' +
      '+towgs84=31,146,47,0,0,0,0 +units=m +no_defs'
    );

    // Définition des projections standards
    (proj4 as any).defs('EPSG:4326', (proj4 as any).defs('WGS84'));
    (proj4 as any).defs('EPSG:3857', (proj4 as any).defs('GOOGLE'));

    register(proj4 as any);
  }

  /**
   * Transformation de coordonnées entre systèmes de référence
   */
  transform(coordinates: number[], fromSrid: number, toSrid: number): number[] {
    try {
      const fromCode = `EPSG:${fromSrid}`;
      const toCode = `EPSG:${toSrid}`;

      if (!(proj4 as any).defs(fromCode) || !(proj4 as any).defs(toCode)) {
        throw new Error(`Projection non supportée: ${fromCode} ou ${toCode}`);
      }

      return (proj4 as any)(fromCode, toCode, coordinates);
    } catch (error) {
      console.error('Erreur de transformation de coordonnées:', error);
      throw error;
    }
  }

  /**
   * Conversion depuis le système marocain (EPSG:26191) vers WGS84 (EPSG:4326)
   */
  fromMarocToWGS84(x: number, y: number): number[] {
    return this.transform([x, y], this.SRID_26191, this.SRID_4326);
  }

  /**
   * Conversion depuis WGS84 (EPSG:4326) vers le système marocain (EPSG:26191)
   */
  fromWGS84ToMaroc(lon: number, lat: number): number[] {
    return this.transform([lon, lat], this.SRID_4326, this.SRID_26191);
  }

  /**
   * Conversion vers Web Mercator (pour OpenLayers)
   */
  toWebMercator(coordinates: number[], fromSrid: number = this.SRID_4326): number[] {
    return this.transform(coordinates, fromSrid, this.SRID_3857);
  }

  /**
   * Conversion depuis Web Mercator
   */
  fromWebMercator(coordinates: number[], toSrid: number = this.SRID_4326): number[] {
    return this.transform(coordinates, this.SRID_3857, toSrid);
  }

  /**
   * Vérification si une projection est supportée
   */
  isProjectionSupported(srid: number): boolean {
    return !!(proj4 as any).defs(`EPSG:${srid}`);
  }

  /**
   * Calcul de distance entre deux points (en mètres)
   */
  calculateDistance(coord1: number[], coord2: number[], srid: number = this.SRID_4326): number {
    try {
      const point1 = (proj4 as any)(`EPSG:${srid}`, 'EPSG:3857', coord1);
      const point2 = (proj4 as any)(`EPSG:${srid}`, 'EPSG:3857', coord2);
      
      const dx = point2[0] - point1[0];
      const dy = point2[1] - point1[1];
      
      return Math.sqrt(dx * dx + dy * dy);
    } catch (error) {
      console.error('Erreur dans le calcul de distance:', error);
      return 0;
    }
  }

  /**
   * Conversion de géométries GeoJSON entre systèmes de référence
   */
  transformGeoJSON(geojson: any, fromSrid: number, toSrid: number): any {
    const transformed = JSON.parse(JSON.stringify(geojson));
    
    const transformCoordinates = (coords: any[]): any[] => {
      if (Array.isArray(coords[0])) {
        return coords.map(coord => transformCoordinates(coord));
      } else {
        return this.transform(coords, fromSrid, toSrid);
      }
    };

    if (transformed.geometry) {
      transformed.geometry.coordinates = transformCoordinates(transformed.geometry.coordinates);
    } else if (transformed.coordinates) {
      transformed.coordinates = transformCoordinates(transformed.coordinates);
    }

    return transformed;
  }

  /**
   * Validation de coordonnées selon le SRID
   */
  validateCoordinates(coordinates: number[], srid: number): boolean {
    try {
    const [x, y] = coordinates;
    
    switch (srid) {
        case this.SRID_4326: // WGS84
          return x >= -180 && x <= 180 && y >= -90 && y <= 90;
      
        case this.SRID_26191: // Maroc
          return x >= -130000 && x <= 1300000 && y >= 3100000 && y <= 4300000;
      
      default:
          return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Getter des codes de projection
   */
  get projections() {
    return {
      maroc: this.SRID_26191,
      wgs84: this.SRID_4326,
      webMercator: this.SRID_3857
    };
  }

  /**
   * Formatage des coordonnées pour l'affichage
   */
  formatCoordinates(coordinates: number[], format: 'dms' | 'decimal' = 'decimal', precision: number = 6): string {
    const [lon, lat] = coordinates;
    
    if (format === 'dms') {
      return this.decimalToDMS(lat, lon, precision);
    }
    
    return `${lat.toFixed(precision)}, ${lon.toFixed(precision)}`;
  }

  /**
   * Conversion décimal vers Degrees Minutes Seconds
   */
  private decimalToDMS(lat: number, lon: number, precision: number): string {
    const formatDMS = (deg: number, isLat: boolean): string => {
      const absDeg = Math.abs(deg);
      const degrees = Math.floor(absDeg);
      const minutes = Math.floor((absDeg - degrees) * 60);
      const seconds = ((absDeg - degrees - minutes / 60) * 3600).toFixed(precision);
      
      const direction = isLat 
        ? (deg >= 0 ? 'N' : 'S')
        : (deg >= 0 ? 'E' : 'W');
      
      return `${degrees}°${minutes}'${seconds}"${direction}`;
    };

    return `${formatDMS(lat, true)} ${formatDMS(lon, false)}`;
  }
}