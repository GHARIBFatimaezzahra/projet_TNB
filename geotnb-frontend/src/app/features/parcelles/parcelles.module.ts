import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ParcellesRoutingModule } from './parcelles-routing.module';

import { ParcelleListComponent } from './parcelle-list/parcelle-list.component';
import { ParcelleFormComponent } from './parcelle-form/parcelle-form.component';
import { ParcelleDetailComponent } from './parcelle-detail/parcelle-detail.component';

@NgModule({
  declarations: [
    ParcelleListComponent,
    ParcelleFormComponent,
    ParcelleDetailComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ParcellesRoutingModule
  ]
})
export class ParcellesModule { }