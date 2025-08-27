// =====================================================
// MODULE PARCELLES - CONFIGURATION ANGULAR
// =====================================================

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { ParcellesRoutingModule } from './parcelles-routing.module';

// Services
import { ParcelleService } from './services/parcelle.service';
import { FiscalCalculationService } from './services/fiscal-calculation.service';
import { SpatialQueryService } from './services/spatial-query.service';
import { IndivisionService } from './services/indivision.service';

@NgModule({
  declarations: [
    // Aucune déclaration car tous les composants sont standalone
  ],
  imports: [
    CommonModule,
    ParcellesRoutingModule
  ],
  providers: [
    // Services
    ParcelleService,
    FiscalCalculationService,
    SpatialQueryService,
    IndivisionService
  ]
})
export class ParcellesModule { 
  constructor() {
    console.log('🏗️  Module Parcelles chargé avec succès');
  }
}