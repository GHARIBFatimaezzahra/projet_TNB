import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';

import { AuthFeatureService } from '../../services/auth-feature.service';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { ResetPasswordRequest } from '../../models/auth-feature.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatListModule,
    MatStepperModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthFeatureService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  resetPasswordForm: FormGroup;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  isValidating = true;
  isTokenValid = false;
  resetToken = '';

  // Critères de sécurité du mot de passe
  passwordCriteria = {
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false
  };

  constructor() {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(8), 
        this.passwordStrengthValidator.bind(this)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });

    // Écouter les changements du nouveau mot de passe
    this.resetPasswordForm.get('newPassword')?.valueChanges.subscribe(value => {
      this.updatePasswordCriteria(value);
    });
  }

  ngOnInit(): void {
    // Récupérer le token depuis l'URL
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'];
      if (this.resetToken) {
        this.validateToken();
      } else {
        this.handleInvalidToken();
      }
    });
  }

  private validateToken(): void {
    // Valider le token auprès du backend
    this.isValidating = true;
    
    // Simulation de validation - à remplacer par l'appel API réel
    setTimeout(() => {
      if (this.resetToken && this.resetToken.length > 10) {
        this.isTokenValid = true;
        this.isValidating = false;
      } else {
        this.handleInvalidToken();
      }
    }, 1000);

    // Version avec appel API réel (à décommenter quand votre backend est prêt)
    /*
    this.authService.validateResetToken(this.resetToken).subscribe({
      next: (response) => {
        this.isTokenValid = true;
        this.isValidating = false;
      },
      error: (error) => {
        this.handleInvalidToken();
      }
    });
    */
  }

  private handleInvalidToken(): void {
    this.isValidating = false;
    this.isTokenValid = false;
    this.notificationService.error(
      'Le lien de réinitialisation est invalide ou a expiré. Veuillez faire une nouvelle demande.'
    );
    setTimeout(() => {
      this.router.navigate(['/auth/forgot-password']);
    }, 3000);
  }

  // Validator pour la force du mot de passe
  private passwordStrengthValidator(control: AbstractControl): {[key: string]: any} | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasMinLength = value.length >= 8;

    const valid = hasNumber && hasUpper && hasLower && hasSpecial && hasMinLength;
    
    if (!valid) {
      return { 'passwordStrength': true };
    }
    return null;
  }

  // Validator pour vérifier que les mots de passe correspondent
  private passwordMatchValidator(group: AbstractControl): {[key: string]: any} | null {
    const newPassword = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  // Mettre à jour les critères de sécurité visuellement
  private updatePasswordCriteria(password: string): void {
    this.passwordCriteria = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && !this.isLoading && this.isTokenValid) {
      this.isLoading = true;
      
      const resetData: ResetPasswordRequest = {
        token: this.resetToken,
        newPassword: this.resetPasswordForm.get('newPassword')?.value,
        confirmPassword: this.resetPasswordForm.get('confirmPassword')?.value
      };

      this.authService.resetPassword(resetData).subscribe({
        next: (response) => {
          this.notificationService.success(
            'Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.'
          );
          this.router.navigate(['/auth/login'], {
            queryParams: { message: 'password-reset-success' }
          });
        },
        error: (error) => {
          console.error('Erreur lors de la réinitialisation:', error);
          let errorMessage = 'Erreur lors de la réinitialisation du mot de passe';
          
          if (error.status === 400) {
            errorMessage = 'Le lien de réinitialisation a expiré';
          } else if (error.status === 404) {
            errorMessage = 'Lien de réinitialisation invalide';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.notificationService.error(errorMessage);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.resetPasswordForm.controls).forEach(key => {
      const control = this.resetPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  toggleNewPasswordVisibility(): void {
    this.hideNewPassword = !this.hideNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  // Getters pour faciliter l'accès aux contrôles
  get newPassword() { return this.resetPasswordForm.get('newPassword'); }
  get confirmPassword() { return this.resetPasswordForm.get('confirmPassword'); }

  // Méthodes utilitaires pour l'UI
  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getPasswordStrengthClass(): string {
    const criteria = Object.values(this.passwordCriteria);
    const validCount = criteria.filter(Boolean).length;
    
    if (validCount === 0) return '';
    if (validCount <= 2) return 'weak';
    if (validCount <= 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthLabel(): string {
    const strengthClass = this.getPasswordStrengthClass();
    switch (strengthClass) {
      case 'weak': return 'Faible';
      case 'medium': return 'Moyen';
      case 'strong': return 'Fort';
      default: return '';
    }
  }

  getOverallProgress(): number {
    const criteria = Object.values(this.passwordCriteria);
    const validCount = criteria.filter(Boolean).length;
    return Math.round((validCount / criteria.length) * 100);
  }
}