import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCount = 0;

  // Signal pour l'état de chargement
  public isLoading = signal<boolean>(false);

  // Observable pour compatibilité
  public isLoading$ = this.loadingSubject.asObservable();

  // Messages de chargement personnalisés
  private loadingMessage = signal<string>('Chargement...');
  public loadingMessage$ = this.loadingMessage.asReadonly();

  // =================== MÉTHODES PUBLIQUES ===================
  show(message?: string): void {
    this.loadingCount++;
    
    if (message) {
      this.loadingMessage.set(message);
    }
    
    this.updateLoadingState(true);
  }

  hide(): void {
    if (this.loadingCount > 0) {
      this.loadingCount--;
    }
    
    if (this.loadingCount === 0) {
      this.updateLoadingState(false);
      this.loadingMessage.set('Chargement...');
    }
  }

  forceHide(): void {
    this.loadingCount = 0;
    this.updateLoadingState(false);
    this.loadingMessage.set('Chargement...');
  }

  setMessage(message: string): void {
    this.loadingMessage.set(message);
  }

  // =================== MÉTHODES AVEC PROMESSES ===================
  async withLoading<T>(
    promise: Promise<T>, 
    message?: string
  ): Promise<T> {
    this.show(message);
    try {
      const result = await promise;
      this.hide();
      return result;
    } catch (error) {
      this.hide();
      throw error;
    }
  }

  // =================== GETTERS ===================
  getLoadingState(): boolean {
    return this.isLoading();
  }

  getLoadingMessage(): string {
    return this.loadingMessage();
  }

  getLoadingCount(): number {
    return this.loadingCount;
  }

  // =================== MÉTHODES PRIVÉES ===================
  private updateLoadingState(loading: boolean): void {
    this.isLoading.set(loading);
    this.loadingSubject.next(loading);
  }
}