import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'parcelles',
    loadChildren: () => import('./features/parcelles/parcelles.module').then(m => m.ParcellesModule)
  },
  {
    path: '',
    redirectTo: '/parcelles/dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
