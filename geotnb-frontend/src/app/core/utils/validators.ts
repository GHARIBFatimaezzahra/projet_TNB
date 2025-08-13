import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static cin(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    // Moroccan CIN validation (simplified)
    const cinPattern = /^[A-Z]{1,2}[0-9]{1,6}$/;
    if (!cinPattern.test(value)) {
      return { cin: true };
    }
    return null;
  }

  static rc(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    // Moroccan RC validation (simplified)
    const rcPattern = /^[0-9]{1,6}$/;
    if (!rcPattern.test(value)) {
      return { rc: true };
    }
    return null;
  }

  static phone(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    // Moroccan phone validation
    const phonePattern = /^(0[5-7])[0-9]{8}$/;
    if (!phonePattern.test(value.replace(/\s/g, ''))) {
      return { phone: true };
    }
    return null;
  }

  static referenceFonciere(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    // Reference fonciere pattern (TF/number or similar)
    const refPattern = /^(TF|R|NI)\/[0-9]+\/[A-Z]*[0-9]*$/i;
    if (!refPattern.test(value)) {
      return { referenceFonciere: true };
    }
    return null;
  }

  static positiveNumber(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue <= 0) {
      return { positiveNumber: true };
    }
    return null;
  }

  static quotePart(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue <= 0 || numValue > 1) {
      return { quotePart: true };
    }
    return null;
  }

  static fileSize(maxSize: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      if (!file) return null;

      if (file.size > maxSize) {
        return { fileSize: { maxSize, actualSize: file.size } };
      }
      return null;
    };
  }

  static fileType(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      if (!file) return null;

      if (!allowedTypes.includes(file.type)) {
        return { fileType: { allowedTypes, actualType: file.type } };
      }
      return null;
    };
  }
}