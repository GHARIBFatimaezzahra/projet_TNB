import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private readonly prefix = 'tnb_session_';

  /**
   * Stockage d'un élément en session
   */
  setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(this.getKey(key), serializedValue);
    } catch (error) {
      console.error('Erreur lors du stockage en session:', error);
    }
  }

  /**
   * Récupération d'un élément de session
   */
  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = sessionStorage.getItem(this.getKey(key));
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Erreur lors de la récupération en session:', error);
      return defaultValue;
    }
  }

  /**
   * Suppression d'un élément de session
   */
  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Erreur lors de la suppression en session:', error);
    }
  }

  /**
   * Vérification de l'existence d'un élément en session
   */
  hasItem(key: string): boolean {
    return sessionStorage.getItem(this.getKey(key)) !== null;
  }

  /**
   * Nettoyage de toutes les données de session
   */
  clear(): void {
    try {
      Object.keys(sessionStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      console.error('Erreur lors du nettoyage de session:', error);
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}