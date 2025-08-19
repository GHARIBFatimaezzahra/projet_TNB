import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent),
    title: 'Connexion | TNB Géoportail Oujda'
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/register/register.component').then(c => c.RegisterComponent),
    title: 'Inscription | TNB Géoportail Oujda'
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent),
    title: 'Mot de passe oublié | TNB Géoportail Oujda'
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/reset-password/reset-password.component').then(c => c.ResetPasswordComponent),
    title: 'Réinitialiser mot de passe | TNB Géoportail Oujda'
  }
]