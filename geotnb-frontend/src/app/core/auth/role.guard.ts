import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['expectedRoles'] as string[];
    
    if (!expectedRoles || expectedRoles.length === 0) {
      return true;
    }

    if (this.authService.hasAnyRole(expectedRoles)) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}