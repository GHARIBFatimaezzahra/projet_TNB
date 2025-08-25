import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private apiService: ApiService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Ignorer les requêtes de monitoring
    if (request.url.includes('health') || request.url.includes('ping')) {
      return next.handle(request);
    }

    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.apiService.isLoading$.subscribe(isLoading => {
        if (!isLoading) {
          // Déclencher le loading via le service API
          (this.apiService as any).startLoading();
        }
      });
    }

    return next.handle(request).pipe(
      finalize(() => {
        this.activeRequests--;
        if (this.activeRequests === 0) {
          (this.apiService as any).stopLoading();
        }
      })
    );
  }
}