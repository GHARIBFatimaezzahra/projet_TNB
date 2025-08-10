import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProprietairesRoutingModule } from './proprietaires-routing.module';

import { ProprietaireListComponent } from './proprietaire-list/proprietaire-list.component';
import { ProprietaireFormComponent } from './proprietaire-form/proprietaire-form.component';

@NgModule({
  declarations: [
    ProprietaireListComponent,
    ProprietaireFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ProprietairesRoutingModule
  ]
})
export class ProprietairesModule { }