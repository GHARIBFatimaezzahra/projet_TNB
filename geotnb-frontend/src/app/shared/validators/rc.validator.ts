import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function rcValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
  
      const rc = control.value.toString().trim();
      
      // Format RC marocain: généralement des chiffres, parfois avec lettres
      // Longueur entre 4 et 15 caractères
      const rcRegex = /^[A-Z0-9]{4,15}$/i;
      
      if (!rcRegex.test(rc)) {
        return { 
          rcInvalid: { 
            value: control.value,
            message: 'Format RC invalide. Doit contenir entre 4 et 15 caractères alphanumériques'
          } 
        };
      }
  
      // Le RC doit contenir au moins un chiffre
      if (!/\d/.test(rc)) {
        return {
          rcInvalid: {
            value: control.value,
            message: 'Le registre de commerce doit contenir au moins un chiffre'
          }
        };
      }
  
      return null;
    };
  }