import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Route par défaut - redirection vers auth si pas connecté, sinon vers parcelles
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  
  // Module d'authentification
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Module parcelles (protégé par AuthGuard)
  {
    path: 'parcelles',
    loadChildren: () => import('./features/parcelles/parcelles-routing.module').then(m => m.ParcellesRoutingModule),
    canActivate: [AuthGuard]
  },
  
  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [AuthGuard]
  },
  
  // Route wildcard - redirection vers login
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];