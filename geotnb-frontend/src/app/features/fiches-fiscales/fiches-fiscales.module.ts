import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FichesFiscalesRoutingModule } from './fiches-fiscales-routing.module';

import { FicheListComponent } from './fiche-list/fiche-list.component';
import { FicheGeneratorComponent } from './fiche-generator/fiche-generator.component';
import { FichePreviewComponent } from './fiche-preview/fiche-preview.component';

@NgModule({
  declarations: [
    FicheListComponent,
    FicheGeneratorComponent,
    FichePreviewComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FichesFiscalesRoutingModule
  ]
})
export class FichesFiscalesModule { }