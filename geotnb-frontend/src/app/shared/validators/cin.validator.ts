// =====================================================
// VALIDATOR CIN MAROCAIN - VALIDATION SPÉCIALISÉE
// =====================================================

import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CinValidator {
  /**
   * Validation du format CIN marocain
   * Format accepté: 1-2 lettres suivies de 6-8 chiffres (ex: A123456, AB12345678)
   */
  static validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null; // Laissons required gérer les champs obligatoires
    }
    
    // Format CIN marocain: [A-Z]{1,2}[0-9]{6,8}
    const cinPattern = /^[A-Z]{1,2}[0-9]{6,8}$/;
    
    if (!cinPattern.test(value.toUpperCase())) {
      return { cinInvalid: true };
    }
    
    return null;
  }
  
  /**
   * Validation avec vérification de la longueur totale
   */
  static validateWithLength(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const upperValue = value.toUpperCase();
    
    // Vérifications multiples
    const errors: ValidationErrors = {};
    
    // Format de base
    if (!/^[A-Z]{1,2}[0-9]{6,8}$/.test(upperValue)) {
      errors['cinInvalid'] = true;
    }
    
    // Longueur totale (7-10 caractères)
    if (upperValue.length < 7 || upperValue.length > 10) {
      errors['cinLength'] = true;
    }
    
    // Partie alphabétique
    const letterPart = upperValue.match(/^[A-Z]+/)?.[0] || '';
    if (letterPart.length === 0 || letterPart.length > 2) {
      errors['cinLetters'] = true;
    }
    
    // Partie numérique
    const numberPart = upperValue.match(/[0-9]+$/)?.[0] || '';
    if (numberPart.length < 6 || numberPart.length > 8) {
      errors['cinNumbers'] = true;
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  }
  
  /**
   * Formater le CIN en majuscules
   */
  static format(cin: string): string {
    return cin ? cin.toUpperCase().replace(/\s/g, '') : '';
  }
  
  /**
   * Vérifier si un CIN est valide (utilitaire)
   */
  static isValid(cin: string): boolean {
    if (!cin) return false;
    return CinValidator.validate({ value: cin } as AbstractControl) === null;
  }
}