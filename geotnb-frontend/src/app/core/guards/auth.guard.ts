import { inject } from '@angular/core';
import { Router, type CanActivateFn, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { NotificationService } from '../services/notification/notification.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        // Sauvegarder l'URL de redirection
        const returnUrl = state.url;
        
        // Afficher un message d'information
        notificationService.warning(
          'Vous devez être connecté pour accéder à cette page.',
          'Authentification requise'
        );
        
        // Rediriger vers la page de connexion avec l'URL de retour
        router.navigate(['/auth/login'], { 
          queryParams: { returnUrl } 
        });
        
        return false;
      }
    })
  );
};