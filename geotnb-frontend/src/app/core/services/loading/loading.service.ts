import { Injectable, signal } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number; // 0-100
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Signal pour la réactivité moderne
  private readonly _isLoading = signal<boolean>(false);
  private readonly _loadingMessage = signal<string>('');
  private readonly _loadingProgress = signal<number>(0);

  // BehaviorSubject pour la compatibilité
  private readonly loadingSubject = new BehaviorSubject<LoadingState>({
    isLoading: false
  });

  // Public observables et signals
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly loadingMessage = this._loadingMessage.asReadonly();
  public readonly loadingProgress = this._loadingProgress.asReadonly();

  // Compteur pour gérer plusieurs requêtes simultanées
  private activeRequests = 0;
  private loadingStack: string[] = [];

  /**
   * Démarrer le loading
   */
  show(message = 'Chargement en cours...', progress?: number): void {
    this.activeRequests++;
    this.loadingStack.push(message);
    
    this.updateLoadingState(true, message, progress);
  }

  /**
   * Arrêter le loading
   */
  hide(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
      this.loadingStack.pop();
    }

    if (this.activeRequests === 0) {
      this.updateLoadingState(false);
    } else {
      // Afficher le message du loading précédent dans la pile
      const currentMessage = this.loadingStack[this.loadingStack.length - 1] || 'Chargement en cours...';
      this.updateLoadingState(true, currentMessage);
    }
  }

  /**
   * Forcer l'arrêt de tous les loadings
   */
  hideAll(): void {
    this.activeRequests = 0;
    this.loadingStack = [];
    this.updateLoadingState(false);
  }

  /**
   * Mise à jour du progrès
   */
  updateProgress(progress: number, message?: string): void {
    if (this._isLoading()) {
      this._loadingProgress.set(Math.max(0, Math.min(100, progress)));
      if (message) {
        this._loadingMessage.set(message);
      }
      this.emitLoadingState();
    }
  }

  /**
   * Loading avec progrès automatique
   */
  showWithProgress(message = 'Chargement en cours...', duration = 2000): void {
    this.show(message, 0);
    
    const interval = 50; // Mise à jour toutes les 50ms
    const increment = (interval / duration) * 100;
    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
        setTimeout(() => this.hide(), 200);
      }
      this.updateProgress(currentProgress);
    }, interval);
  }

  /**
   * Wrapper pour exécuter une action avec loading
   */
  async withLoading<T>(
    asyncFunction: () => Promise<T>,
    message = 'Chargement en cours...'
  ): Promise<T> {
    this.show(message);
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      this.hide();
    }
  }

  /**
   * Wrapper pour Observable avec loading
   */
  withLoadingObservable<T>(
    observable: Observable<T>,
    message = 'Chargement en cours...'
  ): Observable<T> {
    return new Observable<T>(subscriber => {
      this.show(message);
      
      const subscription = observable.subscribe({
        next: value => subscriber.next(value),
        error: error => {
          this.hide();
          subscriber.error(error);
        },
        complete: () => {
          this.hide();
          subscriber.complete();
        }
      });

      return () => {
        this.hide();
        subscription.unsubscribe();
      };
    });
  }

  /**
   * Vérifier si le loading est actif
   */
  isActive(): boolean {
    return this._isLoading();
  }

  /**
   * Obtenir le nombre de requêtes actives
   */
  getActiveRequestsCount(): number {
    return this.activeRequests;
  }

  private updateLoadingState(isLoading: boolean, message = '', progress = 0): void {
    this._isLoading.set(isLoading);
    this._loadingMessage.set(message);
    this._loadingProgress.set(progress);
    this.emitLoadingState();
  }

  private emitLoadingState(): void {
    this.loadingSubject.next({
      isLoading: this._isLoading(),
      message: this._loadingMessage(),
      progress: this._loadingProgress()
    });
  }
}