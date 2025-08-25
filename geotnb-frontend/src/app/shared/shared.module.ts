import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Composants UI Standalone
import { DataTableComponent } from './components/ui/data-table/data-table.component';
import { ModalComponent } from './components/ui/modal/modal.component';
import { LoadingSpinnerComponent } from './components/ui/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from './components/ui/status-badge/status-badge.component';
import { SearchBoxComponent } from './components/ui/search-box/search-box.component';
import { ProgressBarComponent } from './components/ui/progress-bar/progress-bar.component';
import { FileUploadComponent } from './components/ui/file-upload/file-upload.component';

// Composants Layout Standalone
import { HeaderComponent } from './components/layout/header/header.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { BreadcrumbComponent } from './components/layout/breadcrumb/breadcrumb.component';
import { FooterComponent } from './components/layout/footer/footer.component';

// Pipes Standalone
import { CurrencyMadPipe } from './pipes/currency-mad.pipe';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { SurfaceFormatPipe } from './pipes/surface-format.pipe';
import { ReferenceFoncierePipe } from './pipes/reference-fonciere.pipe';
import { CoordinateFormatPipe } from './pipes/coordinate-format.pipe';

// Directives Standalone
import { RoleAccessDirective } from './directives/role-access.directive';
import { NumericOnlyDirective } from './directives/numeric-only.directive';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { CopyToClipboardDirective } from './directives/copy-to-clipboard.directive';
import { DebounceClickDirective } from './directives/debounce-click.directive';

// Groupement des exports pour faciliter la maintenance
const LAYOUT_COMPONENTS = [
  HeaderComponent,
  SidebarComponent,
  BreadcrumbComponent,
  FooterComponent
] as const;

const UI_COMPONENTS = [
  DataTableComponent,
  ModalComponent,
  LoadingSpinnerComponent,
  StatusBadgeComponent,
  SearchBoxComponent,
  ProgressBarComponent,
  FileUploadComponent
] as const;

const PIPES = [
  CurrencyMadPipe,
  DateFormatPipe,
  FileSizePipe,
  SurfaceFormatPipe,
  ReferenceFoncierePipe,
  CoordinateFormatPipe
] as const;

const DIRECTIVES = [
  RoleAccessDirective,
  NumericOnlyDirective,
  ClickOutsideDirective,
  AutoFocusDirective,
  CopyToClipboardDirective,
  DebounceClickDirective
] as const;

const MATERIAL_MODULES = [
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatSidenavModule,
  MatListModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatDialogModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatChipsModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatCheckboxModule,
  MatTooltipModule,
  MatExpansionModule,
  MatDividerModule,
  MatBadgeModule,
  MatAutocompleteModule,
  DragDropModule
] as const;

const ANGULAR_MODULES = [
  CommonModule,
  ReactiveFormsModule,
  FormsModule
] as const;

@NgModule({
  // Dans Angular 20, avec des composants standalone, on n'a plus besoin de declarations
  imports: [
    ...ANGULAR_MODULES,
    ...MATERIAL_MODULES,
    // Import des composants, pipes et directives standalone
    ...LAYOUT_COMPONENTS,
    ...UI_COMPONENTS,
    ...PIPES,
    ...DIRECTIVES
  ],
  exports: [
    // Export des modules Angular/Material pour réutilisation
    ...ANGULAR_MODULES,
    ...MATERIAL_MODULES,
    // Export de tous nos composants, pipes et directives
    ...LAYOUT_COMPONENTS,
    ...UI_COMPONENTS,
    ...PIPES,
    ...DIRECTIVES
  ]
})
export class SharedModule { }

// Export des constantes pour utilisation externe si nécessaire
export {
  LAYOUT_COMPONENTS,
  UI_COMPONENTS,
  PIPES,
  DIRECTIVES,
  MATERIAL_MODULES,
  ANGULAR_MODULES
};