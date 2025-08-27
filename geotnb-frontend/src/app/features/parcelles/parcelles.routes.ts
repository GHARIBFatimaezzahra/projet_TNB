import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { UnsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

import { ParcelleListComponent } from './components/parcelle-list/parcelle-list.component';
import { ParcelleFormComponent } from './components/parcelle-form/parcelle-form.component';
import { ParcelleDetailComponent } from './components/parcelle-detail/parcelle-detail.component';

export const parcellesRoutes: Routes = [
  {
    path: '',
    children: [
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
          requiredRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal', 'Lecteur']
        }
      },
      {
        path: 'create',
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
      }
    ]
  }
];