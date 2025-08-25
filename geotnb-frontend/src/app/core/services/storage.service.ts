import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppConfig } from '../config/app.config';
import { User } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storageChangeSubject = new BehaviorSubject<StorageEvent | null>(null);
  public storageChange$ = this.storageChangeSubject.asObservable();

  constructor() {
    // Écouter les changements de localStorage
    window.addEventListener('storage', (event) => {
      this.storageChangeSubject.next(event);
    });
  }

  // Gestion du token JWT
  setToken(token: string): void {
    try {
      localStorage.setItem(AppConfig.auth.tokenKey, token);
      this.logStorageAction('SET_TOKEN', AppConfig.auth.tokenKey);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(AppConfig.auth.tokenKey);
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  removeToken(): void {
    try {
      localStorage.removeItem(AppConfig.auth.tokenKey);
      this.logStorageAction('REMOVE_TOKEN', AppConfig.auth.tokenKey);
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
    }
  }

  // Gestion du refresh token
  setRefreshToken(refreshToken: string): void {
    try {
      localStorage.setItem(AppConfig.auth.refreshTokenKey, refreshToken);
      this.logStorageAction('SET_REFRESH_TOKEN', AppConfig.auth.refreshTokenKey);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du refresh token:', error);
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(AppConfig.auth.refreshTokenKey);
    } catch (error) {
      console.error('Erreur lors de la récupération du refresh token:', error);
      return null;
    }
  }

  removeRefreshToken(): void {
    try {
      localStorage.removeItem(AppConfig.auth.refreshTokenKey);
      this.logStorageAction('REMOVE_REFRESH_TOKEN', AppConfig.auth.refreshTokenKey);
    } catch (error) {
      console.error('Erreur lors de la suppression du refresh token:', error);
    }
  }

  // Gestion des données utilisateur
  setUser(user: User): void {
    try {
      localStorage.setItem(AppConfig.auth.userKey, JSON.stringify(user));
      this.logStorageAction('SET_USER', AppConfig.auth.userKey, user.username);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde utilisateur:', error);
    }
  }

  getUser(): User | null {
    try {
      const userData = localStorage.getItem(AppConfig.auth.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération utilisateur:', error);
      return null;
    }
  }

  removeUser(): void {
    try {
      localStorage.removeItem(AppConfig.auth.userKey);
      this.logStorageAction('REMOVE_USER', AppConfig.auth.userKey);
    } catch (error) {
      console.error('Erreur lors de la suppression utilisateur:', error);
    }
  }

  // Stockage de données temporaires de session
  setSessionData(key: string, data: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde session ${key}:`, error);
    }
  }

  getSessionData(key: string): any {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Erreur lors de la récupération session ${key}:`, error);
      return null;
    }
  }

  removeSessionData(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression session ${key}:`, error);
    }
  }

  // Stockage de préférences utilisateur
  setPreference(key: string, value: any): void {
    try {
      localStorage.setItem(`pref_${key}`, JSON.stringify(value));
      this.logStorageAction('SET_PREFERENCE', `pref_${key}`, value);
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde préférence ${key}:`, error);
    }
  }

  getPreference(key: string, defaultValue?: any): any {
    try {
      const pref = localStorage.getItem(`pref_${key}`);
      return pref ? JSON.parse(pref) : defaultValue;
    } catch (error) {
      console.error(`Erreur lors de la récupération préférence ${key}:`, error);
      return defaultValue;
    }
  }

  removePreference(key: string): void {
    try {
      localStorage.removeItem(`pref_${key}`);
      this.logStorageAction('REMOVE_PREFERENCE', `pref_${key}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression préférence ${key}:`, error);
    }
  }

  // Cache des données avec expiration
  setCacheData(key: string, data: any, expirationMinutes: number = 30): void {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expiration: expirationMinutes * 60 * 1000
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      this.logStorageAction('SET_CACHE', `cache_${key}`, `expires in ${expirationMinutes}min`);
    } catch (error) {
      console.error(`Erreur lors de la mise en cache ${key}:`, error);
    }
  }

  getCacheData(key: string): any {
    try {
      const cacheItem = localStorage.getItem(`cache_${key}`);
      if (!cacheItem) return null;

      const parsed = JSON.parse(cacheItem);
      const now = Date.now();
      
      if (now - parsed.timestamp > parsed.expiration) {
        localStorage.removeItem(`cache_${key}`);
        this.logStorageAction('CACHE_EXPIRED', `cache_${key}`);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération cache ${key}:`, error);
      localStorage.removeItem(`cache_${key}`);
      return null;
    }
  }

  // Vérifier si une donnée est en cache et valide
  isCacheValid(key: string): boolean {
    return this.getCacheData(key) !== null;
  }

  // Invalider un cache spécifique
  invalidateCache(key: string): void {
    try {
      localStorage.removeItem(`cache_${key}`);
      this.logStorageAction('INVALIDATE_CACHE', `cache_${key}`);
    } catch (error) {
      console.error(`Erreur lors de l'invalidation cache ${key}:`, error);
    }
  }

  // Obtenir la taille de stockage utilisée
  getStorageSize(): { localStorage: number; sessionStorage: number } {
    let localSize = 0;
    let sessionSize = 0;

    try {
      // Calculer la taille de localStorage
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          localSize += localStorage[key].length + key.length;
        }
      }

      // Calculer la taille de sessionStorage
      for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          sessionSize += sessionStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Erreur lors du calcul de la taille de stockage:', error);
    }

    return {
      localStorage: localSize,
      sessionStorage: sessionSize
    };
  }

  // Obtenir les statistiques de cache
  getCacheStats(): { totalItems: number; totalSize: number; expiredItems: number } {
    let totalItems = 0;
    let totalSize = 0;
    let expiredItems = 0;
    const now = Date.now();

    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          totalItems++;
          totalSize += localStorage[key].length + key.length;
          
          try {
            const cacheItem = JSON.parse(localStorage[key]);
            if (now - cacheItem.timestamp > cacheItem.expiration) {
              expiredItems++;
            }
          } catch (e) {
            expiredItems++;
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques cache:', error);
    }

    return { totalItems, totalSize, expiredItems };
  }

  // Nettoyage complet
  clearAll(): void {
    try {
      this.removeToken();
      this.removeRefreshToken();
      this.removeUser();
      sessionStorage.clear();
      this.clearExpiredCache();
      this.logStorageAction('CLEAR_ALL');
    } catch (error) {
      console.error('Erreur lors du nettoyage complet:', error);
    }
  }

  // Nettoyage du cache expiré
  clearExpiredCache(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let clearedCount = 0;
    
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key)!);
          if (now - item.timestamp > item.expiration) {
            localStorage.removeItem(key);
            clearedCount++;
          }
        } catch (error) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      }
    });

    if (clearedCount > 0) {
      this.logStorageAction('CLEAR_EXPIRED_CACHE', '', `${clearedCount} items removed`);
    }
  }

  // Nettoyage de tout le cache
  clearAllCache(): void {
    const keys = Object.keys(localStorage);
    let clearedCount = 0;
    
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
        clearedCount++;
      }
    });

    this.logStorageAction('CLEAR_ALL_CACHE', '', `${clearedCount} items removed`);
  }

  // Sauvegarder l'état de l'application
  saveAppState(state: any): void {
    try {
      const stateData = {
        state,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem('app_state', JSON.stringify(stateData));
      this.logStorageAction('SAVE_APP_STATE');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde état application:', error);
    }
  }

  // Restaurer l'état de l'application
  restoreAppState(): any {
    try {
      const stateData = localStorage.getItem('app_state');
      if (!stateData) return null;

      const parsed = JSON.parse(stateData);
      this.logStorageAction('RESTORE_APP_STATE');
      return parsed.state;
    } catch (error) {
      console.error('Erreur lors de la restauration état application:', error);
      localStorage.removeItem('app_state');
      return null;
    }
  }

  // Vérifier la disponibilité du stockage
  isStorageAvailable(): { localStorage: boolean; sessionStorage: boolean } {
    let localStorageAvailable = false;
    let sessionStorageAvailable = false;

    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      localStorageAvailable = true;
    } catch (e) {
      localStorageAvailable = false;
    }

    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      sessionStorageAvailable = true;
    } catch (e) {
      sessionStorageAvailable = false;
    }

    return { localStorage: localStorageAvailable, sessionStorage: sessionStorageAvailable };
  }

  // Log des actions de stockage (pour debug)
  private logStorageAction(action: string, key?: string, details?: any): void {
    if (typeof console !== 'undefined' && console.debug) {
      const message = `[StorageService] ${action}`;
      if (key) {
        console.debug(message, { key, details, timestamp: new Date().toISOString() });
      } else {
        console.debug(message, { timestamp: new Date().toISOString() });
      }
    }
  }

  // Observable pour les changements de stockage
  onStorageChange(): Observable<StorageEvent | null> {
    return this.storageChange$;
  }
}