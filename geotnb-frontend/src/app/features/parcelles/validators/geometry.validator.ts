// =====================================================
// VALIDATOR GÉOMÉTRIE - VALIDATION GÉOSPATIALE
// =====================================================

import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export class GeometryValidator {

  // =====================================================
  // VALIDATEURS DE BASE
  // =====================================================

  /**
   * Valide qu'une géométrie est présente et valide
   */
  static required(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const geometry = control.value;
      
      if (!geometry) {
        return { geometryRequired: true };
      }

      if (!GeometryValidator.isValidGeometry(geometry)) {
        return { invalidGeometry: true };
      }

      return null;
    };
  }

  /**
   * Valide le type de géométrie
   */
  static geometryType(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const geometry = control.value;
      
      if (!geometry) return null;

      if (!allowedTypes.includes(geometry.type)) {
        return { 
          invalidGeometryType: { 
            actual: geometry.type, 
            allowed: allowedTypes 
          } 
        };
      }

      return null;
    };
  }

  // =====================================================
  // VALIDATEURS DE SURFACE
  // =====================================================

  /**
   * Valide la surface minimale d'un polygone
   */
  static minArea(minArea: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const geometry = control.value;
      
      if (!geometry || geometry.type !== 'Polygon') return null;

      const area = GeometryValidator.calculateArea(geometry);
      
      if (area < minArea) {
        return { 
          minArea: { 
            actual: area, 
            min: minArea 
          } 
        };
      }

      return null;
    };
  }

  /**
   * Valide la surface maximale d'un polygone
   */
  static maxArea(maxArea: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const geometry = control.value;
      
      if (!geometry || geometry.type !== 'Polygon') return null;

      const area = GeometryValidator.calculateArea(geometry);
      
      if (area > maxArea) {
            return {
          maxArea: { 
            actual: area, 
            max: maxArea 
          } 
        };
      }

      return null;
    };
  }

  // =====================================================
  // VALIDATEURS TOPOLOGIQUES
  // =====================================================

  /**
   * Valide qu'un polygone est simple (pas d'auto-intersection)
   */
  static simpleGeometry(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const geometry = control.value;
      
      if (!geometry) return null;

      if (!GeometryValidator.isSimpleGeometry(geometry)) {
        return { geometryNotSimple: true };
      }

      return null;
    };
  }

  /**
   * Valide qu'un polygone est valide topologiquement
   */
  static validTopology(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const geometry = control.value;
      
      if (!geometry) return null;

      const validationResult = GeometryValidator.validateTopology(geometry);
      
      if (!validationResult.valid) {
          return {
          invalidTopology: { 
            errors: validationResult.errors 
            }
          };
        }

        return null;
    };
  }

  // =====================================================
  // VALIDATEURS DE COORDONNÉES
  // =====================================================

  /**
   * Valide que les coordonnées sont dans une emprise donnée
   */
  static withinBounds(bounds: [number, number, number, number]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const geometry = control.value;
      
      if (!geometry) return null;

      const geometryBounds = GeometryValidator.getBounds(geometry);
      
      if (!geometryBounds) {
        return { invalidGeometryBounds: true };
      }

      const [minX, minY, maxX, maxY] = bounds;
      const [gMinX, gMinY, gMaxX, gMaxY] = geometryBounds;

      if (gMinX < minX || gMinY < minY || gMaxX > maxX || gMaxY > maxY) {
        return {
          geometryOutOfBounds: { 
            geometryBounds: geometryBounds,
            allowedBounds: bounds 
          }
        };
      }

      return null;
    };
  }

  /**
   * Valide le système de coordonnées
   */
  static coordinateSystem(expectedSRID: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const geometry = control.value;
      
      if (!geometry) return null;

      const srid = geometry.crs?.properties?.name || 4326; // WGS84 par défaut
      
      if (srid !== expectedSRID) {
        return { 
          invalidCoordinateSystem: { 
            actual: srid, 
            expected: expectedSRID 
          } 
        };
      }

      return null;
    };
  }

  // =====================================================
  // VALIDATEURS DE COMPLEXITÉ
  // =====================================================

  /**
   * Valide le nombre maximum de points
   */
  static maxVertices(maxVertices: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const geometry = control.value;
      
      if (!geometry) return null;

      const vertexCount = GeometryValidator.getVertexCount(geometry);
      
      if (vertexCount > maxVertices) {
        return { 
          tooManyVertices: { 
            actual: vertexCount, 
            max: maxVertices 
          } 
        };
    }

    return null;
    };
  }

  /**
   * Valide le nombre minimum de points
   */
  static minVertices(minVertices: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const geometry = control.value;
      
      if (!geometry) return null;

      const vertexCount = GeometryValidator.getVertexCount(geometry);
      
      if (vertexCount < minVertices) {
        return { 
          tooFewVertices: { 
            actual: vertexCount, 
            min: minVertices 
          } 
        };
    }

    return null;
    };
  }

  // =====================================================
  // MÉTHODES UTILITAIRES PRIVÉES
  // =====================================================

  /**
   * Vérifie si une géométrie est valide
   */
  private static isValidGeometry(geometry: any): boolean {
    if (!geometry || typeof geometry !== 'object') {
      return false;
    }

    if (!geometry.type) {
      return false;
    }

    switch (geometry.type) {
      case 'Point':
        return GeometryValidator.isValidPoint(geometry);
      case 'LineString':
        return GeometryValidator.isValidLineString(geometry);
      case 'Polygon':
        return GeometryValidator.isValidPolygon(geometry);
      case 'MultiPoint':
      case 'MultiLineString':
      case 'MultiPolygon':
        return GeometryValidator.isValidMultiGeometry(geometry);
      default:
        return false;
    }
  }

  private static isValidPoint(geometry: any): boolean {
    return Array.isArray(geometry.coordinates) && 
           geometry.coordinates.length >= 2 &&
           geometry.coordinates.every((coord: any) => typeof coord === 'number');
  }

  private static isValidLineString(geometry: any): boolean {
    return Array.isArray(geometry.coordinates) && 
           geometry.coordinates.length >= 2 &&
           geometry.coordinates.every((coord: any) => 
             Array.isArray(coord) && coord.length >= 2
           );
  }

  private static isValidPolygon(geometry: any): boolean {
    if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
      return false;
    }

    // Vérifier l'anneau extérieur
    const exteriorRing = geometry.coordinates[0];
    if (!Array.isArray(exteriorRing) || exteriorRing.length < 4) {
      return false;
    }

    // Vérifier que le polygone est fermé
    const firstPoint = exteriorRing[0];
    const lastPoint = exteriorRing[exteriorRing.length - 1];
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      return false;
    }

    return true;
  }

  private static isValidMultiGeometry(geometry: any): boolean {
    return Array.isArray(geometry.coordinates) && 
           geometry.coordinates.length > 0;
  }

  /**
   * Calcule la surface d'un polygone (approximation)
   */
  private static calculateArea(geometry: any): number {
    if (geometry.type !== 'Polygon') return 0;

    const coordinates = geometry.coordinates[0];
    if (!coordinates || coordinates.length < 3) return 0;

    // Formule du lacet (shoelace formula) - approximation pour coordonnées géographiques
    let area = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [x1, y1] = coordinates[i];
      const [x2, y2] = coordinates[i + 1];
      area += (x1 * y2) - (x2 * y1);
    }
    
    return Math.abs(area) / 2;
  }

  /**
   * Vérifie si une géométrie est simple (pas d'auto-intersection)
   */
  private static isSimpleGeometry(geometry: any): boolean {
    // Implémentation simplifiée - en réalité, utiliser une bibliothèque géométrique
    if (geometry.type === 'Polygon') {
      return GeometryValidator.isSimplePolygon(geometry);
    }
    return true; // Autres géométries considérées comme simples
  }

  private static isSimplePolygon(geometry: any): boolean {
    // Vérification basique d'auto-intersection
    const coordinates = geometry.coordinates[0];
    if (!coordinates || coordinates.length < 4) return false;

    // Vérifier qu'il n'y a pas de segments qui se croisent
    for (let i = 0; i < coordinates.length - 1; i++) {
      for (let j = i + 2; j < coordinates.length - 1; j++) {
        if (i === 0 && j === coordinates.length - 2) continue; // Skip first-last connection
        
        if (GeometryValidator.segmentsIntersect(
          coordinates[i], coordinates[i + 1],
          coordinates[j], coordinates[j + 1]
        )) {
          return false;
        }
      }
    }
    return true;
  }

  private static segmentsIntersect(p1: number[], p2: number[], p3: number[], p4: number[]): boolean {
    // Implémentation basique de détection d'intersection de segments
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    const [x3, y3] = p3;
    const [x4, y4] = p4;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) return false; // Segments parallèles

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  /**
   * Valide la topologie d'une géométrie
   */
  private static validateTopology(geometry: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (geometry.type === 'Polygon') {
      const coordinates = geometry.coordinates[0];
      
      // Vérifier la fermeture
      if (coordinates.length < 4) {
        errors.push('Le polygone doit avoir au moins 4 points');
      }

      const firstPoint = coordinates[0];
      const lastPoint = coordinates[coordinates.length - 1];
      if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
        errors.push('Le polygone doit être fermé');
      }

      // Vérifier l'auto-intersection
      if (!GeometryValidator.isSimplePolygon(geometry)) {
        errors.push('Le polygone ne doit pas avoir d\'auto-intersection');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcule les bounds d'une géométrie
   */
  private static getBounds(geometry: any): [number, number, number, number] | null {
      if (!geometry || !geometry.coordinates) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const processCoordinates = (coords: any) => {
      if (typeof coords[0] === 'number') {
        // Point
        minX = Math.min(minX, coords[0]);
        maxX = Math.max(maxX, coords[0]);
        minY = Math.min(minY, coords[1]);
        maxY = Math.max(maxY, coords[1]);
      } else {
        // Array de coordonnées
        coords.forEach((coord: any) => processCoordinates(coord));
      }
    };

    processCoordinates(geometry.coordinates);

    return [minX, minY, maxX, maxY];
  }

  /**
   * Compte le nombre de sommets d'une géométrie
   */
  private static getVertexCount(geometry: any): number {
    if (!geometry || !geometry.coordinates) return 0;

    const countVertices = (coords: any): number => {
      if (typeof coords[0] === 'number') {
        return 1; // Point
      }
      
      if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
        return coords.length; // LineString ou ring de Polygon
      }
      
      // Géométrie complexe
      return coords.reduce((total: number, coord: any) => total + countVertices(coord), 0);
    };

    return countVertices(geometry.coordinates);
  }

  // =====================================================
  // VALIDATEURS COMPOSÉS
  // =====================================================

  /**
   * Validateur complet pour une parcelle
   */
  static parcelleGeometry(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const geometry = control.value;
      
      if (!geometry) {
        return { geometryRequired: true };
      }

      // Combinaison de validations
      const validators = [
        GeometryValidator.geometryType(['Polygon']),
        GeometryValidator.minArea(1), // 1 m² minimum
        GeometryValidator.maxArea(1000000), // 100 hectares maximum
        GeometryValidator.minVertices(4),
        GeometryValidator.maxVertices(1000),
        GeometryValidator.simpleGeometry(),
        GeometryValidator.validTopology(),
        GeometryValidator.withinBounds([-20, 20, 10, 40]) // Bounds approximatifs du Maroc
      ];

      for (const validator of validators) {
        const error = validator(control);
        if (error) {
          return error;
        }
      }

      return null;
    };
  }
}