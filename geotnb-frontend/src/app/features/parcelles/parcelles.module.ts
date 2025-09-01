// =====================================================
// MODULE PARCELLES - CONFIGURATION ANGULAR
// =====================================================

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material Design
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Composants
import { ParcellesDashboardComponent } from './components/parcelles-dashboard/parcelles-dashboard.component';
import { SigInterfaceComponent } from './components/sig-interface/sig-interface.component';
import { ParcelleCreateComponent } from './components/parcelle-create/parcelle-create.component';

// Routes
const routes = [
  { path: 'dashboard', component: ParcellesDashboardComponent },
  { path: 'create', component: ParcelleCreateComponent },
  { path: 'sig', component: SigInterfaceComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' as const }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class ParcellesModule { }