import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cinValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Ne pas valider si vide (utiliser required séparément)
    }

    const cin = control.value.toString().trim().toUpperCase();
    
    // Format CIN marocain: 1-2 lettres suivies de 6-8 chiffres
    // Exemples valides: A123456, AB1234567, BE123456789
    const cinRegex = /^[A-Z]{1,2}[0-9]{6,8}$/;
    
    if (!cinRegex.test(cin)) {
      return { 
        cinInvalid: { 
          value: control.value,
          message: 'Format CIN invalide. Format attendu: A123456 ou AB1234567'
        } 
      };
    }

    // Validation additionnelle: vérifier que ce n'est pas une séquence triviale
    const numberPart = cin.replace(/[A-Z]/g, '');
    if (/^0+$/.test(numberPart) || /^1+$/.test(numberPart)) {
      return {
        cinInvalid: {
          value: control.value,
          message: 'Le numéro CIN ne peut pas être composé uniquement de 0 ou de 1'
        }
      };
    }

    return null;
  };
}