import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function surfaceValidator(maxSurface?: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }
  
      const surface = parseFloat(control.value);
      
      if (isNaN(surface)) {
        return {
          surfaceInvalid: {
            value: control.value,
            message: 'La surface doit être un nombre valide'
          }
        };
      }
  
      if (surface < 0) {
        return {
          surfaceInvalid: {
            value: control.value,
            message: 'La surface ne peut pas être négative'
          }
        };
      }
  
      if (surface === 0) {
        return {
          surfaceInvalid: {
            value: control.value,
            message: 'La surface doit être supérieure à 0'
          }
        };
      }
  
      // Surface maximale par défaut: 100 000 m² (10 hectares)
      const maxAllowed = maxSurface || 100000;
      if (surface > maxAllowed) {
        return {
          surfaceInvalid: {
            value: control.value,
            message: `La surface ne peut pas dépasser ${maxAllowed.toLocaleString()} m²`
          }
        };
      }
  
      return null;
    };
  }