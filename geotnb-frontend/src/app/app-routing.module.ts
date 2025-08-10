import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { RoleGuard } from './core/auth/role.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'map',
        loadChildren: () => import('./features/map/map.module').then(m => m.MapModule)
      },
      {
        path: 'parcelles',
        loadChildren: () => import('./features/parcelles/parcelles.module').then(m => m.ParcellesModule),
        canActivate: [RoleGuard],
        data: { expectedRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal'] }
      },
      {
        path: 'proprietaires',
        loadChildren: () => import('./features/proprietaires/proprietaires.module').then(m => m.ProprietairesModule),
        canActivate: [RoleGuard],
        data: { expectedRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal'] }
      },
      {
        path: 'fiches-fiscales',
        loadChildren: () => import('./features/fiches-fiscales/fiches-fiscales.module').then(m => m.FichesFiscalesModule),
        canActivate: [RoleGuard],
        data: { expectedRoles: ['Admin', 'AgentFiscal'] }
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
        canActivate: [RoleGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'import',
        loadChildren: () => import('./features/import/import.module').then(m => m.ImportModule),
        canActivate: [RoleGuard],
        data: { expectedRoles: ['Admin', 'TechnicienSIG'] }
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }