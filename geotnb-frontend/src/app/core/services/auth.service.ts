import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { User } from '../models/database.models';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
  expires_in: number;
}

interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  profil: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  public isAuthenticated$ = this.token$.pipe(map(token => !!token && !this.isTokenExpired(token)));

  constructor(
    private api: ApiService,
    private storage: StorageService,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  // === INITIALISATION ===
  private initializeAuthState(): void {
    const token = this.storage.getToken();
    const refreshToken = this.storage.getRefreshToken();
    const user = this.storage.getUser();

    if (token && user && !this.isTokenExpired(token)) {
      this.tokenSubject.next(token);
      this.refreshTokenSubject.next(refreshToken);
      this.currentUserSubject.next(user);
    } else {
      this.clearAuthData();
    }
  }

  // === CONNEXION ===
  login(credentials: LoginCredentials): Observable<User> {
    return this.api.post<AuthResponse>('auth/login', credentials).pipe(
      tap(response => this.handleLoginSuccess(response)),
      map(response => response.user),
        catchError(error => {
        this.clearAuthData();
          return throwError(() => error);
        })
      );
  }
  
  // === DÉCONNEXION ===
  logout(): void {
    this.api.post('auth/logout', {}).subscribe({
      next: () => this.handleLogoutSuccess(),
      error: () => this.handleLogoutSuccess()
    });
  }

  // === RAFRAÎCHISSEMENT DU TOKEN ===
  refreshToken(): Observable<string> {
    const refreshToken = this.storage.getRefreshToken();
    
    if (!refreshToken) {
      this.clearAuthData();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.api.post<{ access_token: string }>('auth/refresh', { refresh_token: refreshToken }).pipe(
      tap(response => {
        this.storage.setToken(response.access_token);
        this.tokenSubject.next(response.access_token);
      }),
      map(response => response.access_token),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }
  
  // === VÉRIFICATIONS D'AUTHENTIFICATION ===
  isAuthenticated(): boolean {
    const token = this.tokenSubject.value;
    return !!token && !this.isTokenExpired(token);
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.profil === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return roles.includes(user?.profil || '');
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  // === GESTION DES DONNÉES D'AUTHENTIFICATION ===
  private handleLoginSuccess(response: AuthResponse): void {
    const { access_token, refresh_token, user } = response;

    this.storage.setToken(access_token);
    this.storage.setUser(user);
    
    if (refresh_token) {
      this.storage.setRefreshToken(refresh_token);
    }

    this.tokenSubject.next(access_token);
    this.refreshTokenSubject.next(refresh_token || null);
    this.currentUserSubject.next(user);
  }

  private handleLogoutSuccess(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  private clearAuthData(): void {
    this.storage.removeToken();
    this.storage.removeRefreshToken();
    this.storage.removeUser();
    
    this.tokenSubject.next(null);
    this.refreshTokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  // === VÉRIFICATION D'EXPIRATION DU TOKEN ===
  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    return !decoded || Date.now() >= decoded.exp * 1000;
  }

  getTokenExpiration(): Date | null {
    const token = this.tokenSubject.value;
    if (!token) return null;

    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return null;
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }
  
  getTokenRemainingTime(): number | null {
    const expiration = this.getTokenExpiration();
    if (!expiration) return null;

    return expiration.getTime() - Date.now();
  }

  // === AUTOMATIC TOKEN REFRESH ===
  autoRefreshToken(): void {
    const remainingTime = this.getTokenRemainingTime();
    
    if (remainingTime && remainingTime < 300000) { // 5 minutes
      this.refreshToken().subscribe({
        error: () => this.clearAuthData()
      });
    }
  }

  // === PROFILE MANAGEMENT ===
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.api.put<User>('auth/profile', userData).pipe(
      tap(user => {
        this.storage.setUser(user);
        this.currentUserSubject.next(user);
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.api.post<void>('auth/change-password', {
      oldPassword,
      newPassword
    });
  }

  // === MOT DE PASSE OUBLIÉ ===
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('auth/forgot-password', { email });
  }
}