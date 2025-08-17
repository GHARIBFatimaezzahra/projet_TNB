import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '../../layouts/auth-layout/auth-layout.component';
import { authGuard } from '../../core/guards/auth.guard';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => 
          import('./components/login/login.component')
            .then(m => m.LoginComponent),
        title: 'Connexion - Géoportail TNB Oujda',
        data: { 
          description: 'Connexion au système de gestion TNB',
          keywords: 'login, connexion, tnb, oujda'
        }
      },
      {
        path: 'register',
        loadComponent: () => 
          import('./components/register/register.component')
            .then(m => m.RegisterComponent),
        title: 'Inscription - Géoportail TNB Oujda',
        canActivate: [authGuard],
        data: { 
          roles: ['Admin'],
          description: 'Création de nouveaux comptes utilisateurs'
        }
      },
      {
        path: 'forgot-password',
        loadComponent: () => 
          import('./components/forgot-password/forgot-password.component')
            .then(m => m.ForgotPasswordComponent),
        title: 'Mot de passe oublié - Géoportail TNB Oujda',
        data: { 
          description: 'Réinitialisation du mot de passe'
        }
      },
      {
        path: 'reset-password',
        loadComponent: () => 
          import('./components/reset-password/reset-password.component')
            .then(m => m.ResetPasswordComponent),
        title: 'Réinitialiser le mot de passe - Géoportail TNB Oujda'
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            loadComponent: () => 
              import('./components/profile/profile-view/profile-view.component')
                .then(m => m.ProfileViewComponent),
            title: 'Mon Profil - Géoportail TNB Oujda',
            data: { 
              description: 'Consultation du profil utilisateur'
            }
          },
          {
            path: 'edit',
            loadComponent: () => 
              import('./components/profile/profile-edit/profile-edit.component')
                .then(m => m.ProfileEditComponent),
            title: 'Modifier le Profil - Géoportail TNB Oujda',
            data: { 
              description: 'Modification des informations de profil'
            }
          },
          {
            path: 'change-password',
            loadComponent: () => 
              import('./components/profile/change-password/change-password.component')
                .then(m => m.ChangePasswordComponent),
            title: 'Changer le Mot de Passe - Géoportail TNB Oujda',
            data: { 
              description: 'Modification du mot de passe'
            }
          }
        ]
      }
    ]
  }
];

// Configuration des routes pour le routeur principal
export default authRoutes;