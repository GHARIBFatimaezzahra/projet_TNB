import { inject } from '@angular/core';
import { Router, type CanActivateFn, type ActivatedRouteSnapshot } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { NotificationService } from '../services/notification/notification.service';
import { UserRole } from '../models/auth/user.model';

export const rolesGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);

    return authService.currentUser$.pipe(
      take(1),
      map(user => {
        // Vérifier si l'utilisateur est connecté
        if (!user) {
          notificationService.error('Vous devez être connecté.', 'Accès refusé');
          router.navigate(['/auth/login']);
          return false;
        }

        // Vérifier si l'utilisateur a le bon rôle
        if (allowedRoles.includes(user.profil)) {
          return true;
        } else {
          notificationService.error(
            'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.',
            'Accès refusé'
          );
          router.navigate(['/unauthorized']);
          return false;
        }
      })
    );
  };
};

// Guards prédéfinis pour les rôles communs
export const adminGuard: CanActivateFn = rolesGuard([UserRole.ADMIN]);

export const fiscalGuard: CanActivateFn = rolesGuard([
  UserRole.ADMIN, 
  UserRole.AGENT_FISCAL
]);

export const sigGuard: CanActivateFn = rolesGuard([
  UserRole.ADMIN, 
  UserRole.TECHNICIEN_SIG
]);

export const readOnlyGuard: CanActivateFn = rolesGuard([
  UserRole.ADMIN, 
  UserRole.AGENT_FISCAL, 
  UserRole.TECHNICIEN_SIG, 
  UserRole.LECTEUR
]);

export const writeAccessGuard: CanActivateFn = rolesGuard([
  UserRole.ADMIN, 
  UserRole.AGENT_FISCAL, 
  UserRole.TECHNICIEN_SIG
]);