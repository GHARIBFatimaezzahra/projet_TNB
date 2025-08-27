// =====================================================
// VALIDATORS SURFACE - VALIDATION SURFACES PARCELLES
// =====================================================

import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export class SurfaceValidator {
  
  /**
   * Valide qu'une surface est positive
   */
  static positive(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return null; // Laisser 'required' gérer les champs obligatoires
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue <= 0) {
      return { surfacePositive: { value, message: 'La surface doit être positive' } };
    }
    
    return null;
  }
  
  /**
   * Valide qu'une surface est dans une plage acceptable
   */
  static range(min: number = 0, max: number = 1000000): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (value === null || value === undefined || value === '') {
        return null;
      }
      
      const numValue = parseFloat(value);
      
      if (isNaN(numValue)) {
        return { surfaceInvalid: { value, message: 'Surface invalide' } };
      }
      
      if (numValue < min) {
        return { 
          surfaceMin: { 
            value, 
            min, 
            message: `Surface minimum: ${min} m²` 
          } 
        };
      }
      
      if (numValue > max) {
        return { 
          surfaceMax: { 
            value, 
            max, 
            message: `Surface maximum: ${max} m²` 
          } 
        };
      }
      
      return null;
    };
  }
  
  /**
   * Valide le format d'une surface (nombre décimal)
   */
  static format(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    // Accepter nombres entiers et décimaux
    const surfacePattern = /^\d+(\.\d{1,4})?$/;
    
    if (!surfacePattern.test(value.toString())) {
      return { 
        surfaceFormat: { 
          value, 
          message: 'Format invalide (ex: 1500 ou 1500.50)' 
        } 
      };
    }
    
    return null;
  }
  
  /**
   * Valide la cohérence entre surface totale et surface imposable
   */
  static coherence(group: FormGroup): ValidationErrors | null {
    const surfaceTotale = group.get('surface_totale')?.value;
    const surfaceImposable = group.get('surface_imposable')?.value;
    
    if (!surfaceTotale || !surfaceImposable) {
      return null; // Laisser les validateurs individuels gérer
    }
    
    const totale = parseFloat(surfaceTotale);
    const imposable = parseFloat(surfaceImposable);
    
    if (isNaN(totale) || isNaN(imposable)) {
      return null;
    }
    
    if (imposable > totale) {
      return { 
        surfaceCoherence: { 
          surfaceTotale: totale,
          surfaceImposable: imposable,
          message: 'La surface imposable ne peut pas être supérieure à la surface totale'
        } 
      };
    }
    
    // Vérifier ratio minimum (au moins 10% doit être imposable si non exonéré)
    const ratio = imposable / totale;
    if (ratio < 0.1) {
      const exonere = group.get('exonere_tnb')?.value;
      if (!exonere) {
        return { 
          surfaceRatioFaible: { 
            ratio: Math.round(ratio * 100),
            message: 'Surface imposable très faible (< 10% du total)'
          } 
        };
      }
    }
    
    return null;
  }
  
  /**
   * Valide qu'une surface correspond approximativement à la géométrie
   */
  static geometryCoherence(tolerancePercent: number = 10): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      if (!(group instanceof FormGroup)) return null;
      const surfaceDeclaree = group.get('surface_totale')?.value;
      const geometry = group.get('geometry')?.value;
      
      if (!surfaceDeclaree || !geometry) {
        return null;
      }
      
      const surfaceCalculee = SurfaceValidator.calculateGeometryArea(geometry);
      
      if (surfaceCalculee === null) {
        return null; // Impossible de calculer
      }
      
      const difference = Math.abs(surfaceDeclaree - surfaceCalculee);
      const pourcentageDifference = (difference / surfaceDeclaree) * 100;
      
      if (pourcentageDifference > tolerancePercent) {
        return { 
          surfaceGeometryMismatch: {
            surfaceDeclaree,
            surfaceCalculee: Math.round(surfaceCalculee * 100) / 100,
            difference: Math.round(difference * 100) / 100,
            pourcentage: Math.round(pourcentageDifference),
            tolerance: tolerancePercent,
            message: `Écart de ${Math.round(pourcentageDifference)}% entre surface déclarée et géométrie`
          }
        };
      }
      
      return null;
    };
  }
  
  /**
   * Valide la précision d'une surface
   */
  static precision(maxDecimals: number = 2): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (value === null || value === undefined || value === '') {
        return null;
      }
      
      const strValue = value.toString();
      const decimalIndex = strValue.indexOf('.');
      
      if (decimalIndex !== -1) {
        const decimals = strValue.substring(decimalIndex + 1).length;
        if (decimals > maxDecimals) {
          return { 
            surfacePrecision: { 
              value,
              maxDecimals,
              currentDecimals: decimals,
              message: `Maximum ${maxDecimals} décimales autorisées`
            } 
          };
        }
      }
      
      return null;
    };
  }
  
  /**
   * Valide une surface selon le type de parcelle
   */
  static typeSpecific(control: AbstractControl): ValidationErrors | null {
    // Cette validation nécessiterait accès au FormGroup parent
    // pour connaître le type de parcelle
    return null;
  }
  
  /**
   * Calcule l'aire d'une géométrie (simulation)
   */
  private static calculateGeometryArea(geometry: any): number | null {
    if (!geometry || !geometry.coordinates) {
      return null;
    }
    
    // Simulation simplifiée - dans un vrai projet, utiliser turf.js ou similar
    try {
      if (geometry.type === 'Polygon' && geometry.coordinates[0]) {
        const coords = geometry.coordinates[0];
        return SurfaceValidator.calculatePolygonArea(coords);
      }
      return null;
    } catch {
      return null;
    }
  }
  
  /**
   * Calcule l'aire d'un polygone (formule du lacet)
   */
  private static calculatePolygonArea(coordinates: [number, number][]): number {
    if (coordinates.length < 3) return 0;
    
    let area = 0;
    const n = coordinates.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += coordinates[i][0] * coordinates[j][1];
      area -= coordinates[j][0] * coordinates[i][1];
    }
    
    area = Math.abs(area) / 2;
    
    // Conversion approximative degrés -> m² (dépend de la latitude)
    // Facteur approximatif pour le Maroc
    const degreeToM2Factor = 111320 * 110540; // m²/degré²
    
    return area * degreeToM2Factor;
  }
  
  /**
   * Valide une surface cadastrale (format spécifique)
   */
  static cadastralFormat(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    // Format cadastral: hectares, ares, centiares (ha.a.ca)
    const cadastralPattern = /^\d{1,4}(\.\d{1,2}){0,2}$/;
    
    if (!cadastralPattern.test(value.toString())) {
      return { 
        surfaceCadastral: { 
          value, 
          message: 'Format cadastral invalide (ex: 1.50.25)' 
        } 
      };
    }
    
    return null;
  }
  
  /**
   * Valide la cohérence avec les surfaces voisines
   */
  static neighborCoherence(averageSize: number, tolerancePercent: number = 50): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (value === null || value === undefined || value === '' || !averageSize) {
        return null;
      }
      
      const numValue = parseFloat(value);
      const difference = Math.abs(numValue - averageSize);
      const percentDifference = (difference / averageSize) * 100;
      
      if (percentDifference > tolerancePercent) {
        return { 
          surfaceNeighborMismatch: {
            surface: numValue,
            averageNeighbor: averageSize,
            difference: Math.round(difference),
            percent: Math.round(percentDifference),
            message: `Surface très différente de la moyenne du secteur (${Math.round(averageSize)} m²)`
          }
        };
      }
      
      return null;
    };
  }
}

