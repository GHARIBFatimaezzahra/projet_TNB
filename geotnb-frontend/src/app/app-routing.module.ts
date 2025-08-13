// app-routing.module.ts (VERSION CORRIGÉE)
import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { UserRole } from './core/models/enums/user-roles.enum';

// Layout Components
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { PrintLayoutComponent } from './layouts/print-layout/print-layout.component';

const routes: Routes = [
  // Redirect root to dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Auth routes (Guest only - no authentication required)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [GuestGuard],
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    data: { 
      title: 'Authentification',
      description: 'Connexion et gestion de compte'
    }
  },

  // Print layout for reports and documents
  {
    path: 'print',
    component: PrintLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'fiche/:id',
        loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
        data: { 
          title: 'Impression Fiche TNB',
          printMode: true 
        }
      },
      {
        path: 'rapport/:type',
        loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
        data: { 
          title: 'Impression Rapport',
          printMode: true 
        }
      }
    ]
  },

  // Main application routes (Authentication required)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard - Accessible à tous les utilisateurs connectés
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
        data: { 
          title: 'Tableau de bord',
          description: 'Vue d\'ensemble du système TNB',
          breadcrumb: 'Accueil'
        }
      },

      // Parcelles - Module principal (Tous sauf Lecteur)
      {
        path: 'parcelles',
        loadChildren: () => import('./features/parcelles/parcelles.module').then(m => m.ParcellesModule),
        canActivate: [RoleGuard],
        data: { 
          roles: [UserRole.ADMIN, UserRole.AGENT_FISCAL, UserRole.TECHNICIEN_SIG],
          title: 'Gestion des Parcelles',
          description: 'Gestion complète des parcelles TNB',
          breadcrumb: 'Parcelles'
        }
      },

      // Map viewer - Consultation cartographique (Tous)
      {
        path: 'map',
        loadChildren: () => import('./features/map/map.module').then(m => m.MapModule),
        data: { 
          title: 'Carte Interactive',
          description: 'Visualisation cartographique des parcelles',
          breadcrumb: 'Carte'
        }
      },

      // Propriétaires - Gestion (Tous sauf Lecteur) - IMPORT CORRIGÉ
      {
        path: 'proprietaires',
        loadChildren: () => import('./features/proprietaires/proprietaires.module').then(m => m.ProprietairesModule),
        canActivate: [RoleGuard],
        data: { 
          roles: [UserRole.ADMIN, UserRole.AGENT_FISCAL, UserRole.TECHNICIEN_SIG],
          title: 'Gestion des Propriétaires',
          description: 'Base de données des propriétaires',
          breadcrumb: 'Propriétaires'
        }
      },

      // TNB Calculation - Calculs fiscaux (Admin et Agent Fiscal)
      {
        path: 'tnb-calculation',
        loadChildren: () => import('./features/tnb-calculation/tnb-calculation.module').then(m => m.TnbCalculationModule),
        canActivate: [RoleGuard],
        data: { 
          roles: [UserRole.ADMIN, UserRole.AGENT_FISCAL],
          title: 'Calcul TNB',
          description: 'Calcul et simulation de la taxe TNB',
          breadcrumb: 'Calcul TNB'
        }
      },

      // Reports - Génération de rapports (Tous)
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
        data: { 
          title: 'Rapports et Exports',
          description: 'Génération de rapports et exports',
          breadcrumb: 'Rapports'
        }
      },

      // Data Import - Import de données SIG (Admin et Technicien SIG)
      {
        path: 'imports',
        loadChildren: () => import('./features/imports/imports.module').then(m => m.ImportsModule),
        canActivate: [RoleGuard],
        data: { 
          roles: [UserRole.ADMIN, UserRole.TECHNICIEN_SIG],
          title: 'Import de Données',
          description: 'Import de fichiers SIG et données',
          breadcrumb: 'Import'
        }
      },

      // Administration - Configuration système (Admin seulement)
      {
        path: 'administration',
        loadChildren: () => import('./features/administration/administration.module').then(m => m.AdministrationModule),
        canActivate: [RoleGuard],
        data: { 
          roles: [UserRole.ADMIN],
          title: 'Administration',
          description: 'Configuration et administration système',
          breadcrumb: 'Administration'
        }
      },

      // Profile Management - Gestion du profil utilisateur
      {
        path: 'profile',
        loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
        data: { 
          title: 'Mon Profil',
          description: 'Gestion du profil utilisateur',
          breadcrumb: 'Profil'
        }
      },

      // Help & Documentation - IMPORT CORRIGÉ
      {
        path: 'help',
        loadChildren: () => import('./features/help/help.module').then(m => m.HelpModule),
        data: { 
          title: 'Aide',
          description: 'Documentation et aide utilisateur',
          breadcrumb: 'Aide'
        }
      }
    ]
  },

  // Error pages
  {
    path: 'error',
    children: [
      {
        path: '403',
        component: AuthLayoutComponent,
        data: { 
          title: 'Accès Interdit',
          error: true 
        }
      },
      {
        path: '404',
        component: AuthLayoutComponent,
        data: { 
          title: 'Page Introuvable',
          error: true 
        }
      },
      {
        path: '500',
        component: AuthLayoutComponent,
        data: { 
          title: 'Erreur Serveur',
          error: true 
        }
      }
    ]
  },

  // Redirect unknown routes to 404
  {
    path: '404',
    component: AuthLayoutComponent,
    data: { 
      title: 'Page Introuvable',
      error: true 
    }
  },

  // Wildcard route - must be last
  {
    path: '**',
    redirectTo: '/404'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // Enable router tracing for debugging (disable in production)
      enableTracing: false,
      
      // Preload all lazy-loaded modules for better performance
      preloadingStrategy: PreloadAllModules,
      
      // Restore scroll position on route change
      scrollPositionRestoration: 'top',
      
      // Enable router anchor scrolling
      anchorScrolling: 'enabled',
      
      // Configure scroll offset for fixed headers
      scrollOffset: [0, 64],
      
      // URL matching strategy
      urlUpdateStrategy: 'eager',
      
      // Cancel navigation on error
      canceledNavigationResolution: 'computed',
      
      // OPTION SUPPRIMÉE - malformedUriErrorHandler n'existe pas dans ExtraOptions
      // malformedUriErrorHandler: (error: URIError, urlSerializer: any, url: string) => {
      //   console.error('Malformed URI:', error);
      //   return urlSerializer.parse('/404');
      // }
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// Route configuration helpers and utilities

/**
 * Interface pour les données de route personnalisées
 */
export interface CustomRouteData {
  title?: string;
  description?: string;
  breadcrumb?: string;
  roles?: UserRole[];
  printMode?: boolean;
  error?: boolean;
  hideNavigation?: boolean;
  fullWidth?: boolean;
}

/**
 * Configuration des permissions par route
 */
export const ROUTE_PERMISSIONS = {
  // Routes publiques (aucune authentification requise)
  PUBLIC: [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password'
  ],
  
  // Routes nécessitant une authentification
  AUTHENTICATED: [
    '/dashboard',
    '/map',
    '/profile',
    '/help'
  ],
  
  // Routes réservées aux administrateurs
  ADMIN_ONLY: [
    '/administration',
    '/administration/**'
  ],
  
  // Routes pour agents fiscaux et administrateurs
  FISCAL_AGENT: [
    '/tnb-calculation',
    '/tnb-calculation/**'
  ],
  
  // Routes pour techniciens SIG et administrateurs
  TECHNICAL: [
    '/imports',
    '/imports/**'
  ],
  
  // Routes en lecture seule pour tous les utilisateurs connectés
  READ_ONLY: [
    '/dashboard',
    '/map',
    '/reports',
    '/help'
  ]
};

/**
 * Configuration des titres de page
 */
export const PAGE_TITLES = {
  DEFAULT: 'GeoTNB - Gestion TNB Oujda',
  DASHBOARD: 'Tableau de bord - GeoTNB',
  PARCELLES: 'Gestion des Parcelles - GeoTNB',
  MAP: 'Carte Interactive - GeoTNB',
  PROPRIETAIRES: 'Gestion des Propriétaires - GeoTNB',
  TNB_CALCULATION: 'Calcul TNB - GeoTNB',
  REPORTS: 'Rapports et Exports - GeoTNB',
  IMPORTS: 'Import de Données - GeoTNB',
  ADMINISTRATION: 'Administration - GeoTNB',
  PROFILE: 'Mon Profil - GeoTNB',
  HELP: 'Aide - GeoTNB',
  LOGIN: 'Connexion - GeoTNB',
  ERROR_403: 'Accès Interdit - GeoTNB',
  ERROR_404: 'Page Introuvable - GeoTNB',
  ERROR_500: 'Erreur Serveur - GeoTNB'
};

/**
 * Configuration des icônes pour la navigation
 */
export const ROUTE_ICONS = {
  DASHBOARD: '📊',
  PARCELLES: '🗺️',
  MAP: '🌍',
  PROPRIETAIRES: '👥',
  TNB_CALCULATION: '💰',
  REPORTS: '📄',
  IMPORTS: '📥',
  ADMINISTRATION: '⚙️',
  PROFILE: '👤',
  HELP: '❓'
};

/**
 * Breadcrumbs configuration
 */
export const BREADCRUMB_CONFIG = {
  separator: ' / ',
  maxItems: 4,
  showHome: true,
  homeLabel: 'Accueil',
  homeIcon: '🏠'
};

/**
 * Fonction utilitaire pour vérifier les permissions
 */
export function hasRoutePermission(route: string, userRole: UserRole): boolean {
  // Vérifier si c'est une route publique
  if (ROUTE_PERMISSIONS.PUBLIC.some(path => route.startsWith(path))) {
    return true;
  }
  
  // Vérifier les permissions spécifiques selon le rôle
  switch (userRole) {
    case UserRole.ADMIN:
      return true; // L'admin a accès à tout
      
    case UserRole.AGENT_FISCAL:
      return !ROUTE_PERMISSIONS.ADMIN_ONLY.some(path => route.startsWith(path)) &&
             !ROUTE_PERMISSIONS.TECHNICAL.some(path => route.startsWith(path));
             
    case UserRole.TECHNICIEN_SIG:
      return !ROUTE_PERMISSIONS.ADMIN_ONLY.some(path => route.startsWith(path)) &&
             !ROUTE_PERMISSIONS.FISCAL_AGENT.some(path => route.startsWith(path));
             
    case UserRole.LECTEUR:
      return ROUTE_PERMISSIONS.READ_ONLY.some(path => route.startsWith(path)) ||
             ROUTE_PERMISSIONS.AUTHENTICATED.some(path => route.startsWith(path));
             
    default:
      return false;
  }
}

/**
 * Fonction pour générer le titre de page basé sur la route
 */
export function generatePageTitle(route: string, customTitle?: string): string {
  if (customTitle) {
    return `${customTitle} - GeoTNB`;
  }
  
  const titleMap: { [key: string]: string } = {
    '/dashboard': PAGE_TITLES.DASHBOARD,
    '/parcelles': PAGE_TITLES.PARCELLES,
    '/map': PAGE_TITLES.MAP,
    '/proprietaires': PAGE_TITLES.PROPRIETAIRES,
    '/tnb-calculation': PAGE_TITLES.TNB_CALCULATION,
    '/reports': PAGE_TITLES.REPORTS,
    '/imports': PAGE_TITLES.IMPORTS,
    '/administration': PAGE_TITLES.ADMINISTRATION,
    '/profile': PAGE_TITLES.PROFILE,
    '/help': PAGE_TITLES.HELP,
    '/auth/login': PAGE_TITLES.LOGIN
  };
  
  return titleMap[route] || PAGE_TITLES.DEFAULT;
}

/**
 * Service de navigation avec permissions
 */
export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  roles?: UserRole[];
  children?: NavigationItem[];
  badge?: string;
  disabled?: boolean;
}

