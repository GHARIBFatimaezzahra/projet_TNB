import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


import { FormatCurrencyPipe } from './pipes/format-currency.pipe';
import { FormatSurfacePipe } from './pipes/format-surface.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';

@NgModule({
  declarations: [
    FormatCurrencyPipe,
    FormatSurfacePipe,
    TruncatePipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    // Exporter les modules Angular pour les composants enfants
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    
    // Pipes
    FormatCurrencyPipe,
    FormatSurfacePipe,
    TruncatePipe
  ]
})
export class SharedModule { }