// Utilitaires pour validation de surfaces
export class SurfaceValidationUtils {
  
  /**
   * Convertit différentes unités vers m²
   */
  static convertToSquareMeters(value: number, unit: 'ha' | 'm2' | 'km2' = 'm2'): number {
    switch (unit) {
      case 'ha': return value * 10000;
      case 'km2': return value * 1000000;
      case 'm2':
      default: return value;
    }
  }
  
  /**
   * Obtient les limites recommandées selon le type de zone
   */
  static getRecommendedLimits(zoneType: string): { min: number; max: number } {
    const limits: { [key: string]: { min: number; max: number } } = {
      'R+4': { min: 100, max: 2000 },      // Résidentiel
      'R+2': { min: 200, max: 5000 },      // Résidentiel moins dense
      'I1': { min: 500, max: 50000 },      // Industriel léger
      'I2': { min: 1000, max: 100000 },    // Industriel lourd
      'V': { min: 5000, max: 500000 },     // Villa/résidentiel aisé
      'A': { min: 10000, max: 1000000 },   // Agricole
      'default': { min: 50, max: 100000 }
    };
    
    return limits[zoneType] || limits['default'];
  }
  
  /**
   * Valide la cohérence d'un ensemble de surfaces
   */
  static validateSurfaceSet(surfaces: { 
    totale: number; 
    imposable: number; 
    construite?: number;
    libre?: number;
  }): ValidationErrors | null {
    const errors: ValidationErrors = {};
    
    // Surface imposable <= totale
    if (surfaces.imposable > surfaces.totale) {
      errors['imposableSuperieure'] = true;
    }
    
    // Surface construite + libre = totale (si spécifiées)
    if (surfaces.construite !== undefined && surfaces.libre !== undefined) {
      const somme = surfaces.construite + surfaces.libre;
      const tolerance = surfaces.totale * 0.05; // 5% de tolérance
      
      if (Math.abs(somme - surfaces.totale) > tolerance) {
        errors['decompositionIncorrecte'] = {
          totale: surfaces.totale,
          sommeDecomposition: somme,
          difference: Math.abs(somme - surfaces.totale)
        };
      }
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  }
  
  /**
   * Suggère une surface imposable basée sur la surface totale
   */
  static suggestImposableSurface(
    surfaceTotale: number, 
    zoneType: string,
    hasConstructions: boolean = false
  ): number {
    let ratio = 0.8; // 80% par défaut
    
    // Ajuster selon le type de zone
    switch (zoneType) {
      case 'R+4':
      case 'R+2':
        ratio = hasConstructions ? 0.6 : 0.9;
        break;
      case 'I1':
      case 'I2':
        ratio = 0.95; // Industriel généralement très imposable
        break;
      case 'V':
        ratio = 0.7; // Villa avec jardins
        break;
      case 'A':
        ratio = 1.0; // Agricole entièrement imposable
        break;
    }
    
    return Math.round(surfaceTotale * ratio);
  }
}