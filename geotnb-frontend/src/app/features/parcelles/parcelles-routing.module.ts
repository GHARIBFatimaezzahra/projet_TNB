import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParcelleListComponent } from './parcelle-list/parcelle-list.component';
import { ParcelleFormComponent } from './parcelle-form/parcelle-form.component';
import { ParcelleDetailComponent } from './parcelle-detail/parcelle-detail.component';

const routes: Routes = [
  { path: '', component: ParcelleListComponent },
  { path: 'new', component: ParcelleFormComponent },
  { path: ':id', component: ParcelleDetailComponent },
  { path: ':id/edit', component: ParcelleFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParcellesRoutingModule { }