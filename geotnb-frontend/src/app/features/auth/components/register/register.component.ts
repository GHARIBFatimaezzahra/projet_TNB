import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router'; // ← AJOUTEZ CECI

import { AuthFeatureService } from '../../services/auth-feature.service';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { RegisterRequest, UserRole } from '../../models/auth-feature.model';

interface UserRoleInfo {
  value: UserRole;
  label: string;
  description: string;
  fullDescription: string;
  icon: string;
  permissions: string[];
  color: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule, // ← AJOUTEZ CECI
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthFeatureService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  selectedRole: UserRoleInfo | null = null;

  userRoles: UserRoleInfo[] = [
    {
      value: UserRole.LECTEUR,
      label: 'Lecteur',
      description: 'Consultation uniquement',
      fullDescription: 'Accès en lecture seule aux parcelles, propriétaires et fiches fiscales.',
      icon: 'visibility',
      permissions: ['Consulter les parcelles', 'Voir les propriétaires', 'Visualiser la cartographie'],
      color: 'blue'
    },
    {
      value: UserRole.AGENT_FISCAL,
      label: 'Agent Fiscal',
      description: 'Gestion TNB et recouvrement',
      fullDescription: 'Spécialisé dans la gestion fiscale, génération des fiches TNB.',
      icon: 'account_balance',
      permissions: ['Toutes les permissions Lecteur', 'Générer les fiches fiscales TNB', 'Modifier les montants'],
      color: 'green'
    },
    {
      value: UserRole.TECHNICIEN_SIG,
      label: 'Technicien SIG',
      description: 'Gestion cartographique',
      fullDescription: 'Expert en géomatique, responsable de la cartographie.',
      icon: 'map',
      permissions: ['Toutes les permissions Lecteur', 'Modifier les parcelles', 'Importer des données SIG'],
      color: 'orange'
    },
    {
      value: UserRole.ADMIN,
      label: 'Administrateur',
      description: 'Accès complet',
      fullDescription: 'Accès administrateur avec toutes les permissions.',
      icon: 'admin_panel_settings',
      permissions: ['Toutes les permissions système', 'Créer des utilisateurs', 'Configuration système'],
      color: 'red'
    }
  ];

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      profil: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordValidator(control: AbstractControl): {[key: string]: any} | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const valid = hasNumber && hasUpper && hasLower && hasSpecial;
    if (!valid) {
      return { 'passwordStrength': true };
    }
    return null;
  }

  private passwordMatchValidator(group: AbstractControl): {[key: string]: any} | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  // ✅ CORRECTION : paramètre string au lieu de UserRole
  onUserTypeChange(value: string): void {
    this.selectedRole = this.userRoles.find(role => role.value === value) || null;
  }

  getPasswordStrength(): string {
    const password = this.password?.value || '';
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    if (strength <= 4) return 'good';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    const texts = {
      weak: 'Faible',
      medium: 'Moyen', 
      good: 'Bon',
      strong: 'Très fort'
    };
    return texts[strength as keyof typeof texts];
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      // Simulation pour test
      setTimeout(() => {
        this.notificationService.success('Compte créé avec succès !');
        this.router.navigate(['/auth/login']);
        this.isLoading = false;
      }, 2000);
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  // Getters
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get profil() { return this.registerForm.get('profil'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}