// =====================================================
// COMPOSANT FORGOT PASSWORD - RÉCUPÉRATION MOT DE PASSE
// =====================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// Services
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  forgotPasswordForm!: FormGroup;
  loading = false;
  emailSent = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initializeForm(): void {
    this.forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });
  }

  // =====================================================
  // RÉCUPÉRATION MOT DE PASSE
  // =====================================================

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
      const email = this.forgotPasswordForm.value.email;

    // Simulation d'appel API (à remplacer par le vrai service)
    setTimeout(() => {
      this.loading = false;
      this.emailSent = true;
      this.showSuccess(`Instructions envoyées à ${email}`);
    }, 2000);

    /* Vrai appel API à implémenter:
    this.authService.forgotPassword(email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.emailSent = true;
          this.showSuccess(`Instructions envoyées à ${email}`);
          this.loading = false;
        },
        error: (error) => {
          this.showError(error.message || 'Erreur lors de l\'envoi');
          this.loading = false;
        }
      });
    */
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  resendEmail(): void {
    this.emailSent = false;
    this.onSubmit();
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  private markFormGroupTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.forgotPasswordForm.get(fieldName);
    if (!control?.errors || !control.touched) return null;

    const errors = control.errors;
    
    if (errors['required']) return 'Email requis';
    if (errors['email']) return 'Format email invalide';
    
    return 'Valeur invalide';
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}