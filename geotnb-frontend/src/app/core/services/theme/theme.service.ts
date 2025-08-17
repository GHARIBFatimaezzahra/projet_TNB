import { Injectable, signal, effect } from '@angular/core';
import { StorageService } from '../storage/local-storage.service';

export type Theme = 'light' | 'dark' | 'auto';
export type ActualTheme = 'light' | 'dark';

export interface ThemeConfig {
  theme: Theme;
  actualTheme: ActualTheme;
  customColors?: {
    primary?: string;
    accent?: string;
    warn?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly _currentTheme = signal<Theme>('auto');
  private readonly _actualTheme = signal<ActualTheme>('light');

  // Public signals readonly
  public readonly currentTheme = this._currentTheme.asReadonly();
  public readonly actualTheme = this._actualTheme.asReadonly();

  // Media query pour détecter la préférence système
  private readonly mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

  constructor(private storageService: StorageService) {
    this.initializeTheme();
    this.setupMediaQueryListener();
    this.setupThemeEffect();
  }

  /**
   * Changer le thème
   */
  setTheme(theme: Theme): void {
    this._currentTheme.set(theme);
    this.storageService.setItem(this.THEME_KEY, theme);
    this.updateActualTheme();
  }

  /**
   * Basculer entre les thèmes
   */
  toggleTheme(): void {
    const current = this._currentTheme();
    switch (current) {
      case 'light':
        this.setTheme('dark');
        break;
      case 'dark':
        this.setTheme('light');
        break;
      case 'auto':
        // Si auto, basculer vers le contraire de l'actuel
        this.setTheme(this._actualTheme() === 'light' ? 'dark' : 'light');
        break;
    }
  }

  /**
   * Obtenir la configuration actuelle du thème
   */
  getThemeConfig(): ThemeConfig {
    return {
      theme: this._currentTheme(),
      actualTheme: this._actualTheme()
    };
  }

  /**
   * Vérifier si le thème sombre est actif
   */
  isDark(): boolean {
    return this._actualTheme() === 'dark';
  }

  /**
   * Vérifier si le thème clair est actif
   */
  isLight(): boolean {
    return this._actualTheme() === 'light';
  }

  /**
   * Vérifier si le mode auto est activé
   */
  isAuto(): boolean {
    return this._currentTheme() === 'auto';
  }

  /**
   * Appliquer des couleurs personnalisées
   */
  setCustomColors(colors: { primary?: string; accent?: string; warn?: string }): void {
    const root = document.documentElement;
    
    if (colors.primary) {
      root.style.setProperty('--primary-color', colors.primary);
    }
    if (colors.accent) {
      root.style.setProperty('--accent-color', colors.accent);
    }
    if (colors.warn) {
      root.style.setProperty('--warn-color', colors.warn);
    }

    // Sauvegarder les couleurs personnalisées
    this.storageService.setItem('custom-colors', colors);
  }

  /**
   * Réinitialiser les couleurs par défaut
   */
  resetCustomColors(): void {
    const root = document.documentElement;
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--accent-color');
    root.style.removeProperty('--warn-color');
    this.storageService.removeItem('custom-colors');
  }

  private initializeTheme(): void {
    // Récupérer le thème sauvegardé ou utiliser 'auto' par défaut
    const savedTheme = this.storageService.getItem<Theme>(this.THEME_KEY, 'auto');
    this._currentTheme.set(savedTheme || 'auto');
    this.updateActualTheme();

    // Appliquer les couleurs personnalisées si elles existent
    const customColors = this.storageService.getItem<any>('custom-colors');
    if (customColors) {
      this.setCustomColors(customColors);
    }
  }

  private updateActualTheme(): void {
    const theme = this._currentTheme();
    let actualTheme: ActualTheme;

    if (theme === 'auto') {
      actualTheme = this.mediaQueryList.matches ? 'dark' : 'light';
    } else {
      actualTheme = theme as ActualTheme;
    }

    this._actualTheme.set(actualTheme);
  }

  private setupMediaQueryListener(): void {
    this.mediaQueryList.addEventListener('change', () => {
      if (this._currentTheme() === 'auto') {
        this.updateActualTheme();
      }
    });
  }

  private setupThemeEffect(): void {
    effect(() => {
      const actualTheme = this._actualTheme();
      this.applyThemeToDOM(actualTheme);
    });
  }

  private applyThemeToDOM(theme: ActualTheme): void {
    const body = document.body;
    const root = document.documentElement;

    // Supprimer les classes de thème existantes
    body.classList.remove('light-theme', 'dark-theme');
    root.classList.remove('light-theme', 'dark-theme');

    // Ajouter la nouvelle classe de thème
    const themeClass = `${theme}-theme`;
    body.classList.add(themeClass);
    root.classList.add(themeClass);

    // Mettre à jour l'attribut data-theme pour CSS
    root.setAttribute('data-theme', theme);

    // Émettre un événement personnalisé pour informer les autres composants
    window.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme }
    }));
  }
}