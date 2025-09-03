import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarteSigComponent } from './components/carte-sig/carte-sig.component';

const routes = [
  {
    path: '',
    component: CarteSigComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CarteSigComponent, // Import du composant standalone
    RouterModule.forChild(routes)
  ]
})
export class CartographieModule { }
