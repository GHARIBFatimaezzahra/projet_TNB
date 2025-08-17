import { Injectable } from '@angular/core';
import { StorageService } from '../storage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'tnb_access_token';
  private readonly REFRESH_TOKEN_KEY = 'tnb_refresh_token';

  constructor(private storageService: StorageService) {}

  /**
   * Stockage des tokens
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    this.storageService.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      this.storageService.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Récupération du token d'accès
   */
  getAccessToken(): string | null {
    return this.storageService.getItem<string>(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Récupération du refresh token
   */
  getRefreshToken(): string | null {
    return this.storageService.getItem<string>(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Suppression des tokens
   */
  clearTokens(): void {
    this.storageService.removeItem(this.ACCESS_TOKEN_KEY);
    this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Vérification de la validité du token
   */
  hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Vérification si le token expire bientôt (dans les 10 prochaines minutes)
   */
  isTokenExpiringSoon(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      const expirationTime = payload.exp * 1000;
      const tenMinutesFromNow = Date.now() + (10 * 60 * 1000);
      return expirationTime <= tenMinutesFromNow;
    } catch {
      return true;
    }
  }

  /**
   * Récupération de la date d'expiration
   */
  getTokenExpirationTime(): Date | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payload = this.decodeToken(token);
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Décodage du token JWT
   */
  private decodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token');
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }
}