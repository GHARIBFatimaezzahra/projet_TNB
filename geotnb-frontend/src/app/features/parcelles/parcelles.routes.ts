import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { UnsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

import { ParcellesDashboardComponent } from './components/parcelles-dashboard/parcelles-dashboard.component';
import { ParcelleListComponent } from './components/parcelle-list/parcelle-list.component';
import { ParcelleFormComponent } from './components/parcelle-form/parcelle-form.component';
import { ParcelleDetailComponent } from './components/parcelle-detail/parcelle-detail.component';
import { WorkflowValidationComponent } from './components/workflow-validation/workflow-validation.component';
import { SigInterfaceComponent } from './components/sig-interface/sig-interface.component';
import { ParcellesMainInterfaceComponent } from './components/parcelles-main-interface/parcelles-main-interface.component';

export const parcellesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ParcellesDashboardComponent,
        // canActivate: [AuthGuard], // Temporairement désactivé pour les tests
        data: { 
          title: 'Dashboard des Parcelles TNB',
          breadcrumb: 'Dashboard Parcelles',
          requiredRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal', 'Lecteur']
        }
      },
      {
        path: 'dashboard',
        component: ParcellesDashboardComponent,
        canActivate: [AuthGuard],
        data: { 
          title: 'Dashboard Parcelles',
          breadcrumb: 'Dashboard',
          requiredRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal', 'Lecteur']
        }
      },
      {
        path: 'main',
        component: ParcellesMainInterfaceComponent,
        canActivate: [AuthGuard],
        data: { 
          title: 'Interface Principale des Parcelles',
          breadcrumb: 'Interface Principale',
          requiredRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal', 'Lecteur']
        }
      },
      {
        path: 'list',
        loadComponent: () => import('./components/parcelle-list/parcelle-list.component').then(m => m.ParcelleListComponent),
        canActivate: [AuthGuard],
        data: { 
          title: 'Liste des Parcelles',
          breadcrumb: 'Parcelles',
          requiredRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal', 'Lecteur']
        }
      },
      {
        path: 'new',
        component: ParcelleFormComponent,
        canActivate: [AuthGuard, RolesGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { 
          title: 'Nouvelle Parcelle',
          breadcrumb: 'Nouvelle',
          requiredRoles: ['Admin', 'TechnicienSIG'],
          mode: 'create'
        }
      },

      {
        path: 'carte',
        component: SigInterfaceComponent,
        canActivate: [AuthGuard],
        data: { 
          title: 'Carte Interactive',
          breadcrumb: 'Carte',
          requiredRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal', 'Lecteur']
        }
      },
      {
        path: 'recherche',
        component: ParcelleListComponent,
        canActivate: [AuthGuard],
        data: { 
          title: 'Recherche Avancée',
          breadcrumb: 'Recherche',
          viewMode: 'recherche',
          requiredRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal', 'Lecteur']
        }
      },
      {
        path: 'indivision',
        loadComponent: () => import('./components/indivision-management/indivision-management.component').then(m => m.IndivisionManagementComponent),
        canActivate: [AuthGuard],
        data: { 
          title: 'Gestion Indivision',
          breadcrumb: 'Indivision',
          requiredRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal']
        }
      },
      {
        path: 'import-export',
        component: ParcelleListComponent,
        canActivate: [AuthGuard, RolesGuard],
        data: { 
          title: 'Import/Export',
          breadcrumb: 'Import/Export',
          viewMode: 'import-export',
          requiredRoles: ['Admin', 'TechnicienSIG']
        }
      },
      {
        path: 'create',
        loadComponent: () => import('./components/parcelle-create/parcelle-create.component').then(m => m.ParcelleCreateComponent),
        canActivate: [AuthGuard, RolesGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { 
          title: 'Création Parcelle',
          breadcrumb: 'Création',
          requiredRoles: ['Admin', 'TechnicienSIG'],
          mode: 'create'
        }
      },
      {
        path: 'edit/:id',
        component: ParcelleFormComponent,
        canActivate: [AuthGuard, RolesGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { 
          title: 'Modifier Parcelle',
          breadcrumb: 'Modification',
          requiredRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal'],
          mode: 'edit'
        }
      },
      {
        path: 'geometry/:id',
        loadComponent: () => import('./components/geometry-editor/geometry-editor.component').then(m => m.GeometryEditorComponent),
        canActivate: [AuthGuard, RolesGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { 
          title: 'Édition Géométrie',
          breadcrumb: 'Géométrie',
          requiredRoles: ['Admin', 'TechnicienSIG']
        }
      },
      {
        path: 'detail/:id',
        component: ParcelleDetailComponent,
        canActivate: [AuthGuard],
        data: { 
          title: 'Détail Parcelle',
          breadcrumb: 'Détail',
          requiredRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal', 'Lecteur']
        }
      },
      {
        path: 'map',
        component: ParcelleListComponent,
        canActivate: [AuthGuard],
        data: { 
          title: 'Carte des Parcelles',
          breadcrumb: 'Carte',
          viewMode: 'map',
          requiredRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal', 'Lecteur']
        }
      },
      {
        path: 'validation',
        component: ParcelleListComponent,
        canActivate: [AuthGuard, RolesGuard],
        data: { 
          title: 'Validation des Parcelles',
          breadcrumb: 'Validation',
          viewMode: 'validation',
          requiredRoles: ['Admin', 'TechnicienSIG']
        }
      },
      {
        path: 'workflow/:id',
        component: WorkflowValidationComponent,
        canActivate: [AuthGuard, RolesGuard],
        data: { 
          title: 'Workflow de Validation',
          breadcrumb: 'Workflow',
          requiredRoles: ['Admin', 'TechnicienSIG']
        }
      },
      {
        path: 'sig',
        component: SigInterfaceComponent,
        canActivate: [AuthGuard],
        data: { 
          title: 'Interface SIG',
          breadcrumb: 'SIG',
          requiredRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal', 'Lecteur']
        }
      }
    ]
  }
];