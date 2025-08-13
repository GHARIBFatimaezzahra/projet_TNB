import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService, ApiResponse } from './api.service';
import { StorageService } from './storage.service';
import { API_CONFIG } from '../config/api.config';

// Interfaces locales pour éviter les imports circulaires
export interface User {
  id: number;
  username: string;
  email: string;
  profil: string;
  estActif: boolean;
  dernierAcces?: Date;
  dateCreation: Date;
  dateModification?: Date;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // URL to redirect to after login
  public redirectUrl: string | null = null;

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const token = this.storageService.getToken();
    const user = this.storageService.getItem<User>('user');
    
    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.setAuthData(response.data);
            
            // Redirect to intended page or dashboard
            const redirectTo = this.redirectUrl || '/dashboard';
            this.redirectUrl = null;
            this.router.navigate([redirectTo]);
            
            return response.data;
          }
          throw new Error(response.message || 'Login failed');
        }),
        catchError(error => throwError(() => error))
      );
  }

  logout(): void {
    // Call logout endpoint
    this.apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {}).subscribe();
    
    // Clear local data
    this.clearAuthData();
    
    // Redirect to login
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storageService.getRefreshToken();
    
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return this.apiService.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
      refreshToken
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data);
        }
      }),
      map(response => response.data!),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private setAuthData(authData: AuthResponse): void {
    this.storageService.setToken(authData.accessToken);
    this.storageService.setRefreshToken(authData.refreshToken);
    this.storageService.setItem('user', authData.user);
    
    this.currentUserSubject.next(authData.user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthData(): void {
    this.storageService.clearTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.profil === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.profil) : false;
  }

  isTokenExpired(): boolean {
    const token = this.storageService.getToken();
    return !token;
  }
}