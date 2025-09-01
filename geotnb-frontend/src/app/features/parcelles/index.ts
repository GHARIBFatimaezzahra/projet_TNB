// =====================================================
// EXPORTS PUBLICS DU MODULE PARCELLES
// =====================================================

// Components
export { ParcelleListComponent } from './components/parcelle-list/parcelle-list.component';
export { ParcelleFormComponent } from './components/parcelle-form/parcelle-form.component';
export { ParcelleDetailComponent } from './components/parcelle-detail/parcelle-detail.component';
export { ProprietaireManagerComponent } from './components/proprietaire-manager/proprietaire-manager.component';
export { DocumentManagerComponent } from './components/document-manager/document-manager.component';
export { ParcellesMainInterfaceComponent } from './components/parcelles-main-interface/parcelles-main-interface.component';

// Services
export { ParcelleService } from './services/parcelle.service';
export { ParcelleManagementService } from './services/parcelle-management.service';
export { DocumentService } from './services/document.service';

// Routes
export { parcellesRoutes } from './parcelles.routes';

// Types et interfaces
export type { ParcelleFilter, ParcelleListItem, ParcelleDetails } from './services/parcelle-management.service';