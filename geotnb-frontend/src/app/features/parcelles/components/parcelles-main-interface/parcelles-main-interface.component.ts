import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';

// Services
import { ParcellesApiService } from '../../services/parcelles-api.service';

@Component({
  selector: 'app-parcelles-main-interface',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule
  ],
  templateUrl: './parcelles-main-interface.component.html',
  styleUrls: ['./parcelles-main-interface.component.scss']
})
export class ParcellesMainInterfaceComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Interface active
  activeInterface: 'carte' | 'recherche' | 'liste' | 'creation' | 'indivision' | 'import-export' | 'detail' = 'carte';
  
  // Données de recherche
  searchCriteria = {
    reference: '',
    statut_foncier: '',
    zonage: '',
    surface_min: null as number | null,
    surface_max: null as number | null,
    proprietaire: ''
  };
  
  // Données des parcelles (sans exemples pré-remplis)
  parcelles: any[] = [];
  proprietaires: any[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Filtres
  filters = {
    statut_foncier: '',
    zonage: '',
    statut_occupation: ''
  };
  
  // Tri
  sortColumn = 'reference';
  sortDirection = 'asc';
  
  // État de chargement
  loading = false;
  
  // Messages
  successMessage = '';
  errorMessage = '';

  // Math object accessible dans le template
  Math = Math;

  constructor(
    private router: Router,
    private parcellesApiService: ParcellesApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadParcelles();
    this.loadProprietaires();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Navigation entre interfaces
  navigateToInterface(interfaceName: string): void {
    this.activeInterface = interfaceName as any;
    this.clearMessages();
  }

  // Chargement des données
  loadParcelles(): void {
    this.loading = true;
    // Ici vous appelleriez votre service API
    // this.parcellesApiService.getParcelles().subscribe(...)
    this.loading = false;
  }

  loadProprietaires(): void {
    // Ici vous appelleriez votre service API pour les propriétaires
  }

  // Recherche
  searchParcelles(): void {
    this.loading = true;
    // Logique de recherche
    this.loading = false;
  }

  // Effacer la recherche
  clearSearch(): void {
    this.searchCriteria = {
      reference: '',
      statut_foncier: '',
      zonage: '',
      surface_min: null,
      surface_max: null,
      proprietaire: ''
    };
  }

  // Filtrage
  applyFilters(): void {
    this.currentPage = 1;
    this.loadParcelles();
  }

  // Tri
  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadParcelles();
  }

  // Pagination
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadParcelles();
  }

  // Actions sur les parcelles
  createParcelle(): void {
    this.router.navigate(['/parcelles/create']);
  }

  editParcelle(id: number): void {
    this.router.navigate(['/parcelles/edit', id]);
  }

  viewParcelle(id: number): void {
    this.router.navigate(['/parcelles/detail', id]);
  }

  deleteParcelle(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette parcelle ?')) {
      // Logique de suppression
      this.showSuccess('Parcelle supprimée avec succès');
    }
  }

  // Gestion des propriétaires
  addProprietaire(): void {
    // Logique d'ajout de propriétaire
  }

  editProprietaire(id: number): void {
    // Logique de modification de propriétaire
  }

  // Import/Export
  importData(): void {
    // Logique d'import
  }

  exportData(): void {
    // Logique d'export
  }

  // Calculs pour l'indivision
  getTotalQuoteParts(): number {
    return this.proprietaires.reduce((total, prop) => total + prop.quote_part, 0) * 100;
  }

  getTotalTNB(): number {
    return this.proprietaires.reduce((total, prop) => total + (prop.montant_tnb || 0), 0);
  }

  // Utilitaires
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.snackBar.open(message, 'Fermer', { duration: 3000 });
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.snackBar.open(message, 'Fermer', { duration: 5000 });
  }

  // Formatage des données
  formatNumber(value: number): string {
    return value.toLocaleString('fr-FR');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // Validation
  isFormValid(): boolean {
    // Logique de validation selon l'interface active
    return true;
  }
}
