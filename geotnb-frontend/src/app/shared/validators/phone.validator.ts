import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
  
      const phone = control.value.toString().replace(/[\s\-\(\)]/g, '');
      
      // Formats téléphone marocain:
      // Mobile: 06XXXXXXXX, 07XXXXXXXX (nouveau format)
      // Fixe: 05XXXXXXXX (Casablanca, Rabat), 039XXXXXXX (Oujda)
      // International: +212XXXXXXXXX, 00212XXXXXXXXX
      
      const patterns = [
        /^0[567]\d{8}$/, // Mobile et fixe national
        /^039\d{6}$/, // Fixe Oujda
        /^\+212[567]\d{8}$/, // International avec +
        /^00212[567]\d{8}$/, // International avec 00
        /^\+212539\d{6}$/, // International Oujda avec +
        /^00212539\d{6}$/ // International Oujda avec 00
      ];
  
      const isValid = patterns.some(pattern => pattern.test(phone));
      
      if (!isValid) {
        return {
          phoneInvalid: {
            value: control.value,
            message: 'Format téléphone invalide. Exemples: 0612345678, +212612345678, 0539123456'
          }
        };
      }
  
      return null;
    };
  }