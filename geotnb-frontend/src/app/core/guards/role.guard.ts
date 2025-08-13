import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserRole } from '../models/enums/user-roles.enum';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const requiredRoles = route.data['roles'] as UserRole[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return new Observable(observer => {
        observer.next(true);
        observer.complete();
      });
    }

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        const hasRequiredRole = requiredRoles.includes(user.profil as UserRole);
        
        if (!hasRequiredRole) {
          this.notificationService.error(
            'Accès refusé',
            'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.'
          );
          this.router.navigate(['/dashboard']);
          return false;
        }

        return true;
      })
    );
  }
}