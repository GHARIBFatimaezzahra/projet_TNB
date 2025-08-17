import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-card">
      <!-- Header -->
      <div class="card-header">
        <h2 class="card-title">Mot de passe oublié</h2>
        <p class="card-subtitle">Entrez votre email pour recevoir un lien de réinitialisation</p>
      </div>

      @if (!emailSent()) {
        <!-- Form -->
        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="login-form">
          <!-- Email -->
          <div class="form-group">
            <label for="email" class="form-label">
              <i class="icon">📧</i>
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="form-input"
              [class.error]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
              placeholder="votre.email@exemple.com"
              autocomplete="email"
            >
            @if (forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched) {
              <div class="error-message">
                @if (forgotPasswordForm.get('email')?.errors?.['required']) {
                  <span>L'email est requis</span>
                }
                @if (forgotPasswordForm.get('email')?.errors?.['email']) {
                  <span>Format d'email invalide</span>
                }
              </div>
            }
          </div>

          <!-- Error message -->
          @if (errorMessage()) {
            <div class="alert alert-error">
              <i class="alert-icon">⚠️</i>
              {{ errorMessage() }}
            </div>
          }

          <!-- Submit button -->
          <button
            type="submit"
            class="submit-button"
            [disabled]="forgotPasswordForm.invalid || isLoading()"
            [class.loading]="isLoading()"
          >
            @if (isLoading()) {
              <div class="spinner"></div>
              <span>Envoi en cours...</span>
            } @else {
              <i class="button-icon">📤</i>
              <span>Envoyer le lien</span>
            }
          </button>
        </form>
      } @else {
        <!-- Success message -->
        <div class="success-content">
          <div class="success-icon">��</div>
          <h3>Email envoyé !</h3>
          <p>Nous avons envoyé un lien de réinitialisation à <strong>{{ sentToEmail() }}</strong></p>
          <p class="help-text">
            Vérifiez votre boîte de réception et vos spams. 
            Le lien expirera dans 1 heure.
          </p>
          
          <button 
            class="submit-button secondary"
            (click)="resendEmail()"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <div class="spinner"></div>
              <span>Renvoi en cours...</span>
            } @else {
              <i class="button-icon">🔄</i>
              <span>Renvoyer l'email</span>
            }
          </button>
        </div>
      }

      <!-- Back to login -->
      <div class="register-section">
        <a routerLink="/auth/login" class="register-link">
          ← Retour à la connexion
        </a>
      </div>
    </div>
  `,
  styleUrls: ['../../../layouts/auth-layout/auth-layout.component.scss'],
  styles: [`
    .success-content {
      text-align: center;
      padding: 2rem 0;
    }
    
    .success-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .success-content h3 {
      color: #38a169;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }
    
    .success-content p {
      margin-bottom: 1rem;
      line-height: 1.5;
    }
    
    .help-text {
      font-size: 0.9rem;
      color: #4a5568;
    }
    
    .submit-button.secondary {
      background: #f7fafc;
      color: #4a5568;
      border: 1px solid #e2e8f0;
    }
    
    .submit-button.secondary:hover {
      background: #edf2f7;
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  isLoading = signal(false);
  errorMessage = signal('');
  emailSent = signal(false);
  sentToEmail = signal('');

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.forgotPasswordForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const email = this.forgotPasswordForm.value.email;

      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.emailSent.set(true);
          this.sentToEmail.set(email);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error.error?.message || 
            'Erreur lors de l\'envoi de l\'email.'
          );
        }
      });
    }
  }

  resendEmail(): void {
    const email = this.sentToEmail();
    if (email) {
      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.notificationService.showSuccess(
            'Email renvoyé',
            'Un nouveau lien de réinitialisation a été envoyé'
          );
        },
        error: () => {
          this.notificationService.showError(
            'Erreur',
            'Impossible de renvoyer l\'email'
          );
        }
      });
    }
  }
}