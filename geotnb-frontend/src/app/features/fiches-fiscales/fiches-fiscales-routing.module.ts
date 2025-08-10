import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FicheListComponent } from './fiche-list/fiche-list.component';
import { FicheGeneratorComponent } from './fiche-generator/fiche-generator.component';

const routes: Routes = [
  { path: '', component: FicheListComponent },
  { path: 'generate', component: FicheGeneratorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FichesFiscalesRoutingModule { }