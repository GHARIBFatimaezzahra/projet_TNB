import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { ApiService } from '../../../core/services/api/api.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TokenService } from '../../../core/services/auth/token.service';
import { 
  LoginRequest, 
  LoginResponse, 
  UserProfile, 
  ChangePasswordRequest,
  ForgotPasswordRequest,
  RegisterRequest,
  UpdateProfileRequest
} from '../models/auth-feature.model';
import { UserRole } from '../../../core/models/auth/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthFeatureService {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  /**
   * Connexion utilisateur
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', credentials)
      .pipe(
        tap(response => {
          // Stocker les tokens
          this.tokenService.setTokens(response.access_token, response.refresh_token);
          
          // ✅ MAINTENANT cette méthode existe
          this.authService.setCurrentUser(response.user);
        })
      );
  }

  /**
   * Inscription nouvel utilisateur (Admin uniquement)
   */
  register(userData: RegisterRequest): Observable<UserProfile> {
    return this.apiService.post<UserProfile>('/auth/register', userData);
  }

  /**
   * Récupérer le profil utilisateur courant
   */
  getCurrentUser(): Observable<UserProfile> {
    return this.apiService.get<UserProfile>('/auth/profile');
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  updateProfile(profile: UpdateProfileRequest): Observable<UserProfile> {
    return this.apiService.put<UserProfile>('/auth/profile', profile)
      .pipe(
        tap(updatedUser => {
          // ✅ MAINTENANT cette méthode existe
          this.authService.setCurrentUser(updatedUser);
        })
      );
  }

  /**
   * Changer le mot de passe
   */
  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>('/auth/change-password', data);
  }

  /**
   * Demande de réinitialisation mot de passe
   */
  forgotPassword(data: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>('/auth/forgot-password', data);
  }

  /**
   * Réinitialiser le mot de passe avec token
   */
  resetPassword(data: { token: string; newPassword: string; confirmPassword: string }): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>('/auth/reset-password', data);
  }

  /**
   * Valider le token de réinitialisation
   */
  validateResetToken(token: string): Observable<{ valid: boolean }> {
    return this.apiService.post<{ valid: boolean }>('/auth/validate-reset-token', { token });
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: UserRole): boolean {
    return this.authService.hasRole(role);
  }

  /**
   * Vérifier si l'utilisateur a au moins un des rôles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  /**
   * Récupérer l'utilisateur courant depuis le cache
   */
  getCurrentUserFromCache(): UserProfile | null {
    const user = this.authService.getCurrentUser();
    return user ? this.convertUserToUserProfile(user) : null;
  }

  /**
   * Vérifier les permissions TNB spécifiques
   */
  canManageParcelles(): boolean {
    return this.hasAnyRole([UserRole.ADMIN, UserRole.TECHNICIEN_SIG]);
  }

  canGenerateFiches(): boolean {
    return this.hasAnyRole([UserRole.ADMIN, UserRole.AGENT_FISCAL]);
  }

  canManageUsers(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  canViewAudit(): boolean {
    return this.hasAnyRole([UserRole.ADMIN, UserRole.AGENT_FISCAL]);
  }

  /**
   * Convertir User vers UserProfile
   */
  private convertUserToUserProfile(user: any): UserProfile {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      profil: user.profil,
      estActif: user.estActif,
      dernierAcces: user.dernierAcces || new Date(),
      dateCreation: user.dateCreation,
      dateModification: user.dateModification
    };
  }
}