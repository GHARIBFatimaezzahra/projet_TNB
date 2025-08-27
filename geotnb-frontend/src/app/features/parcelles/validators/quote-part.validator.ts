// =====================================================
// VALIDATORS QUOTE-PART - VALIDATION INDIVISION
// =====================================================

import { AbstractControl, ValidationErrors, ValidatorFn, FormArray, FormGroup } from '@angular/forms';

export class QuotePartValidator {
  
  /**
   * Validateur de base pour une quote-part
   */
  static validate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }
      
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return { quotePartInvalid: true };
      }
      
      if (numValue <= 0 || numValue > 1) {
        return { quotePartRange: true };
      }
      
      return null;
    };
  }
  
  /**
   * Valide qu'une quote-part est entre 0 et 1
   */
  static range(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return { quotePartInvalid: { value, message: 'Quote-part invalide' } };
    }
    
    if (numValue <= 0) {
      return { 
        quotePartMin: { 
          value, 
          message: 'Quote-part doit être supérieure à 0' 
        } 
      };
    }
    
    if (numValue > 1) {
      return { 
        quotePartMax: { 
          value, 
          message: 'Quote-part ne peut pas être supérieure à 1' 
        } 
      };
    }
    
    return null;
  }
  
  /**
   * Valide le format d'une quote-part (décimal ou fraction)
   */
  static format(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    const strValue = value.toString().trim();
    
    // Format décimal: 0.25, 0.5, etc.
    const decimalPattern = /^0\.\d{1,6}$|^1(\.0{1,6})?$/;
    
    // Format fraction: 1/4, 1/2, 3/4, etc.
    const fractionPattern = /^\d+\/\d+$/;
    
    if (!decimalPattern.test(strValue) && !fractionPattern.test(strValue)) {
      return { 
        quotePartFormat: { 
          value, 
          message: 'Format invalide (ex: 0.25 ou 1/4)' 
        } 
      };
    }
    
    // Si c'est une fraction, vérifier qu'elle est valide
    if (fractionPattern.test(strValue)) {
      const [numerator, denominator] = strValue.split('/').map(Number);
      
      if (denominator === 0) {
        return { 
          quotePartDivisionZero: { 
            value, 
            message: 'Division par zéro interdite' 
          } 
        };
      }
      
      const decimal = numerator / denominator;
      if (decimal > 1) {
        return { 
          quotePartFractionMax: { 
            value, 
            message: 'Fraction supérieure à 1 interdite' 
          } 
        };
      }
    }
    
    return null;
  }
  
  /**
   * Valide que la somme des quote-parts égale 1
   */
  static totalSum(formArray: FormArray): ValidationErrors | null {
    if (!formArray || formArray.length === 0) {
      return null;
    }
    
    let totalQuotePart = 0;
    const quotePartValues: number[] = [];
    
    // Calculer la somme des quote-parts
    for (let i = 0; i < formArray.length; i++) {
      const group = formArray.at(i) as FormGroup;
      const quotePartControl = group.get('quote_part');
      
      if (quotePartControl && quotePartControl.value) {
        const value = QuotePartValidator.parseQuotePartValue(quotePartControl.value);
        if (value !== null) {
          totalQuotePart += value;
          quotePartValues.push(value);
        }
      }
    }
    
    // Tolérance pour erreurs d'arrondi
    const tolerance = 0.0001;
    
    if (Math.abs(totalQuotePart - 1) > tolerance) {
      return { 
        quotePartTotalInvalid: {
          total: Math.round(totalQuotePart * 10000) / 10000,
          expected: 1,
          difference: Math.round((totalQuotePart - 1) * 10000) / 10000,
          values: quotePartValues,
          message: `Total des quote-parts: ${Math.round(totalQuotePart * 100)}% (doit être 100%)`
        }
      };
    }
    
    return null;
  }
  
  /**
   * Valide qu'il n'y a pas de doublons de propriétaires
   */
  static noDuplicateOwners(formArray: FormArray): ValidationErrors | null {
    if (!formArray || formArray.length === 0) {
      return null;
    }
    
    const ownerIds: number[] = [];
    const duplicates: number[] = [];
    
    for (let i = 0; i < formArray.length; i++) {
      const group = formArray.at(i) as FormGroup;
      const ownerIdControl = group.get('proprietaire_id');
      
      if (ownerIdControl && ownerIdControl.value) {
        const ownerId = parseInt(ownerIdControl.value);
        
        if (ownerIds.includes(ownerId)) {
          if (!duplicates.includes(ownerId)) {
            duplicates.push(ownerId);
          }
        } else {
          ownerIds.push(ownerId);
        }
      }
    }
    
    if (duplicates.length > 0) {
      return { 
        quotePartDuplicateOwners: {
          duplicateIds: duplicates,
          message: 'Propriétaires en double détectés'
        }
      };
    }
    
    return null;
  }
  
  /**
   * Valide une quote-part minimum selon le nombre de propriétaires
   */
  static minimumShare(minOwners: number = 2): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (value === null || value === undefined || value === '') {
        return null;
      }
      
      const numValue = QuotePartValidator.parseQuotePartValue(value);
      if (numValue === null) return null;
      
      const minShare = 1 / minOwners;
      
      if (numValue < minShare) {
        return { 
          quotePartTooSmall: {
            value: numValue,
            minimum: minShare,
            minOwners,
            message: `Quote-part trop petite (min: ${Math.round(minShare * 100)}% pour ${minOwners} propriétaires)`
          }
        };
      }
      
      return null;
    };
  }
  
  /**
   * Valide qu'une quote-part est cohérente avec le montant
   */
  static amountCoherence(totalAmount: number): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      if (!(group instanceof FormGroup)) return null;
      const quotePartControl = group.get('quote_part');
      const amountControl = group.get('montant_individuel');
      
      if (!quotePartControl?.value || !amountControl?.value || !totalAmount) {
        return null;
      }
      
      const quotePart = QuotePartValidator.parseQuotePartValue(quotePartControl.value);
      const amount = parseFloat(amountControl.value);
      
      if (quotePart === null || isNaN(amount)) {
        return null;
      }
      
      const expectedAmount = totalAmount * quotePart;
      const tolerance = totalAmount * 0.01; // 1% de tolérance
      
      if (Math.abs(amount - expectedAmount) > tolerance) {
        return { 
          quotePartAmountMismatch: {
            quotePart,
            actualAmount: amount,
            expectedAmount: Math.round(expectedAmount * 100) / 100,
            totalAmount,
            difference: Math.round((amount - expectedAmount) * 100) / 100,
            message: 'Montant incohérent avec la quote-part'
          }
        };
      }
      
      return null;
    };
  }
  
  /**
   * Valide les quote-parts pour succession/héritage
   */
  static inheritanceRules(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    const numValue = QuotePartValidator.parseQuotePartValue(value);
    if (numValue === null) return null;
    
    // Quote-parts typiques en droit successoral marocain
    const commonInheritanceShares = [
      1,        // Unique héritier
      1/2,      // Conjoint survivant
      1/3,      // Mère
      1/4,      // Conjoint avec enfants
      1/6,      // Père avec enfants
      1/8,      // Conjoint survivant avec enfants
      2/3,      // Filles (2 ou plus)
      1/12,     // Quote-parts multiples
      1/24      // Quote-parts très divisées
    ];
    
    const tolerance = 0.001;
    const isCommonShare = commonInheritanceShares.some(
      share => Math.abs(numValue - share) < tolerance
    );
    
    if (!isCommonShare && numValue < 0.1) {
      return { 
        quotePartUncommon: {
          value: numValue,
          message: 'Quote-part inhabituelle (vérifiez le calcul successoral)'
        }
      };
    }
    
    return null;
  }
  
  /**
   * Parse une valeur de quote-part (décimal ou fraction)
   */
  private static parseQuotePartValue(value: any): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    
    const strValue = value.toString().trim();
    
    // Si c'est déjà un nombre
    const numValue = parseFloat(strValue);
    if (!isNaN(numValue)) {
      return numValue;
    }
    
    // Si c'est une fraction
    if (strValue.includes('/')) {
      const parts = strValue.split('/');
      if (parts.length === 2) {
        const numerator = parseFloat(parts[0]);
        const denominator = parseFloat(parts[1]);
        
        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
          return numerator / denominator;
        }
      }
    }
    
    return null;
  }
}

