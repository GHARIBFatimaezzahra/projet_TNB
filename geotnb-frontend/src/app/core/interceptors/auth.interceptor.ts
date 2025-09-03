// =====================================================
// INTERCEPTEUR AUTHENTIFICATION - INJECTION JWT
// =====================================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

// Variables globales pour gérer le refresh token
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Ajouter le token JWT aux requêtes
  const authReq = addTokenToRequest(req, authService);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si erreur 401, essayer de rafraîchir le token
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        return handle401Error(authReq, next, authService);
      }
      
      return throwError(() => error);
    })
  );
};

function addTokenToRequest(req: any, authService: AuthService): any {
  const token = authService.token;
  
  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return req;
}

function handle401Error(req: any, next: any, authService: AuthService): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(() => {
        isRefreshing = false;
        refreshTokenSubject.next(authService.token);
        
        // Relancer la requête avec le nouveau token
        return next(addTokenToRequest(req, authService));
      }),
      catchError((error) => {
        isRefreshing = false;
        // Si le refresh échoue, déconnecter l'utilisateur
        authService.logout();
        return throwError(() => error);
      })
    );
  } else {
    // Si un refresh est déjà en cours, attendre qu'il se termine
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(() => next(addTokenToRequest(req, authService)))
    );
  }
}