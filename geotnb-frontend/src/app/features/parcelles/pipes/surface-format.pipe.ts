// =====================================================
// PIPE FORMATAGE SURFACE - m² ↔ ha
// =====================================================

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'surfaceFormat',
  standalone: true
})
export class SurfaceFormatPipe implements PipeTransform {
  
  /**
   * Transforme une surface en m² vers le format approprié (m² ou ha)
   * @param value - Surface en m²
   * @param unit - Unité forcée ('m2', 'ha', 'auto')
   * @param precision - Nombre de décimales (défaut: 2)
   * @param showUnit - Afficher l'unité (défaut: true)
   */
  transform(
    value: number | null | undefined, 
    unit: 'auto' | 'm2' | 'ha' = 'auto',
    precision: number = 2,
    showUnit: boolean = true
  ): string {
    
    if (value === null || value === undefined || isNaN(value)) {
      return showUnit ? '0 m²' : '0';
    }

    const numValue = Number(value);
    
    // Valeur négative
    if (numValue < 0) {
      return showUnit ? '0 m²' : '0';
    }

    let formattedValue: string;
    let unitText: string;

    switch (unit) {
      case 'ha':
        formattedValue = this.formatNumber(numValue / 10000, precision);
        unitText = 'ha';
        break;
        
      case 'm2':
        formattedValue = this.formatNumber(numValue, precision);
        unitText = 'm²';
        break;
        
      case 'auto':
      default:
        // Auto: utiliser hectares pour surfaces >= 10,000 m²
        if (numValue >= 10000) {
          formattedValue = this.formatNumber(numValue / 10000, precision);
          unitText = 'ha';
        } else {
          formattedValue = this.formatNumber(numValue, precision);
          unitText = 'm²';
        }
        break;
    }

    return showUnit ? `${formattedValue} ${unitText}` : formattedValue;
  }

  /**
   * Formate un nombre avec le nombre de décimales spécifié
   */
  private formatNumber(value: number, precision: number): string {
    return value.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: precision
    });
  }
}

// Utilitaires pour conversion de surface
export class SurfaceUtils {
  
  /**
   * Convertit m² en hectares
   */
  static toHectares(m2: number): number {
    return m2 / 10000;
  }
  
  /**
   * Convertit hectares en m²
   */
  static toSquareMeters(ha: number): number {
    return ha * 10000;
  }
  
  /**
   * Détermine l'unité optimale pour affichage
   */
  static getOptimalUnit(m2: number): 'ha' | 'm2' {
    return m2 >= 10000 ? 'ha' : 'm2';
  }
  
  /**
   * Parse une chaîne de surface avec unité
   * Ex: "1.5 ha" -> 15000, "500 m²" -> 500
   */
  static parseSurface(surfaceString: string): number | null {
    if (!surfaceString || typeof surfaceString !== 'string') {
      return null;
    }
    
    const cleanString = surfaceString.trim().toLowerCase();
    const numberMatch = cleanString.match(/^([\d,.\s]+)/);
    
    if (!numberMatch) {
      return null;
    }
    
    const numberPart = numberMatch[1].replace(/[\s,]/g, '').replace(',', '.');
    const value = parseFloat(numberPart);
    
    if (isNaN(value)) {
      return null;
    }
    
    // Détecter l'unité
    if (cleanString.includes('ha')) {
      return SurfaceUtils.toSquareMeters(value);
    } else {
      return value; // Assume m² par défaut
    }
  }
  
  /**
   * Valide si une surface est dans une plage acceptable
   */
  static isValidSurface(m2: number, minM2: number = 0, maxM2: number = 1000000): boolean {
    return m2 >= minM2 && m2 <= maxM2;
  }
  
  /**
   * Calcule le pourcentage d'une surface par rapport à une autre
   */
  static calculatePercentage(partialM2: number, totalM2: number): number {
    if (!totalM2 || totalM2 === 0) return 0;
    return Math.round((partialM2 / totalM2) * 100);
  }
  
  /**
   * Formate une surface pour l'export (toujours en m²)
   */
  static formatForExport(m2: number, precision: number = 2): string {
    return m2.toFixed(precision);
  }
  
  /**
   * Compare deux surfaces avec une tolérance
   */
  static surfacesEqual(surface1: number, surface2: number, toleranceM2: number = 0.01): boolean {
    return Math.abs(surface1 - surface2) <= toleranceM2;
  }
}