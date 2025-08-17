import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { TokenService } from '../services/auth/token.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  
  // Ne pas ajouter le token pour les requêtes externes ou les endpoints d'auth
  if (!req.url.startsWith(environment.apiUrl) || isAuthEndpoint(req.url)) {
    return next(req);
  }

  const token = tokenService.getAccessToken();
  
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
};

function isAuthEndpoint(url: string): boolean {
  const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password'];
  return authEndpoints.some(endpoint => url.includes(endpoint));
}