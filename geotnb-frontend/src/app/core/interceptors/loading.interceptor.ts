import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  private readonly SKIP_LOADING_URLS = [
    '/notifications',
    '/heartbeat',
    '/ping'
  ];

  private readonly SKIP_LOADING_METHODS = ['GET'];

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if we should skip loading for this request
    const shouldSkipLoading = this.shouldSkipLoading(request);

    if (!shouldSkipLoading) {
      this.loadingService.show();
    }

    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Successful response received
          this.logRequest(request, event);
        }
      }),
      finalize(() => {
        if (!shouldSkipLoading) {
          this.loadingService.hide();
        }
      })
    );
  }

  private shouldSkipLoading(request: HttpRequest<any>): boolean {
    // Skip if request has specific header
    if (request.headers.has('X-Skip-Loading')) {
      return true;
    }

    // Skip for certain URLs
    if (this.SKIP_LOADING_URLS.some(url => request.url.includes(url))) {
      return true;
    }

    // Skip for certain methods on search endpoints
    if (this.SKIP_LOADING_METHODS.includes(request.method) && 
        request.url.includes('/search')) {
      return true;
    }

    return false;
  }

  private logRequest(request: HttpRequest<any>, response: HttpResponse<any>): void {
    if (!environment.production) {
      console.log(`✅ ${request.method} ${request.url}`, {
        status: response.status,
        duration: this.calculateDuration(request),
        response: response.body
      });
    }
  }

  private calculateDuration(request: HttpRequest<any>): string {
    // Simple duration calculation (would need more sophisticated implementation)
    return 'N/A';
  }
}