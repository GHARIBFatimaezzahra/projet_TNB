// =====================================================
// ROUTING PARCELLES - ROUTES ET PROTECTION
// =====================================================

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { UnsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

// Composants
import { ParcelleListComponent } from './components/parcelle-list/parcelle-list.component';
import { ParcelleFormComponent } from './components/parcelle-form/parcelle-form.component';
import { ParcelleDetailComponent } from './components/parcelle-detail/parcelle-detail.component';

// Resolvers (à implémenter si nécessaire)
// import { ParcelleResolver } from './resolvers/parcelle.resolver';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: ParcelleListComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Liste des Parcelles',
      breadcrumb: 'Parcelles',
      requiredRoles: ['Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur']
    }
  },
  {
    path: 'new',
    component: ParcelleFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    canDeactivate: [UnsavedChangesGuard],
    data: {
      title: 'Nouvelle Parcelle',
      breadcrumb: 'Nouvelle Parcelle',
      requiredRoles: ['Admin', 'TechnicienSIG'],
      mode: 'create'
    }
  },
  {
    path: ':id',
    component: ParcelleDetailComponent,
    canActivate: [AuthGuard],
    // resolve: { parcelle: ParcelleResolver },
    data: {
      title: 'Détails Parcelle',
      breadcrumb: 'Détails',
      requiredRoles: ['Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur']
    }
  },
  {
    path: ':id/edit',
    component: ParcelleFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    canDeactivate: [UnsavedChangesGuard],
    // resolve: { parcelle: ParcelleResolver },
    data: {
      title: 'Modifier Parcelle',
      breadcrumb: 'Modifier',
      requiredRoles: ['Admin', 'TechnicienSIG'],
      mode: 'edit'
    }
  },
  {
    path: ':id/view',
    component: ParcelleFormComponent,
    canActivate: [AuthGuard],
    // resolve: { parcelle: ParcelleResolver },
    data: {
      title: 'Consulter Parcelle',
      breadcrumb: 'Consulter',
      requiredRoles: ['Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur'],
      mode: 'view'
    }
  },
  // Routes spécialisées
  {
    path: ':id/map',
    component: ParcelleDetailComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Carte Parcelle',
      breadcrumb: 'Carte',
      requiredRoles: ['Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur'],
      view: 'map'
    }
  },
  {
    path: ':id/fiscal',
    component: ParcelleDetailComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      title: 'Informations Fiscales',
      breadcrumb: 'Fiscal',
      requiredRoles: ['Admin', 'AgentFiscal'],
      view: 'fiscal'
    }
  },
  {
    path: ':id/proprietaires',
    component: ParcelleDetailComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Propriétaires',
      breadcrumb: 'Propriétaires',
      requiredRoles: ['Admin', 'AgentFiscal', 'TechnicienSIG'],
      view: 'proprietaires'
    }
  },
  {
    path: ':id/documents',
    component: ParcelleDetailComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Documents',
      breadcrumb: 'Documents',
      requiredRoles: ['Admin', 'AgentFiscal', 'TechnicienSIG'],
      view: 'documents'
    }
  },
  {
    path: ':id/history',
    component: ParcelleDetailComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      title: 'Historique',
      breadcrumb: 'Historique',
      requiredRoles: ['Admin', 'AgentFiscal'],
      view: 'history'
    }
  },
  // Routes d'actions
  {
    path: ':id/validate',
    redirectTo: ':id/edit',
    data: {
      action: 'validate'
    }
  },
  {
    path: ':id/publish',
    redirectTo: ':id/edit',
    data: {
      action: 'publish'
    }
  },
  {
    path: ':id/archive',
    redirectTo: ':id/edit',
    data: {
      action: 'archive'
    }
  },
  // Route de recherche avancée
  {
    path: 'search',
    component: ParcelleListComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Recherche Avancée',
      breadcrumb: 'Recherche',
      requiredRoles: ['Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur'],
      view: 'search'
    }
  },
  // Route de gestion en lot
  {
    path: 'bulk',
    component: ParcelleListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      title: 'Gestion en Lot',
      breadcrumb: 'Lot',
      requiredRoles: ['Admin', 'TechnicienSIG'],
      view: 'bulk'
    }
  },
  // Route d'import/export
  {
    path: 'import',
        loadChildren: () => import('../parcelles/parcelles.module').then(m => m.ParcellesModule),
    canActivate: [AuthGuard, RoleGuard],
    data: {
      title: 'Import de Parcelles',
      breadcrumb: 'Import',
      requiredRoles: ['Admin', 'TechnicienSIG']
    }
  },
  {
    path: 'export',
        loadChildren: () => import('../parcelles/parcelles.module').then(m => m.ParcellesModule),
    canActivate: [AuthGuard],
    data: {
      title: 'Export de Parcelles',
      breadcrumb: 'Export',
      requiredRoles: ['Admin', 'AgentFiscal', 'TechnicienSIG']
    }
  },
  // Route de carte globale
  {
    path: 'map',
    component: ParcelleListComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Carte des Parcelles',
      breadcrumb: 'Carte Globale',
      requiredRoles: ['Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur'],
      view: 'map'
    }
  },
  // Route de statistiques
  {
    path: 'stats',
    component: ParcelleListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      title: 'Statistiques Parcelles',
      breadcrumb: 'Statistiques',
      requiredRoles: ['Admin', 'AgentFiscal'],
      view: 'stats'
    }
  },
  // Route de rapport
  {
    path: 'reports',
        loadChildren: () => import('../parcelles/parcelles.module').then(m => m.ParcellesModule),
    canActivate: [AuthGuard, RoleGuard],
    data: {
      title: 'Rapports Parcelles',
      breadcrumb: 'Rapports',
      requiredRoles: ['Admin', 'AgentFiscal']
    }
  },
  // Route par défaut - redirection vers la liste
  {
    path: '**',
    redirectTo: 'list'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParcellesRoutingModule { 
  constructor() {
    console.log('🗺️  Routing Parcelles configuré avec succès');
  }
}