import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCountSubject = new BehaviorSubject<number>(0);

  public loading$ = this.loadingSubject.asObservable();
  public loadingCount$ = this.loadingCountSubject.asObservable();

  show(): void {
    const currentCount = this.loadingCountSubject.value;
    this.loadingCountSubject.next(currentCount + 1);
    this.loadingSubject.next(true);
  }

  hide(): void {
    const currentCount = this.loadingCountSubject.value;
    const newCount = Math.max(0, currentCount - 1);
    this.loadingCountSubject.next(newCount);
    
    if (newCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  setLoading(loading: boolean): void {
    if (loading) {
      this.show();
    } else {
      this.hide();
    }
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  forceHide(): void {
    this.loadingCountSubject.next(0);
    this.loadingSubject.next(false);
  }
}