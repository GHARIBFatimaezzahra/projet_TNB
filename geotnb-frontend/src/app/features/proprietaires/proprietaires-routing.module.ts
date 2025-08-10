import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProprietaireListComponent } from './proprietaire-list/proprietaire-list.component';
import { ProprietaireFormComponent } from './proprietaire-form/proprietaire-form.component';

const routes: Routes = [
  { path: '', component: ProprietaireListComponent },
  { path: 'new', component: ProprietaireFormComponent },
  { path: ':id/edit', component: ProprietaireFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProprietairesRoutingModule { }