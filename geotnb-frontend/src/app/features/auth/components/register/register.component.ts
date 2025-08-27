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
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';

// Services et modèles
import { AuthService, RegisterDto } from '../../../../core/services/auth.service';
import { UserProfil } from '../../../../core/models/database.models';

// Validators personnalisés
import { CinValidator } from '../../../../shared/validators/cin.validator';
import { PhoneValidator } from '../../../../shared/validators/phone.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  // Options pour les selects
  userRoles = [
    { value: UserProfil.ADMIN, label: 'Administrateur', description: 'Accès complet au système', icon: 'admin_panel_settings' },
    { value: UserProfil.AGENT_FISCAL, label: 'Agent Fiscal', description: 'Validation et fiches TNB', icon: 'account_balance' },
    { value: UserProfil.TECHNICIEN_SIG, label: 'Technicien SIG', description: 'Gestion parcelles et géométries', icon: 'map' },
    { value: UserProfil.LECTEUR, label: 'Lecteur', description: 'Consultation uniquement', icon: 'visibility' }
  ];

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
    this.registerForm = this.fb.group({
      // Informations personnelles
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [PhoneValidator.validate]],
      
      // Informations de compte
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]],
      profil: [UserProfil.AGENT_FISCAL, [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  // =====================================================
  // VALIDATORS PERSONNALISÉS
  // =====================================================

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // =====================================================
  // INSCRIPTION
  // =====================================================

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormTouched();
      this.showError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    this.loading = true;
    
    const registerData: RegisterDto = {
      nom: this.registerForm.value.nom,
      prenom: this.registerForm.value.prenom,
      email: this.registerForm.value.email,
      telephone: this.registerForm.value.telephone,
      username: this.registerForm.value.username,
      password: this.registerForm.value.password,
      profil: this.registerForm.value.profil
    };

    this.authService.register(registerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.loading = false;
          this.showError(error.message || 'Erreur lors de la création du compte');
        }
      });
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  private markFormTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.registerForm.get(fieldName);
    if (!control?.errors || !control.touched) return null;

    const errors = control.errors;
    
    if (errors['required']) {
      const labels: { [key: string]: string } = {
        nom: 'Le nom',
        prenom: 'Le prénom',
        email: 'L\'email',
        username: 'Le nom d\'utilisateur',
        password: 'Le mot de passe',
        confirmPassword: 'La confirmation',
        profil: 'Le profil'
      };
      return `${labels[fieldName] || 'Ce champ'} est requis`;
    }
    
    if (errors['minlength']) {
      return `Minimum ${errors['minlength'].requiredLength} caractères`;
    }
    
    if (errors['email']) return 'Format email invalide';
    if (errors['cinInvalid']) return 'Format CIN invalide (ex: A123456)';
    if (errors['phoneInvalid']) return 'Format téléphone invalide';
    if (errors['pattern']) return 'Le mot de passe doit contenir: majuscule, minuscule, chiffre et caractère spécial';
    if (errors['passwordMismatch']) return 'Les mots de passe ne correspondent pas';
    if (errors['requiredTrue']) return 'Vous devez accepter les conditions';
    
    return 'Valeur invalide';
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value || '';
    if (password.length < 4) return 'weak';
    if (password.length < 6) return 'fair';
    if (password.length < 8) return 'good';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    const texts = {
      weak: 'Faible - Ajoutez des caractères spéciaux',
      fair: 'Moyen - Ajoutez des majuscules et chiffres',
      good: 'Bon - Presque parfait',
      strong: 'Excellent - Mot de passe sécurisé'
    };
    return texts[strength as keyof typeof texts];
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