// Utilitaires pour quote-parts
export class QuotePartUtils {
  
  /**
   * Convertit un décimal en fraction simple
   */
  static decimalToFraction(decimal: number): string {
    if (decimal === 1) return '1';
    if (decimal === 0) return '0';
    
    // Fractions communes
    const commonFractions: { [key: number]: string } = {
      0.5: '1/2',
      0.25: '1/4',
      0.75: '3/4',
      0.333333: '1/3',
      0.666667: '2/3',
      0.2: '1/5',
      0.4: '2/5',
      0.6: '3/5',
      0.8: '4/5',
      0.125: '1/8',
      0.375: '3/8',
      0.625: '5/8',
      0.875: '7/8'
    };
    
    // Chercher une fraction commune proche
    for (const [dec, frac] of Object.entries(commonFractions)) {
      if (Math.abs(decimal - parseFloat(dec)) < 0.001) {
        return frac;
      }
    }
    
    // Générer fraction approximative
    const tolerance = 1e-6;
    let denominator = 1;
    
    while (denominator <= 1000) {
      const numerator = Math.round(decimal * denominator);
      const calculatedDecimal = numerator / denominator;
      
      if (Math.abs(decimal - calculatedDecimal) < tolerance) {
        // Simplifier la fraction
        const gcd = QuotePartUtils.gcd(numerator, denominator);
        return `${numerator / gcd}/${denominator / gcd}`;
      }
      
      denominator++;
    }
    
    // Retourner décimal si aucune fraction simple trouvée
    return decimal.toFixed(4);
  }
  
