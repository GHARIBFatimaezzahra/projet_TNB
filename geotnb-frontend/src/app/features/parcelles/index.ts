// Module principal
export { ParcellesModule } from './parcelles.module';

// Composants
export { ParcelleListComponent } from './components/parcelle-list/parcelle-list.component';
export { ParcelleFormComponent } from './components/parcelle-form/parcelle-form.component';
export { ParcelleDetailComponent } from './components/parcelle-detail/parcelle-detail.component';

// Services
export { ParcelleService } from './services/parcelle.service';
export { FiscalCalculationService } from './services/fiscal-calculation.service';
export { MapService } from './services/map.service';

// Pipes
export { CoordinateFormatPipe } from './pipes/coordinate-format.pipe';

// Validators
export { QuotePartValidator } from './validators/quote-part.validator';

// Routes
export { parcellesRoutes } from './parcelles.routes';

// Interfaces et types
export * from './services/fiscal-calculation.service';
