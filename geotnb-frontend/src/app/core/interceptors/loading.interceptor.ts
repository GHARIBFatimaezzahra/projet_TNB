import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip loading for certain requests
    if (this.shouldSkipLoading(request)) {
      return next.handle(request);
    }

    // Show loading
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.loadingService.show();
    }

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Request completed successfully
        }
      }),
      finalize(() => {
        // Hide loading when request completes (success or error)
        this.activeRequests--;
        if (this.activeRequests === 0) {
          this.loadingService.hide();
        }
      })
    );
  }

  private shouldSkipLoading(request: HttpRequest<any>): boolean {
    // Skip loading for certain endpoints
    const skipPatterns = [
      '/auth/refresh',
      '/dashboard/stats', // Real-time stats
      '/map/features'     // Map data
    ];

    return skipPatterns.some(pattern => request.url.includes(pattern)) ||
           request.headers.has('skip-loading');
  }
}