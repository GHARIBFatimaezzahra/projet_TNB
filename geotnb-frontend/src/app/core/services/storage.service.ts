import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'geotnb_';

  setItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.PREFIX + key, serialized);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }

  clear(): void {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.PREFIX)
    );
    keys.forEach(key => localStorage.removeItem(key));
  }

  // Secure token storage
  setToken(token: string): void {
    this.setItem('access_token', token);
  }

  getToken(): string | null {
    return this.getItem<string>('access_token');
  }

  setRefreshToken(token: string): void {
    this.setItem('refresh_token', token);
  }

  getRefreshToken(): string | null {
    return this.getItem<string>('refresh_token');
  }

  clearTokens(): void {
    this.removeItem('access_token');
    this.removeItem('refresh_token');
    this.removeItem('user');
  }
}