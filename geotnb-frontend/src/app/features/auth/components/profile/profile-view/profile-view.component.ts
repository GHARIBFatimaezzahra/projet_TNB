import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { AuthFeatureService } from '../../../services/auth-feature.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { UserProfile, UserRole } from '../../../models/auth-feature.model';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.scss'
})
export class ProfileViewComponent implements OnInit {
  private readonly authService = inject(AuthFeatureService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  userProfile: UserProfile | null = null;
  isLoading = true;

  roleLabels: { [key in UserRole]: string } = {
    [UserRole.ADMIN]: 'Administrateur',
    [UserRole.AGENT_FISCAL]: 'Agent Fiscal',
    [UserRole.TECHNICIEN_SIG]: 'Technicien SIG',
    [UserRole.LECTEUR]: 'Lecteur'
  };

  roleColors: { [key in UserRole]: string } = {
    [UserRole.ADMIN]: 'warn',
    [UserRole.AGENT_FISCAL]: 'primary',
    [UserRole.TECHNICIEN_SIG]: 'accent',
    [UserRole.LECTEUR]: 'basic'
  };

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.authService.getCurrentUser().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        this.notificationService.error('Erreur lors du chargement du profil');
        this.isLoading = false;
      }
    });
  }

  editProfile(): void {
    this.router.navigate(['/auth/profile/edit']);
  }

  changePassword(): void {
    this.router.navigate(['/auth/profile/change-password']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getRoleLabel(role: UserRole): string {
    return this.roleLabels[role] || role;
  }

  getRoleColor(role: UserRole): string {
    return this.roleColors[role] || 'basic';
  }

  formatDate(date: Date | string): string {
    if (!date) return 'Non disponible';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}