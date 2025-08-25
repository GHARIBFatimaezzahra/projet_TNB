import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
  
      const email = control.value.toString().trim().toLowerCase();
      
      // Regex plus stricte pour les emails
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      
      if (!emailRegex.test(email)) {
        return {
          emailInvalid: {
            value: control.value,
            message: 'Format email invalide'
          }
        };
      }
  
      // Vérifications additionnelles
      if (email.length > 254) {
        return {
          emailInvalid: {
            value: control.value,
            message: 'L\'email ne peut pas dépasser 254 caractères'
          }
        };
      }
  
      const localPart = email.split('@')[0];
      if (localPart.length > 64) {
        return {
          emailInvalid: {
            value: control.value,
            message: 'La partie locale de l\'email ne peut pas dépasser 64 caractères'
          }
        };
      }
  
      return null;
    };
  }
  