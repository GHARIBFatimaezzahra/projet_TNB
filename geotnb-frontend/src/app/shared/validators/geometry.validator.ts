import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function geometryValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
  
      try {
        const geometry = typeof control.value === 'string' ? 
          JSON.parse(control.value) : control.value;
  
        if (!geometry.type || !geometry.coordinates) {
          return {
            geometryInvalid: {
              value: control.value,
              message: 'Géométrie invalide: type ou coordonnées manquants'
            }
          };
        }
  
        // Validation selon le type de géométrie
        switch (geometry.type) {
          case 'Polygon':
            return validatePolygon(geometry.coordinates);
          case 'MultiPolygon':
            return validateMultiPolygon(geometry.coordinates);
          case 'Point':
            return validatePoint(geometry.coordinates);
          default:
            return {
              geometryInvalid: {
                value: control.value,
                message: `Type de géométrie non supporté: ${geometry.type}`
              }
            };
        }
      } catch (error) {
        return {
          geometryInvalid: {
            value: control.value,
            message: 'Format géométrie invalide: JSON mal formé'
          }
        };
      }
    };
  }
  
  function validatePolygon(coordinates: number[][][]): ValidationErrors | null {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return {
        geometryInvalid: {
          message: 'Polygone invalide: coordonnées vides'
        }
      };
    }
  
    const exteriorRing = coordinates[0];
    if (!Array.isArray(exteriorRing) || exteriorRing.length < 4) {
      return {
        geometryInvalid: {
          message: 'Polygone invalide: au moins 4 points requis pour l\'anneau extérieur'
        }
      };
    }
  
    // Vérifier que le polygone est fermé
    const firstPoint = exteriorRing[0];
    const lastPoint = exteriorRing[exteriorRing.length - 1];
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      return {
        geometryInvalid: {
          message: 'Polygone invalide: l\'anneau extérieur doit être fermé'
        }
      };
    }
  
    // Valider les coordonnées
    for (const point of exteriorRing) {
      if (!Array.isArray(point) || point.length < 2 || 
          typeof point[0] !== 'number' || typeof point[1] !== 'number') {
        return {
          geometryInvalid: {
            message: 'Polygone invalide: coordonnées mal formées'
          }
        };
      }
    }
  
    return null;
  }
  
  function validateMultiPolygon(coordinates: number[][][][]): ValidationErrors | null {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return {
        geometryInvalid: {
          message: 'MultiPolygone invalide: coordonnées vides'
        }
      };
    }
  
    for (const polygon of coordinates) {
      const error = validatePolygon(polygon);
      if (error) {
        return error;
      }
    }
  
    return null;
  }
  
  function validatePoint(coordinates: number[]): ValidationErrors | null {
    if (!Array.isArray(coordinates) || coordinates.length < 2 ||
        typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
      return {
        geometryInvalid: {
          message: 'Point invalide: coordonnées mal formées'
        }
      };
    }
  
    return null;
  }