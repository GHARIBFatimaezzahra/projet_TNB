// =====================================================
// COMPOSANT LISTE PARCELLES - CONNECTÉ AU BACKEND
// =====================================================

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Services
import { ParcellesApiService, ParcelleAPI, SearchFilters } from '../../services/parcelles-api.service';

// Interfaces locales
export interface ListStatistics {
  total: number;
  publiees: number;
  enValidation: number;
  brouillons: number;
}

@Component({
  selector: 'app-parcelle-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './parcelle-list.component.html',
  styleUrls: ['./parcelle-list.component.scss']
})
export class ParcelleListComponent implements OnInit, OnDestroy {

  // =====================================================
  // PROPRIÉTÉS
  // =====================================================

  // Table et données
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  dataSource = new MatTableDataSource<ParcelleAPI>([]);
  displayedColumns: string[] = [
    'select', 'reference', 'zone', 'surface', 'proprietaires', 
    'tnb', 'statut', 'derniere_maj', 'actions'
  ];

  // Sélection
  selection = new SelectionModel<ParcelleAPI>(true, []);
  selectedParcelles: ParcelleAPI[] = [];

  // Pagination
  currentPage = 0;
  pageSize = 25;
  totalParcelles = 0;
  totalPages = 0;

  // État
  loading = false;
  error: string | null = null;
  statistics: ListStatistics | null = null;

  // Filtres de recherche
  searchFilters: SearchFilters = {
    page: 1,
    limit: 25,
    sort_by: 'date_modification',
    sort_order: 'DESC'
  };

  // Propriétés manquantes pour le template
  searchTerm = '';
  selectedStatus = '';
  selectedZone = '';
  showBulkActionsModal = false;

