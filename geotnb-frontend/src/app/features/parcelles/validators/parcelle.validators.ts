// =====================================================
// VALIDATORS PARCELLES - VALIDATION MÉTIER
// =====================================================

import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export class ParcelleValidators {

  /**
   * Validator pour la référence foncière
   * Format: TF-123456, R-789012, NI-345678
   */
  static referenceFonciere(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value.toString().toUpperCase();
    
    // Patterns selon votre BDD
    const patterns = [
      /^TF-\d{6,}$/,      // Titre foncier
      /^R-\d{6,}$/,       // Réquisition
      /^NI-\d{6,}$/       // Non immatriculé
    ];

    const isValid = patterns.some(pattern => pattern.test(value));
    
    return isValid ? null : { 
      referenceFonciere: { 
        message: 'Format invalide. Utilisez: TF-123456, R-123456 ou NI-123456' 
      } 
    };
  }

  /**
   * Validator pour les surfaces (doit être > 0)
   */
  static surface(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = parseFloat(control.value);
    
    if (isNaN(value) || value <= 0) {
      return { 
        surface: { 
          message: 'La surface doit être supérieure à 0' 
        } 
      };
    }

    // Surface maximale raisonnable (100 hectares = 1,000,000 m²)
    if (value > 1000000) {
      return { 
        surface: { 
          message: 'Surface trop importante (max: 1,000,000 m²)' 
        } 
      };
    }

    return null;
  }

  /**
   * Validator pour vérifier que surface_imposable <= surface_totale
   */
  static surfaceCoherence(formGroup: FormGroup): ValidationErrors | null {
    const surfaceTotale = formGroup.get('surface_totale')?.value;
    const surfaceImposable = formGroup.get('surface_imposable')?.value;

    if (!surfaceTotale || !surfaceImposable) return null;

    const total = parseFloat(surfaceTotale);
    const imposable = parseFloat(surfaceImposable);

    if (imposable > total) {
      return {
        surfaceCoherence: {
          message: 'La surface imposable ne peut pas être supérieure à la surface totale'
        }
      };
    }

    return null;
  }

  /**
   * Validator pour la cohérence de l'exonération
   * Si exonere_tnb = true, alors date_permis et duree_exoneration sont requis
   */
  static exonerationCoherence(formGroup: FormGroup): ValidationErrors | null {
    const exonereTnb = formGroup.get('exonere_tnb')?.value;
    const datePermis = formGroup.get('date_permis')?.value;
    const dureeExoneration = formGroup.get('duree_exoneration')?.value;

    if (exonereTnb === true) {
      if (!datePermis) {
        return {
          exonerationCoherence: {
            message: 'La date du permis est requise pour une parcelle exonérée'
          }
        };
      }

      if (!dureeExoneration || dureeExoneration <= 0) {
        return {
          exonerationCoherence: {
            message: 'La durée d\'exonération doit être spécifiée'
          }
        };
      }

      // Vérifier que la durée est dans les valeurs autorisées (3, 5, 7 ans)
      if (![3, 5, 7].includes(parseInt(dureeExoneration))) {
        return {
          exonerationCoherence: {
            message: 'La durée d\'exonération doit être de 3, 5 ou 7 ans'
          }
        };
      }
    }

    return null;
  }

  /**
   * Validator pour le CIN marocain
   * Format: 1-2 lettres + 6-8 chiffres
   */
  static cinMarocain(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value.toString().toUpperCase();
    const pattern = /^[A-Z]{1,2}[0-9]{6,8}$/;

    return pattern.test(value) ? null : {
      cinMarocain: {
        message: 'Format CIN invalide (ex: A123456, AB1234567)'
      }
    };
  }

  /**
   * Validator pour le RC (Registre de Commerce)
   * Format: chiffres uniquement
   */
  static registreCommerce(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value.toString();
    const pattern = /^[0-9]+$/;

    return pattern.test(value) ? null : {
      registreCommerce: {
        message: 'Le RC doit contenir uniquement des chiffres'
      }
    };
  }

  /**
   * Validator pour les quotes-parts (entre 0 et 1)
   */
  static quotePart(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = parseFloat(control.value);
    
    if (isNaN(value) || value <= 0 || value > 1) {
      return {
        quotePart: {
          message: 'La quote-part doit être entre 0.0001 et 1.0000'
        }
      };
    }

    return null;
  }

  /**
   * Validator pour vérifier que la somme des quotes-parts = 1
   * (à utiliser au niveau du formulaire de gestion des propriétaires)
   */
  static quotesPartsSum(quoteParts: number[]): ValidationErrors | null {
    const sum = quoteParts.reduce((acc, curr) => acc + curr, 0);
    const tolerance = 0.0001; // Tolérance pour les erreurs d'arrondi

    if (Math.abs(sum - 1) > tolerance) {
      return {
        quotesPartsSum: {
          message: `La somme des quotes-parts doit égaler 1.0000 (actuel: ${sum.toFixed(4)})`
        }
      };
    }

    return null;
  }

  /**
   * Validator pour les montants TNB (doit être >= 0)
   */
  static montantTnb(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = parseFloat(control.value);
    
    if (isNaN(value) || value < 0) {
      return {
        montantTnb: {
          message: 'Le montant TNB doit être supérieur ou égal à 0'
        }
      };
    }

    // Montant maximal raisonnable (10 millions DH)
    if (value > 10000000) {
      return {
        montantTnb: {
          message: 'Montant TNB trop élevé (max: 10,000,000 DH)'
        }
      };
    }

    return null;
  }

  /**
   * Validator pour l'année (entre 2020 et année courante + 5)
   */
  static anneeValide(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = parseInt(control.value);
    const currentYear = new Date().getFullYear();
    
    if (isNaN(value) || value < 2020 || value > currentYear + 5) {
      return {
        anneeValide: {
          message: `L'année doit être entre 2020 et ${currentYear + 5}`
        }
      };
    }

    return null;
  }

  /**
   * Validator pour les codes de zone
   * Format: lettres + chiffres (ex: R1, I2, C3)
   */
  static codeZone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value.toString().toUpperCase();
    const pattern = /^[A-Z]{1,3}[0-9]{0,2}$/;

    return pattern.test(value) ? null : {
      codeZone: {
        message: 'Format de zone invalide (ex: R1, I2, C3, URB)'
      }
    };
  }

  /**
   * Validator pour les couleurs hexadécimales
   */
  static couleurHex(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value.toString();
    const pattern = /^#[0-9A-Fa-f]{6}$/;

    return pattern.test(value) ? null : {
      couleurHex: {
        message: 'Format couleur invalide (ex: #FF0000)'
      }
    };
  }

  /**
   * Validator pour les noms de fichiers
   */
  static nomFichier(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value.toString();
    
    // Caractères interdits dans les noms de fichiers
    const forbiddenChars = /[<>:"/\\|?*]/;
    
    if (forbiddenChars.test(value)) {
      return {
        nomFichier: {
          message: 'Le nom de fichier contient des caractères interdits'
        }
      };
    }

    // Longueur maximale
    if (value.length > 255) {
      return {
        nomFichier: {
          message: 'Le nom de fichier est trop long (max: 255 caractères)'
        }
      };
    }

    return null;
  }

  /**
   * Factory pour créer un validator de longueur minimale personnalisé
   */
  static minLength(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const value = control.value.toString();
      
      return value.length >= min ? null : {
        minLength: {
          message: `Minimum ${min} caractères requis`
        }
      };
    };
  }

  /**
   * Factory pour créer un validator de longueur maximale personnalisé
   */
  static maxLength(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const value = control.value.toString();
      
      return value.length <= max ? null : {
        maxLength: {
          message: `Maximum ${max} caractères autorisés`
        }
      };
    };
  }
}
