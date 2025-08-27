// =====================================================
// INTERCEPTEUR AUTHENTIFICATION - INJECTION JWT
// =====================================================

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ajouter le token JWT aux requêtes
    const authReq = this.addTokenToRequest(req);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si erreur 401, essayer de rafraîchir le token
        if (error.status === 401 && !req.url.includes('/auth/login')) {
          return this.handle401Error(authReq, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.token;
    
    if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
      return req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return req;
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(this.authService.token);
          
          // Relancer la requête avec le nouveau token
          return next.handle(this.addTokenToRequest(req));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          // Si le refresh échoue, déconnecter l'utilisateur
          this.authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      // Si un refresh est déjà en cours, attendre qu'il se termine
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(() => next.handle(this.addTokenToRequest(req)))
      );
    }
  }
}