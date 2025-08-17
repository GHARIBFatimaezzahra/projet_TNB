import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AuthFeatureService } from '../../../services/auth-feature.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { UserProfile, UserRole } from '../../../models/auth-feature.model';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressBarModule
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss'
})
export class ProfileEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthFeatureService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  profileForm: FormGroup;
  isLoading = false;
  isFormLoading = true;
  currentUser: UserProfile | null = null;

  userRoles = [
    { value: UserRole.ADMIN, label: 'Administrateur' },
    { value: UserRole.AGENT_FISCAL, label: 'Agent Fiscal' },
    { value: UserRole.TECHNICIEN_SIG, label: 'Technicien SIG' },
    { value: UserRole.LECTEUR, label: 'Lecteur' }
  ];

  constructor() {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.profileForm.patchValue({
          username: user.username,
          email: user.email
        });
        this.isFormLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        this.notificationService.error('Erreur lors du chargement du profil');
        this.isFormLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid && !this.isLoading) {
      this.isLoading = true;
      const updatedProfile = this.profileForm.value;

      this.authService.updateProfile(updatedProfile).subscribe({
        next: (response) => {
          this.notificationService.success('Profil mis à jour avec succès !');
          this.router.navigate(['/auth/profile']);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.notificationService.error(
            error.error?.message || 'Erreur lors de la mise à jour du profil'
          );
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/auth/profile']);
  }

  // Getters pour faciliter l'accès aux contrôles
  get username() { return this.profileForm.get('username'); }
  get email() { return this.profileForm.get('email'); }
}