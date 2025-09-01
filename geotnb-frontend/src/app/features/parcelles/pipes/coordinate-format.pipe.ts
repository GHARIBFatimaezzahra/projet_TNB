// =====================================================
// PIPE FORMATAGE COORDONNÉES - Lambert ↔ WGS84
// =====================================================

import { Pipe, PipeTransform } from '@angular/core';

export type CoordinateSystem = 'WGS84' | 'Lambert' | 'UTM' | 'DMS';
export type CoordinateFormat = 'decimal' | 'dms' | 'utm' | 'lambert';

@Pipe({
  name: 'coordinateFormat',
  standalone: true
})
export class CoordinateFormatPipe implements PipeTransform {

  /**
   * Formate des coordonnées selon le système spécifié
   * @param value - Coordonnées [longitude, latitude] ou [x, y]
   * @param fromSystem - Système source
   * @param toFormat - Format de sortie
   * @param precision - Nombre de décimales
   */
  transform(
    value: [number, number] | null | undefined,
    fromSystem: CoordinateSystem = 'WGS84',
    toFormat: CoordinateFormat = 'decimal',
    precision: number = 6
  ): string {
    
    if (!value || !Array.isArray(value) || value.length !== 2) {
      return '';
    }

    const [x, y] = value;
    
    if (isNaN(x) || isNaN(y)) {
      return '';
    }

    switch (toFormat) {
      case 'decimal':
        return this.formatDecimal(x, y, precision);
        
      case 'dms':
        return this.formatDMS(x, y);
        
      case 'utm':
        return this.formatUTM(x, y, fromSystem);
        
      case 'lambert':
        return this.formatLambert(x, y, fromSystem);
        
      default:
        return this.formatDecimal(x, y, precision);
    }
  }

  /**
   * Formate en degrés décimaux
   */
  private formatDecimal(lon: number, lat: number, precision: number): string {
    const lonStr = lon.toFixed(precision);
    const latStr = lat.toFixed(precision);
    return `${lonStr}°, ${latStr}°`;
  }

  /**
   * Formate en degrés, minutes, secondes
   */
  private formatDMS(lon: number, lat: number): string {
    const lonDMS = this.decimalToDMS(lon, 'longitude');
    const latDMS = this.decimalToDMS(lat, 'latitude');
    return `${lonDMS}, ${latDMS}`;
  }

  /**
   * Formate en UTM (simulation)
   */
  private formatUTM(x: number, y: number, fromSystem: CoordinateSystem): string {
    // Simulation - dans un vrai projet, utiliser une bibliothèque comme proj4js
    if (fromSystem === 'WGS84') {
      // Approximation pour le Maroc (Zone UTM 29N/30N)
      const zone = x < -6 ? '29N' : '30N';
      const easting = Math.round(x * 111320 + 500000);
      const northing = Math.round(y * 110540 + 3000000);
      return `${zone}: ${easting}E, ${northing}N`;
    }
    
    return `UTM: ${Math.round(x)}E, ${Math.round(y)}N`;
  }

  /**
   * Formate en Lambert (projection conique conforme du Maroc)
   */
  private formatLambert(x: number, y: number, fromSystem: CoordinateSystem): string {
    // Simulation de la projection Lambert Maroc
    if (fromSystem === 'WGS84') {
      // Conversion approximative WGS84 -> Lambert Maroc
      const lambertX = Math.round((x + 5.0) * 100000 + 500000);
      const lambertY = Math.round((y - 29.0) * 100000 + 300000);
      return `Lambert: ${lambertX}, ${lambertY}`;
    }
    
    return `Lambert: ${Math.round(x)}, ${Math.round(y)}`;
  }

  /**
   * Convertit degrés décimaux en DMS
   */
  private decimalToDMS(decimal: number, type: 'longitude' | 'latitude'): string {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = Math.round((minutesFloat - minutes) * 60);
    
    let direction: string;
    if (type === 'longitude') {
      direction = decimal >= 0 ? 'E' : 'O';
    } else {
      direction = decimal >= 0 ? 'N' : 'S';
    }
    
    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  }
}

