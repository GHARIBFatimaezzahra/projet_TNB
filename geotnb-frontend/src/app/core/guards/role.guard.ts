// =====================================================
// GUARD RÔLES - CONTRÔLE D'ACCÈS PAR RÔLE
// =====================================================

import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { UserProfil } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const allowedRoles = route.data['roles'] as UserProfil[];
    const requiredPermissions = route.data['permissions'] as { resource: string, action: string }[];
    
    return this.checkAccess(allowedRoles, requiredPermissions, state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(childRoute, state);
  }

  private checkAccess(
    allowedRoles?: UserProfil[], 
    requiredPermissions?: { resource: string, action: string }[],
    url?: string
  ): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        // Vérification par rôles
        if (allowedRoles && allowedRoles.length > 0) {
          const hasRole = this.authService.hasPermission(...allowedRoles);
          if (!hasRole) {
            this.handleAccessDenied();
            return false;
          }
        }

        // Vérification par permissions
        if (requiredPermissions && requiredPermissions.length > 0) {
          const hasPermission = requiredPermissions.every(perm => 
            this.authService.canAccess(perm.resource, perm.action)
          );
          if (!hasPermission) {
            this.handleAccessDenied();
            return false;
          }
        }

        return true;
      })
    );
  }

  private handleAccessDenied(): void {
    this.router.navigate(['/access-denied']);
  }
}
