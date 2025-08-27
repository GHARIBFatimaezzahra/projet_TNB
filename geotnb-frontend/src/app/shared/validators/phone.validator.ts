import { AbstractControl, ValidationErrors } from '@angular/forms';

export class PhoneValidator {
  /**
   * Validation du format téléphone marocain
   * Formats acceptés:
   * - Mobile: 06/07 XX XX XX XX
   * - Fixe: 05XX XX XX XX
   * - International: +212 6/7 XX XX XX XX
   */
  static validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null; // Champ optionnel
    }
    
    // Nettoyer le numéro (supprimer espaces, tirets, points)
    const cleanNumber = value.replace(/[\s\-\.]/g, '');
    
    // Patterns pour différents formats
    const patterns = [
      /^0[567][0-9]{8}$/, // Format national: 06/07/05 + 8 chiffres
      /^\+212[567][0-9]{8}$/, // Format international: +212 + 6/7/5 + 8 chiffres
      /^00212[567][0-9]{8}$/, // Format international alternatif: 00212 + 6/7/5 + 8 chiffres
    ];
    
    const isValid = patterns.some(pattern => pattern.test(cleanNumber));
    
    if (!isValid) {
      return { phoneInvalid: true };
    }
    
    return null;
  }
  
  /**
   * Validation stricte avec vérification du type (mobile/fixe)
   */
  static validateStrict(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const cleanNumber = value.replace(/[\s\-\.]/g, '');
    const errors: ValidationErrors = {};
    
    // Vérifier le format de base
    if (!/^(\+212|00212|0)?[567][0-9]{8}$/.test(cleanNumber)) {
      errors['phoneInvalid'] = true;
    }
    
    // Vérifier la longueur
    const expectedLengths = [10, 13, 14]; // 0XXXXXXXXX, +212XXXXXXXXX, 00212XXXXXXXXX
    if (!expectedLengths.includes(cleanNumber.length)) {
      errors['phoneLength'] = true;
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  }
  
  /**
   * Validation pour mobile uniquement
   */
  static validateMobile(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const cleanNumber = value.replace(/[\s\-\.]/g, '');
    
    // Patterns pour mobile seulement (06, 07)
    const mobilePatterns = [
      /^0[67][0-9]{8}$/,
      /^\+212[67][0-9]{8}$/,
      /^00212[67][0-9]{8}$/,
    ];
    
    const isValidMobile = mobilePatterns.some(pattern => pattern.test(cleanNumber));
    
    if (!isValidMobile) {
      return { mobileInvalid: true };
    }
    
    return null;
  }
  
  /**
   * Formater le numéro de téléphone
   */
  static format(phone: string, format: 'national' | 'international' = 'national'): string {
    if (!phone) return '';
    
    const cleanNumber = phone.replace(/[\s\-\.]/g, '');
    
    // Conversion vers format national
    let nationalNumber = cleanNumber;
    if (cleanNumber.startsWith('+212')) {
      nationalNumber = '0' + cleanNumber.substring(4);
    } else if (cleanNumber.startsWith('00212')) {
      nationalNumber = '0' + cleanNumber.substring(5);
    }
    
    if (format === 'national' && nationalNumber.length === 10) {
      // Format: 06 12 34 56 78
      return nationalNumber.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    } else if (format === 'international' && nationalNumber.length === 10) {
      // Format: +212 6 12 34 56 78
      const withoutZero = nationalNumber.substring(1);
      return `+212 ${withoutZero.charAt(0)} ${withoutZero.substring(1).replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`;
    }
    
    return phone; // Retourner tel quel si pas de format reconnu
  }
  
  /**
   * Détecter le type de numéro
   */
  static getPhoneType(phone: string): 'mobile' | 'fixe' | 'unknown' {
    if (!phone) return 'unknown';
    
    const cleanNumber = phone.replace(/[\s\-\.]/g, '');
    
    // Extraire le code réseau
    let networkCode = '';
    if (cleanNumber.startsWith('0')) {
      networkCode = cleanNumber.substring(1, 2);
    } else if (cleanNumber.startsWith('+212')) {
      networkCode = cleanNumber.substring(4, 5);
    } else if (cleanNumber.startsWith('00212')) {
      networkCode = cleanNumber.substring(5, 6);
    }
    
    if (['6', '7'].includes(networkCode)) {
      return 'mobile';
    } else if (networkCode === '5') {
      return 'fixe';
    }
    
    return 'unknown';
  }
  
  /**
   * Vérifier si un numéro est valide (utilitaire)
   */
  static isValid(phone: string): boolean {
    if (!phone) return false;
    return PhoneValidator.validate({ value: phone } as AbstractControl) === null;
  }
}