// Utilitaires pour coordonnées
export class CoordinateUtils {
  
  /**
   * Valide des coordonnées WGS84
   */
  static isValidWGS84(lon: number, lat: number): boolean {
    return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
  }
  
  /**
   * Valide des coordonnées pour le Maroc
   */
  static isValidMorocco(lon: number, lat: number): boolean {
    // Bounds approximatifs du Maroc
    return lon >= -17.5 && lon <= -0.5 && lat >= 20.5 && lat <= 36.0;
  }
  
  /**
   * Calcule la distance entre deux points (formule de Haversine)
   */
  static calculateDistance(
    point1: [number, number], 
    point2: [number, number]
  ): number {
    const [lon1, lat1] = point1;
    const [lon2, lat2] = point2;
    
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }
  
  /**
   * Convertit degrés en radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Convertit radians en degrés
   */
  static toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }
  
  /**
   * Parse des coordonnées depuis une chaîne
   */
  static parseCoordinates(coordString: string): [number, number] | null {
    if (!coordString) return null;
    
    // Nettoyer la chaîne
    const cleaned = coordString.replace(/[°'"NSEO]/g, '').trim();
    
    // Patterns possibles
    const patterns = [
      /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/, // "lon, lat" ou "lon lat"
      /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/, // Décimal simple
    ];
    
    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        const lon = parseFloat(match[1]);
        const lat = parseFloat(match[2]);
        
        if (!isNaN(lon) && !isNaN(lat)) {
          return [lon, lat];
        }
      }
    }
    
    return null;
  }
  
  /**
   * Formate des coordonnées pour l'export
   */
  static formatForExport(
    coordinates: [number, number], 
    format: 'WKT' | 'GeoJSON' | 'CSV' = 'CSV'
  ): string {
    const [lon, lat] = coordinates;
    
    switch (format) {
      case 'WKT':
        return `POINT(${lon} ${lat})`;
        
      case 'GeoJSON':
        return JSON.stringify({
          type: 'Point',
          coordinates: [lon, lat]
        });
        
      case 'CSV':
      default:
        return `${lon},${lat}`;
    }
  }
  
  /**
   * Calcule le centre d'un ensemble de points
   */
  static calculateCenter(points: [number, number][]): [number, number] {
    if (points.length === 0) return [0, 0];
    
    const sum = points.reduce(
      (acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat],
      [0, 0]
    );
    
    return [sum[0] / points.length, sum[1] / points.length];
  }
  
  /**
   * Calcule les bounds d'un ensemble de points
   */
  static calculateBounds(points: [number, number][]): {
    minLon: number;
    minLat: number;
    maxLon: number;
    maxLat: number;
  } | null {
    if (points.length === 0) return null;
    
    let minLon = points[0][0];
    let maxLon = points[0][0];
    let minLat = points[0][1];
    let maxLat = points[0][1];
    
    points.forEach(([lon, lat]) => {
      minLon = Math.min(minLon, lon);
      maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });
    
    return { minLon, minLat, maxLon, maxLat };
  }
  
  /**
   * Vérifie si un point est dans une bbox
   */
  static isPointInBounds(
    point: [number, number],
    bounds: { minLon: number; minLat: number; maxLon: number; maxLat: number }
  ): boolean {
    const [lon, lat] = point;
    return lon >= bounds.minLon && lon <= bounds.maxLon && 
           lat >= bounds.minLat && lat <= bounds.maxLat;
  }
  
  /**
   * Génère des coordonnées aléatoires dans les bounds du Maroc
   */
  static generateRandomMoroccoCoordinates(): [number, number] {
    const minLon = -17.0;
    const maxLon = -1.0;
    const minLat = 21.0;
    const maxLat = 36.0;
    
    const lon = minLon + Math.random() * (maxLon - minLon);
    const lat = minLat + Math.random() * (maxLat - minLat);
    
    return [lon, lat];
  }
}