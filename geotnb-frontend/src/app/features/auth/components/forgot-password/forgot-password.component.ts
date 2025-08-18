import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <h1 class="app-title">Mot de passe oublié</h1>
        <p class="login-subtitle">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <!-- Form -->
      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="form-input"
            placeholder="votre@email.com"
            [class.error]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
          />
          <div 
            *ngIf="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
            class="error-message"
          >
            <span *ngIf="forgotPasswordForm.get('email')?.errors?.['required']">
              L'email est requis
            </span>
            <span *ngIf="forgotPasswordForm.get('email')?.errors?.['email']">
              Format d'email invalide
            </span>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage()" class="error-message global-error">
          {{ errorMessage() }}
        </div>

        <!-- Success Message -->
        <div *ngIf="emailSent()" class="success-message">
          <p>✅ Email envoyé avec succès !</p>
          <p>Vérifiez votre boîte de réception à <strong>{{ sentToEmail() }}</strong></p>
          <p>Si vous ne recevez pas l'email, vérifiez votre dossier spam.</p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn btn-primary btn-full"
          [disabled]="forgotPasswordForm.invalid || isLoading()"
        >
          <span *ngIf="!isLoading()">Envoyer les instructions</span>
          <span *ngIf="isLoading()">Envoi en cours...</span>
        </button>

        <!-- Resend Button -->
        <button
          *ngIf="emailSent()"
          type="button"
          class="btn btn-secondary btn-full"
          (click)="resendEmail()"
          [disabled]="isLoading()"
        >
          <span *ngIf="!isLoading()">Renvoyer l'email</span>
          <span *ngIf="isLoading()">Envoi en cours...</span>
        </button>
      </form>

      <!-- Footer Links -->
      <div class="login-footer">
        <a routerLink="/auth/login" class="link-back">
          ← Retour à la connexion
        </a>
        <a routerLink="/auth/register" class="link-register">
          Pas encore de compte ? S'inscrire
        </a>
      </div>
    </div>
  `,
  styles: [`
    .login-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      max-width: 450px;
      width: 100%;
      margin: 2rem auto;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .app-title {
      color: #2d3748;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .login-subtitle {
      color: #718096;
      font-size: 1rem;
      margin: 0;
      line-height: 1.5;
    }

    .login-form {
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      color: #4a5568;
      font-weight: 600;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: #ffffff;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input.error {
      border-color: #e53e3e;
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .global-error {
      background: #fed7d7;
      border: 1px solid #feb2b2;
      color: #c53030;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
    }

    .success-message {
      background: #c6f6d5;
      border: 1px solid #9ae6b4;
      color: #22543d;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
    }

    .success-message p {
      margin: 0.25rem 0;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 48px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #718096;
      color: white;
      margin-top: 1rem;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #4a5568;
      transform: translateY(-1px);
    }

    .btn-full {
      width: 100%;
    }

    .login-footer {
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .link-back,
    .link-register {
      display: block;
      color: #667eea;
      text-decoration: none;
      margin: 0.5rem 0;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .link-back:hover,
    .link-register:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    @media (max-width: 640px) {
      .login-card {
        margin: 1rem;
        padding: 2rem;
      }
      
      .app-title {
        font-size: 1.75rem;
      }
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Signals
  isLoading = signal(false);
  emailSent = signal(false);
  sentToEmail = signal('');
  errorMessage = signal('');

  // Form
  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.forgotPasswordForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const email = this.forgotPasswordForm.value.email;

      this.authService.forgotPassword({ email }).subscribe({
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
      this.authService.forgotPassword({ email }).subscribe({
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