  /**
   * Plus grand commun diviseur
   */
  private static gcd(a: number, b: number): number {
    return b === 0 ? a : QuotePartUtils.gcd(b, a % b);
  }
  
  /**
   * Calcule les quote-parts équitables
   */
  static calculateEqualShares(numberOfOwners: number): number[] {
    if (numberOfOwners <= 0) return [];
    
    const equalShare = 1 / numberOfOwners;
    return Array(numberOfOwners).fill(equalShare);
  }
  
  /**
   * Ajuste les quote-parts pour qu'elles totalisent 1
   */
  static adjustToTotal(quoteParts: number[]): number[] {
    if (quoteParts.length === 0) return [];
    
    const total = quoteParts.reduce((sum, part) => sum + part, 0);
    
    if (total === 0) {
      return QuotePartUtils.calculateEqualShares(quoteParts.length);
    }
    
    // Ajuster proportionnellement
    return quoteParts.map(part => part / total);
  }
  
  /**
   * Valide un ensemble de quote-parts
   */
  static validateQuotePartSet(quoteParts: number[]): {
    isValid: boolean;
    total: number;
    errors: string[];
  } {
    const errors: string[] = [];
    let total = 0;
    
    // Vérifier chaque quote-part
    for (let i = 0; i < quoteParts.length; i++) {
      const part = quoteParts[i];
      
      if (part <= 0) {
        errors.push(`Quote-part ${i + 1}: doit être positive`);
      }
      
      if (part > 1) {
        errors.push(`Quote-part ${i + 1}: ne peut pas être supérieure à 1`);
      }
      
      total += part;
    }
    
    // Vérifier le total
    if (Math.abs(total - 1) > 0.0001) {
      errors.push(`Total des quote-parts: ${Math.round(total * 100)}% (doit être 100%)`);
    }
    
    return {
      isValid: errors.length === 0,
      total,
      errors
    };
  }
  
  /**
   * Suggère des quote-parts selon le type de relation
   */
  static suggestQuotePartsByRelation(relation: 'conjoint' | 'enfants' | 'parents' | 'freres' | 'autre', count: number): number[] {
    switch (relation) {
      case 'conjoint':
        return [1]; // Conjoint unique
        
      case 'enfants':
        return QuotePartUtils.calculateEqualShares(count);
        
      case 'parents':
        return count === 2 ? [0.5, 0.5] : [1];
        
      case 'freres':
        return QuotePartUtils.calculateEqualShares(count);
        
      case 'autre':
      default:
        return QuotePartUtils.calculateEqualShares(count);
    }
  }
  
  /**
   * Formate une quote-part pour l'affichage
   */
  static formatForDisplay(quotePart: number, format: 'decimal' | 'percentage' | 'fraction' = 'percentage'): string {
    switch (format) {
      case 'decimal':
        return quotePart.toFixed(4);
        
      case 'fraction':
        return QuotePartUtils.decimalToFraction(quotePart);
        
      case 'percentage':
      default:
        return `${Math.round(quotePart * 100)}%`;
    }
  }
}