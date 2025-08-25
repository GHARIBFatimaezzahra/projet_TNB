import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function quotePartValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }
  
      const quotePart = parseFloat(control.value);
      
      if (isNaN(quotePart)) {
        return {
          quotePartInvalid: {
            value: control.value,
            message: 'La quote-part doit être un nombre valide'
          }
        };
      }
  
      if (quotePart <= 0) {
        return {
          quotePartInvalid: {
            value: control.value,
            message: 'La quote-part doit être supérieure à 0'
          }
        };
      }
  
      if (quotePart > 1) {
        return {
          quotePartInvalid: {
            value: control.value,
            message: 'La quote-part ne peut pas être supérieure à 1 (100%)'
          }
        };
      }
  
      return null;
    };
  }
// Validator pour vérifier que la somme des quotes-parts = 1
export function quotePartSumValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formArray = control as any;
      if (!formArray.controls) {
        return null;
      }
  
      const sum = formArray.controls.reduce((total: number, ctrl: AbstractControl) => {
        const quotePart = parseFloat(ctrl.get('quotePart')?.value || 0);
        return total + (isNaN(quotePart) ? 0 : quotePart);
      }, 0);
  
      const tolerance = 0.01; // Tolérance pour les erreurs d'arrondi
      
      if (Math.abs(sum - 1) > tolerance) {
        return {
          quotePartSum: {
            sum: sum,
            message: `La somme des quotes-parts doit être égale à 1 (100%). Actuellement: ${(sum * 100).toFixed(2)}%`
          }
        };
      }
  
      return null;
    };
  }  