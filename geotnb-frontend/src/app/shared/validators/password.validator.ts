import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordValidator(minLength: number = 8): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
  
      const password = control.value.toString();
      const errors: any = {};
  
      // Longueur minimale
      if (password.length < minLength) {
        errors.minLength = {
          requiredLength: minLength,
          actualLength: password.length,
          message: `Le mot de passe doit contenir au moins ${minLength} caractères`
        };
      }
  
      // Au moins une majuscule
      if (!/[A-Z]/.test(password)) {
        errors.uppercase = {
          message: 'Le mot de passe doit contenir au moins une majuscule'
        };
      }
  
      // Au moins une minuscule
      if (!/[a-z]/.test(password)) {
        errors.lowercase = {
          message: 'Le mot de passe doit contenir au moins une minuscule'
        };
      }
  
      // Au moins un chiffre
      if (!/\d/.test(password)) {
        errors.number = {
          message: 'Le mot de passe doit contenir au moins un chiffre'
        };
      }
  
      // Au moins un caractère spécial
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.specialChar = {
          message: 'Le mot de passe doit contenir au moins un caractère spécial'
        };
      }
  
      return Object.keys(errors).length > 0 ? { passwordInvalid: errors } : null;
    };
  }
  
  // Validator pour confirmer le mot de passe
  export function confirmPasswordValidator(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent || !control.value) {
        return null;
      }
  
      const password = control.parent.get(passwordField)?.value;
      const confirmPassword = control.value;
  
      if (password !== confirmPassword) {
        return {
          passwordMismatch: {
            message: 'Les mots de passe ne correspondent pas'
          }
        };
      }
  
      return null;
    };
  }