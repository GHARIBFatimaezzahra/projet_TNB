import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly prefix = 'tnb_';

  /**
   * Stockage d'un élément
   */
  setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serializedValue);
    } catch (error) {
      console.error('Erreur lors du stockage:', error);
    }
  }

  /**
   * Récupération d'un élément
   */
  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      return defaultValue;
    }
  }

  /**
   * Suppression d'un élément
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }

  /**
   * Vérification de l'existence d'un élément
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  /**
   * Nettoyage de toutes les données de l'application
   */
  clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }

  /**
   * Récupération de toutes les clés de l'application
   */
  getAllKeys(): string[] {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''));
  }

  /**
   * Taille utilisée par l'application (approximative)
   */
  getStorageSize(): number {
    let size = 0;
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          size += key.length + value.length;
        }
      });
    return size;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}