export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    label: 'Tableau de bord',
    icon: ROUTE_ICONS.DASHBOARD,
    route: '/dashboard'
  },
  {
    label: 'Parcelles',
    icon: ROUTE_ICONS.PARCELLES,
    route: '/parcelles',
    roles: [UserRole.ADMIN, UserRole.AGENT_FISCAL, UserRole.TECHNICIEN_SIG],
    children: [
      { label: 'Liste des parcelles', icon: '📋', route: '/parcelles/list' },
      { label: 'Nouvelle parcelle', icon: '➕', route: '/parcelles/new' },
      { label: 'Import parcelles', icon: '📥', route: '/parcelles/import' }
    ]
  },
  {
    label: 'Carte',
    icon: ROUTE_ICONS.MAP,
    route: '/map'
  },
  {
    label: 'Propriétaires',
    icon: ROUTE_ICONS.PROPRIETAIRES,
    route: '/proprietaires',
    roles: [UserRole.ADMIN, UserRole.AGENT_FISCAL, UserRole.TECHNICIEN_SIG]
  },
  {
    label: 'Calcul TNB',
    icon: ROUTE_ICONS.TNB_CALCULATION,
    route: '/tnb-calculation',
    roles: [UserRole.ADMIN, UserRole.AGENT_FISCAL]
  },
  {
    label: 'Rapports',
    icon: ROUTE_ICONS.REPORTS,
    route: '/reports'
  },
  {
    label: 'Import',
    icon: ROUTE_ICONS.IMPORTS,
    route: '/imports',
    roles: [UserRole.ADMIN, UserRole.TECHNICIEN_SIG]
  },
  {
    label: 'Administration',
    icon: ROUTE_ICONS.ADMINISTRATION,
    route: '/administration',
    roles: [UserRole.ADMIN]
  },
  {
    label: 'Aide',
    icon: ROUTE_ICONS.HELP,
    route: '/help'
  }
];