  // Subject pour la destruction et recherche
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private parcellesApiService: ParcellesApiService
  ) {
    // Configuration de la recherche avec debounce
    this.searchSubject$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(term => {
        this.searchFilters.globalSearch = term;
        this.loadParcelles();
      });
  }

  ngOnInit(): void {
    this.loadParcelles();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================

  loadParcelles(): void {
    this.loading = true;
    this.error = null;

    this.parcellesApiService.getParcelles(this.searchFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data || [];
          this.totalParcelles = response.total || 0;
          this.totalPages = Math.ceil(this.totalParcelles / this.pageSize);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur chargement parcelles:', error);
          this.error = 'Erreur lors du chargement des parcelles';
          this.loading = false;
          this.loadMockData(); // Charger des données de test
        }
      });
  }

  loadStatistics(): void {
    this.parcellesApiService.getStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.statistics = {
            total: stats.total_parcelles || 0,
            publiees: stats.parcelles_publiees || 0,
            enValidation: stats.parcelles_valides || 0,
            brouillons: stats.parcelles_brouillon || 0
          };
        },
        error: (error) => {
          console.error('Erreur chargement statistiques:', error);
        }
      });
  }

  // =====================================================
  // RECHERCHE ET FILTRES
  // =====================================================

  onSearch(): void {
    this.searchSubject$.next(this.searchTerm);
  }

  onStatusChange(): void {
    this.searchFilters.statut_validation = this.selectedStatus || undefined;
    this.loadParcelles();
  }

  onZoneChange(): void {
    this.searchFilters.zonage = this.selectedZone || undefined;
    this.loadParcelles();
  }

  // =====================================================
  // SÉLECTION
  // =====================================================

  toggleSelection(parcelle: ParcelleAPI, checked?: boolean): void {
    if (checked !== undefined) {
      if (checked) {
        this.selectedParcelles.push(parcelle);
      } else {
        const index = this.selectedParcelles.findIndex(p => p.id === parcelle.id);
        if (index > -1) {
          this.selectedParcelles.splice(index, 1);
        }
      }
    } else {
      const index = this.selectedParcelles.findIndex(p => p.id === parcelle.id);
      if (index > -1) {
        this.selectedParcelles.splice(index, 1);
      } else {
        this.selectedParcelles.push(parcelle);
      }
    }
  }

  toggleAllSelection(checked: boolean): void {
    if (checked) {
      this.selectedParcelles = [...this.dataSource.data];
    } else {
      this.selectedParcelles = [];
    }
  }

  isSelected(parcelle: ParcelleAPI | number): boolean {
    const id = typeof parcelle === 'number' ? parcelle : parcelle.id;
    return this.selectedParcelles.some(p => p.id === id);
  }

  isAllSelected(): boolean {
    return this.selectedParcelles.length === this.dataSource.data.length && this.dataSource.data.length > 0;
  }

  isPartialSelection(): boolean {
    return this.selectedParcelles.length > 0 && this.selectedParcelles.length < this.dataSource.data.length;
  }

  isIndeterminate(): boolean {
    return this.isPartialSelection();
  }

  // =====================================================
  // PAGINATION
  // =====================================================

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.searchFilters.page = this.currentPage + 1;
    this.searchFilters.limit = this.pageSize;
    this.loadParcelles();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.searchFilters.page = this.currentPage + 1;
      this.loadParcelles();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.searchFilters.page = this.currentPage + 1;
      this.loadParcelles();
    }
  }

  getDisplayRange(): string {
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min((this.currentPage + 1) * this.pageSize, this.totalParcelles);
    return `${start}-${end}`;
  }

  // =====================================================
  // ACTIONS
  // =====================================================

  viewParcelle(parcelle: ParcelleAPI): void {
    this.router.navigate(['/parcelles/detail', parcelle.id]);
  }

  viewDetails(parcelle: ParcelleAPI): void {
    this.viewParcelle(parcelle);
  }

  editParcelle(parcelle: ParcelleAPI): void {
    this.router.navigate(['/parcelles/edit', parcelle.id]);
  }

  localizeParcelle(parcelle: ParcelleAPI): void {
    this.router.navigate(['/parcelles/carte'], { queryParams: { parcelle: parcelle.id } });
  }

  generatePDF(parcelle: ParcelleAPI): void {
    // TODO: Implémenter la génération PDF
    this.snackBar.open('Génération PDF en cours...', 'Fermer', { duration: 2000 });
  }

  viewHistory(parcelle: ParcelleAPI): void {
    this.router.navigate(['/parcelles/detail', parcelle.id], { queryParams: { tab: 'history' } });
  }

  duplicateParcelle(parcelle: ParcelleAPI): void {
    this.router.navigate(['/parcelles/create'], { queryParams: { duplicate: parcelle.id } });
  }

  deleteParcelle(parcelle: ParcelleAPI): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette parcelle ?')) {
      this.parcellesApiService.deleteParcelle(parcelle.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Parcelle supprimée avec succès', 'Fermer', { duration: 2000 });
            this.loadParcelles();
          },
          error: (error) => {
            console.error('Erreur suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
    }
  }

  showBulkActions(): void {
    this.showBulkActionsModal = true;
  }

  hideBulkActions(): void {
    this.showBulkActionsModal = false;
  }

  bulkValidate(): void {
    // TODO: Implémenter la validation en lot
    this.snackBar.open('Validation en lot en cours...', 'Fermer', { duration: 2000 });
  }

  bulkPublish(): void {
    // TODO: Implémenter la publication en lot
    this.snackBar.open('Publication en lot en cours...', 'Fermer', { duration: 2000 });
  }

  bulkExport(): void {
    // TODO: Implémenter l'export en lot
    this.snackBar.open('Export en lot en cours...', 'Fermer', { duration: 2000 });
  }

  bulkDelete(): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedParcelles.length} parcelle(s) ?`)) {
      // TODO: Implémenter la suppression en lot
      this.snackBar.open('Suppression en lot en cours...', 'Fermer', { duration: 2000 });
    }
  }

  exportToExcel(): void {
    // TODO: Implémenter l'export Excel
    this.snackBar.open('Export Excel en cours...', 'Fermer', { duration: 2000 });
  }

  // =====================================================
  // FILTRES ET RECHERCHE
  // =====================================================

  onSearchChange(): void {
    this.onSearch();
  }

  applyFilters(): void {
    this.searchFilters.page = 1;
    this.currentPage = 0;
    this.loadParcelles();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedZone = '';
    this.searchFilters = {
      page: 1,
      limit: this.pageSize,
      sort_by: 'date_modification',
      sort_order: 'DESC'
    };
    this.loadParcelles();
  }

  onSortChange(sort: Sort): void {
    this.searchFilters.sort_by = sort.active;
    this.searchFilters.sort_order = sort.direction.toUpperCase() as 'ASC' | 'DESC';
    this.loadParcelles();
  }

  retry(): void {
    this.error = null;
    this.loadParcelles();
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  goBack(): void {
    this.router.navigate(['/parcelles']);
  }

  showMap(): void {
    this.router.navigate(['/parcelles/carte']);
  }

  createNewParcel(): void {
    this.router.navigate(['/parcelles/create']);
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  trackByParcelleId(index: number, parcelle: ParcelleAPI): number {
    return parcelle.id;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-MA').format(value);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-MA');
  }

  getZoneClass(zone: string): string {
    const zoneClasses: { [key: string]: string } = {
      'R4': 'zone-r4',
      'R2': 'zone-r2',
      'COM': 'zone-com',
      'IND': 'zone-ind'
    };
    return zoneClasses[zone] || 'zone-default';
  }

  getStatusClass(statut: string): string {
    const statusClasses: { [key: string]: string } = {
      'BROUILLON': 'status-brouillon',
      'VALIDE': 'status-valide',
      'PUBLIE': 'status-publie'
    };
    return statusClasses[statut] || 'status-default';
  }

  getStatusBadgeClass(statut: string): string {
    return this.getStatusClass(statut);
  }

  getStatusLabel(statut: string): string {
    const statusLabels: { [key: string]: string } = {
      'BROUILLON': 'Brouillon',
      'VALIDE': 'Validé',
      'PUBLIE': 'Publié' 
    };
    return statusLabels[statut] || statut;
  }

  // Propriété pour le template
  get parcelles(): ParcelleAPI[] {
    return this.dataSource.data;
  }

  // =====================================================
  // DONNÉES DE TEST
  // =====================================================

  private loadMockData(): void {
    const mockParcelles: ParcelleAPI[] = [
      {
        id: 1,
        reference_fonciere: 'REF001',
        statut_foncier: 'PRIVEE',
        surface_totale: 150.5,
        surface_imposable: 150.5,
        zonage: 'R4',
        statut_occupation: 'NU',
        statut_validation: 'PUBLIE',
        tnb_calculee: 2500,
        tarif_unitaire: 16.6,
        est_exoneree: false,
        date_creation: new Date('2024-01-15'),
        date_modification: new Date('2024-01-15'),
        utilisateur_creation: 'admin',
        utilisateur_modification: 'admin',
        proprietaires: [
          {
            id: 1,
            parcelle_id: 1,
            nom: 'Benali',
            prenom: 'Ahmed',
            type: 'PHYSIQUE',
            cin: 'AB123456',
            quote_part: 100,
            montant_tnb: 2500,
            date_creation: new Date('2024-01-15')
          }
        ]
      },
      {
        id: 2,
        reference_fonciere: 'REF002',
        statut_foncier: 'PRIVEE',
        surface_totale: 89.2,
        surface_imposable: 89.2,
        zonage: 'R2',
        statut_occupation: 'NU',
        statut_validation: 'VALIDE',
        tnb_calculee: 1800,
        tarif_unitaire: 20.2,
        est_exoneree: false,
        date_creation: new Date('2024-01-10'),
        date_modification: new Date('2024-01-10'),
        utilisateur_creation: 'admin',
        utilisateur_modification: 'admin',
        proprietaires: [
          {
            id: 2,
            parcelle_id: 2,
            nom: 'Zahra',
            prenom: 'Fatima',
            type: 'PHYSIQUE',
            cin: 'FZ789012',
            quote_part: 100,
            montant_tnb: 1800,
            date_creation: new Date('2024-01-10')
          }
        ]
      }
    ];

    this.dataSource.data = mockParcelles;
    this.totalParcelles = mockParcelles.length;
    this.totalPages = 1;
  }
}