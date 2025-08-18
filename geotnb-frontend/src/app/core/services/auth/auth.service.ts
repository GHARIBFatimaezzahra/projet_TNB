import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, map, catchError, of, timer } from 'rxjs';
import { ApiService } from '../api/api.service';
import { TokenService } from './token.service';
import { StorageService } from '../storage/local-storage.service';
import { API_ENDPOINTS } from '../api/endpoints.constants';
import { User, UserRole } from '../../models/auth/user.model';
import { LoginRequest, LoginResponse, RegisterRequest } from '../../models/auth/login-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly tokenService = inject(TokenService);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  // Signals pour la réactivité
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _isLoading = signal<boolean>(false);

  // Observables pour la compatibilité
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Public signals (readonly)
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();

  // Timer pour le refresh automatique
  private refreshTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.initializeAuth();
    this.setupTokenRefresh();
  }

  /**
   * Connexion utilisateur
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this._isLoading.set(true);
    
    return this.apiService.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response);
          this.scheduleTokenRefresh();
        }),
        catchError(error => {
          this._isLoading.set(false);
          throw error;
        })
      );
  }

  /**
   * Inscription utilisateur
   */
  register(userData: RegisterRequest): Observable<User> {
    return this.apiService.post<User>(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  /**
   * Déconnexion
   */
  logout(): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.AUTH.LOGOUT, {})
      .pipe(
        tap(() => this.performLogout()),
        catchError(() => {
          // Même en cas d'erreur, on déconnecte localement
          this.performLogout();
          return of(null);
        })
      );
  }

  /**
   * Vérification du token
   */
  verifyToken(): Observable<boolean> {
    if (!this.tokenService.hasValidToken()) {
      return of(false);
    }

    return this.apiService.get<{ valid: boolean; user?: User }>(API_ENDPOINTS.AUTH.VERIFY)
      .pipe(
        map(response => {
          if (response.valid && response.user) {
            this.setUserData(response.user);
            return true;
          }
          this.performLogout();
          return false;
        }),
        catchError(() => {
          this.performLogout();
          return of(false);
        })
      );
  }

  /**
   * Rafraîchissement du token
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      this.performLogout();
      throw new Error('No refresh token available');
    }

    return this.apiService.post<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH, { 
      refreshToken 
    }).pipe(
      tap(response => {
        this.setAuthData(response);
        this.scheduleTokenRefresh();
      }),
      catchError(error => {
        this.performLogout();
        throw error;
      })
    );
  }

  /**
   * Mise à jour du profil
   */
  updateProfile(profileData: Partial<User>): Observable<User> {
    return this.apiService.put<User>(API_ENDPOINTS.AUTH.PROFILE, profileData)
      .pipe(
        tap(user => this.setUserData(user))
      );
  }

  /**
   * Changement de mot de passe
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword
    });
  }

  /**
   * Mot de passe oublié
   */
  forgotPassword(request: { email: string }): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, request);
  }


  /**
   * Réinitialisation mot de passe
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword
    });
  }

  /**
   * Vérification des rôles
   */
  hasRole(role: UserRole): boolean {
    const user = this._currentUser();
    return user?.profil === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this._currentUser();
    return user ? roles.includes(user.profil) : false;
  }

  hasPermission(permission: string): boolean {
    const user = this._currentUser();
    // Implémentation des permissions granulaires si nécessaire
    return user?.estActif || false;
  }

  /**
   * Vérification de l'accès aux fonctionnalités
   */
  canAccess(requiredRoles: UserRole[], requiredPermissions?: string[]): boolean {
    // Vérifier les rôles
    if (requiredRoles.length > 0 && !this.hasAnyRole(requiredRoles)) {
      return false;
    }

    // Vérifier les permissions si spécifiées
    if (requiredPermissions && requiredPermissions.length > 0) {
      return requiredPermissions.every(permission => this.hasPermission(permission));
    }

    return true;
  }

  /**
   * Définir l'utilisateur courant (pour compatibilité)
   */
  setCurrentUser(user: User): void {
    this.setUserData(user);
  }

  /**
   * Getters pour compatibilité
   */
  getCurrentUser(): User | null {
    return this._currentUser();
  }

  isLoggedIn(): boolean {
    return this._isAuthenticated();
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return this._isAuthenticated();
  }

  // === Méthodes privées ===

  private initializeAuth(): void {
    const user = this.storageService.getItem<User>('currentUser');
    const hasValidToken = this.tokenService.hasValidToken();
    
    if (user && hasValidToken) {
      this.setUserData(user);
      this.scheduleTokenRefresh();
    }
  }

  private setAuthData(response: LoginResponse): void {
    this.tokenService.setTokens(response.access_token, response.refresh_token);
    this.setUserData(response.user);
    this._isLoading.set(false);
  }

  private setUserData(user: User): void {
    this._currentUser.set(user);
    this._isAuthenticated.set(true);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.storageService.setItem('currentUser', user);
  }

  private performLogout(): void {
    this.tokenService.clearTokens();
    this.storageService.removeItem('currentUser');
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this._isLoading.set(false);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    this.router.navigate(['/auth/login']);
  }

  private setupTokenRefresh(): void {
    // Actualiser le token toutes les 50 minutes (token expire en 1h)
    timer(0, 50 * 60 * 1000).subscribe(() => {
      if (this._isAuthenticated() && this.tokenService.isTokenExpiringSoon()) {
        this.refreshToken().subscribe({
          error: () => this.performLogout()
        });
      }
    });
  }

  private scheduleTokenRefresh(): void {
    const expirationTime = this.tokenService.getTokenExpirationTime();
    if (expirationTime) {
      const refreshTime = expirationTime.getTime() - Date.now() - (10 * 60 * 1000); // 10 min avant expiration
      
      if (refreshTime > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refreshToken().subscribe({
            error: () => this.performLogout()
          });
        }, refreshTime);
      }
    }
  }
}