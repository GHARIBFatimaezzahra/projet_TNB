import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { AuthFeatureService } from '../../services/auth-local.service';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { LoginRequest } from '../../models/auth-feature.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthFeatureService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);

  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  returnUrl = '/dashboard';

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Récupérer l'URL de retour si spécifiée
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Rediriger si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const credentials: LoginRequest = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.notificationService.success(
            `Bienvenue ${response.user.username} ! Connexion réussie.`
          );
          
          // Redirection selon le rôle
          this.redirectAfterLogin(response.user.profil);
        },
        error: (error) => {
          console.error('Erreur de connexion:', error);
          let errorMessage = 'Erreur de connexion. Vérifiez vos identifiants.';
          
          if (error.status === 401) {
            errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
          } else if (error.status === 403) {
            errorMessage = 'Votre compte est désactivé. Contactez l\'administrateur.';
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

  private redirectAfterLogin(userRole: string): void {
    // Redirection intelligente selon le rôle
    switch (userRole) {
      case 'Admin':
        this.router.navigate(['/dashboard']);
        break;
      case 'AgentFiscal':
        this.router.navigate(['/fiches-fiscales']);
        break;
      case 'TechnicienSIG':
        this.router.navigate(['/cartographie']);
        break;
      case 'Lecteur':
        this.router.navigate(['/parcelles']);
        break;
      default:
        this.router.navigate([this.returnUrl]);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  // Getters pour faciliter l'accès aux contrôles du formulaire
  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  // Méthodes utilitaires pour l'UI
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} est requis`;
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
    }
    return '';
  }
}