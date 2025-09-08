// =====================================================
// COMPOSANT LISTE PARCELLES - CONNECTÉ AU BACKEND
// =====================================================

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
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
import { takeUntil, debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

// Services
import { ParcellesApiService, ParcelleAPI, SearchFilters } from '../../services/parcelles-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserProfil } from '../../../../core/models/database.models';

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
    sortBy: 'referenceFonciere',
    sortOrder: 'ASC'
  };

  // Propriétés manquantes pour le template
  searchTerm = '';
  selectedStatus = '';
  selectedZone = '';
  selectedStatutFoncier = '';
  showBulkActionsModal = false;

  // Subject pour la destruction et recherche
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private parcellesApiService: ParcellesApiService,
    private authService: AuthService
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
    
    // Recharger les données quand on navigue vers cette page
    this.router.events.pipe(
      takeUntil(this.destroy$),
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadParcelles();
      this.loadStatistics();
    });
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

    // Filtrer automatiquement les parcelles archivées (supprimées)
    const filtersWithExclusions = {
      ...this.searchFilters,
      excludeArchived: true // Nouveau filtre pour exclure les parcelles archivées
    };

    console.log('Chargement des parcelles avec filtres:', filtersWithExclusions);
    console.log('URL API appelée:', `${this.parcellesApiService['apiUrl']}`);

    this.parcellesApiService.getParcelles(filtersWithExclusions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Réponse API parcelles complète:', response);
          console.log('Type de réponse:', typeof response);
          console.log('Propriétés de la réponse:', Object.keys(response || {}));
          console.log('Nombre de parcelles reçues:', response.data?.length || 0);
          console.log('Total parcelles:', response.total || 0);
          console.log('Page actuelle:', response.page || 'non définie');
          console.log('Limite par page:', response.limit || 'non définie');
          
          if (response.data && response.data.length > 0) {
            console.log('Première parcelle reçue:', response.data[0]);
            this.dataSource.data = response.data || [];
            this.totalParcelles = response.total || 0;
          } else {
            console.log('Aucune parcelle reçue de l\'API');
            this.dataSource.data = [];
            this.totalParcelles = 0;
          }
          
          this.totalPages = Math.ceil(this.totalParcelles / this.pageSize);
          this.loading = false;
          
          console.log('Données assignées à dataSource:', this.dataSource.data.length);
          console.log('Total parcelles assigné:', this.totalParcelles);
        },
        error: (error) => {
          console.error('Erreur chargement parcelles:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Error body:', error.error);
          this.error = 'Erreur lors du chargement des parcelles';
          this.loading = false;
          this.dataSource.data = [];
          this.totalParcelles = 0;
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
    this.searchFilters.etatValidation = this.selectedStatus || undefined;
    this.loadParcelles();
  }

  onZoneChange(): void {
    this.searchFilters.zonage = this.selectedZone || undefined;
    this.loadParcelles();
  }

  onStatutFoncierChange(): void {
    this.searchFilters.statutFoncier = this.selectedStatutFoncier || undefined;
    this.loadParcelles();
  }

  applyFilters(): void {
    this.searchFilters.page = 1;
    this.currentPage = 0;
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

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible);
    
    for (let i = start; i < end; i++) {
      pages.push(i + 1);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchFilters.page = page + 1;
      this.loadParcelles();
    }
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

  locateParcelle(parcelle: ParcelleAPI): void {
    if (parcelle.geometry) {
      this.router.navigate(['/parcelles/carte'], { queryParams: { parcelle: parcelle.id } });
    }
  }

  validateParcelle(parcelle: ParcelleAPI): void {
    this.parcellesApiService.updateParcelle(parcelle.id, { 
      etatValidation: 'Valide' 
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.snackBar.open('Parcelle validée avec succès', 'Fermer', { duration: 3000 });
        this.loadParcelles();
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Erreur validation:', error);
        this.snackBar.open('Erreur lors de la validation', 'Fermer', { duration: 3000 });
      }
    });
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
    console.log('🗑️ Tentative de suppression de la parcelle:', parcelle);
    
    // Vérifier les permissions
    if (!this.canDeleteParcelle()) {
      this.snackBar.open('Vous n\'avez pas les permissions pour supprimer des parcelles', 'Fermer', { duration: 3000 });
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la parcelle "${parcelle.referenceFonciere}" ?\n\nLa parcelle sera archivée et ne s'affichera plus dans la liste.`)) {
      console.log('🗑️ Confirmation reçue, suppression en cours...');
      
      this.parcellesApiService.deleteParcelle(parcelle.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('🗑️ Suppression réussie:', response);
            this.snackBar.open('Parcelle archivée avec succès', 'Fermer', { duration: 2000 });
            this.loadParcelles();
            this.loadStatistics();
          },
          error: (error) => {
            console.error('🗑️ Erreur suppression détaillée:', error);
            console.error('🗑️ Status:', error.status);
            console.error('🗑️ Message:', error.message);
            console.error('🗑️ Error body:', error.error);
            
            let errorMessage = 'Erreur lors de la suppression';
            if (error.status === 403) {
              errorMessage = 'Vous n\'avez pas les permissions pour supprimer cette parcelle';
            } else if (error.status === 404) {
              errorMessage = 'Parcelle introuvable';
            } else if (error.status === 500) {
              errorMessage = 'Erreur serveur lors de la suppression';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }
            
            this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
          }
        });
    } else {
      console.log('🗑️ Suppression annulée par l\'utilisateur');
    }
  }

  canDeleteParcelle(): boolean {
    return this.authService.hasPermission(
      UserProfil.ADMIN,
      UserProfil.TECHNICIEN_SIG
    );
  }

  // Méthode de debug pour vérifier les permissions
  debugPermissions(): void {
    console.log('🔍 Debug des permissions de suppression:');
    console.log('🔍 Utilisateur actuel:', this.authService.currentUser);
    console.log('🔍 Peut supprimer:', this.canDeleteParcelle());
    console.log('🔍 Rôles autorisés:', [UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG]);
  }

  showBulkActions(): void {
    this.showBulkActionsModal = true;
  }

  hideBulkActions(): void {
    this.showBulkActionsModal = false;
  }

  validateSelected(): void {
    if (this.selection.selected.length === 0) return;
    
    const selectedIds = this.selection.selected.map(p => p.id);
    // Mise à jour individuelle pour chaque parcelle
    const updates = selectedIds.map(id => 
      this.parcellesApiService.updateParcelle(id, { etatValidation: 'Valide' })
    );
    
    Promise.all(updates).then(() => {
      this.snackBar.open(`${selectedIds.length} parcelles validées avec succès`, 'Fermer', { duration: 3000 });
      this.loadParcelles();
      this.loadStatistics();
      this.selection.clear();
    }).catch(error => {
      console.error('Erreur validation en lot:', error);
      this.snackBar.open('Erreur lors de la validation en lot', 'Fermer', { duration: 3000 });
    });
  }

  publishSelected(): void {
    if (this.selection.selected.length === 0) return;
    
    const selectedIds = this.selection.selected.map(p => p.id);
    // Mise à jour individuelle pour chaque parcelle
    const updates = selectedIds.map(id => 
      this.parcellesApiService.updateParcelle(id, { etatValidation: 'Publie' })
    );
    
    Promise.all(updates).then(() => {
      this.snackBar.open(`${selectedIds.length} parcelles publiées avec succès`, 'Fermer', { duration: 3000 });
      this.loadParcelles();
      this.loadStatistics();
      this.selection.clear();
    }).catch(error => {
      console.error('Erreur publication en lot:', error);
      this.snackBar.open('Erreur lors de la publication en lot', 'Fermer', { duration: 3000 });
    });
  }

  exportSelected(): void {
    if (this.selection.selected.length === 0) return;
    
    // Pour l'instant, export simple des données sélectionnées
    const data = this.selection.selected.map(p => ({
      'Référence': p.referenceFonciere,
      'Zone': p.zonage,
      'Surface totale': p.surfaceTotale,
      'Surface imposable': p.surfaceImposable,
      'TNB calculée': p.montantTotalTnb,
      'Statut': p.etatValidation,
      'Date modification': p.dateModification
    }));
    
    const csv = this.convertToCSV(data);
    this.downloadCSV(csv, `parcelles_export_${new Date().toISOString().split('T')[0]}.csv`);
    this.snackBar.open('Export terminé avec succès', 'Fermer', { duration: 3000 });
  }

  deleteSelected(): void {
    if (this.selection.selected.length === 0) return;
    
    const selectedIds = this.selection.selected.map(p => p.id);
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} parcelle(s) ?\n\nLes parcelles seront archivées et ne s'afficheront plus dans la liste.`)) {
      // Suppression individuelle pour chaque parcelle
      const deletions = selectedIds.map(id => this.parcellesApiService.deleteParcelle(id));
      
      Promise.all(deletions).then(() => {
        this.snackBar.open(`${selectedIds.length} parcelles archivées avec succès`, 'Fermer', { duration: 3000 });
        this.loadParcelles();
        this.loadStatistics();
        this.selection.clear();
      }).catch(error => {
        console.error('Erreur suppression en lot:', error);
        this.snackBar.open('Erreur lors de la suppression en lot', 'Fermer', { duration: 3000 });
      });
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

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedZone = '';
    this.searchFilters = {
      page: 1,
      limit: this.pageSize,
      sortBy: 'referenceFonciere',
      sortOrder: 'ASC'
    };
    this.loadParcelles();
  }

  onSortChange(sort: Sort): void {
    this.searchFilters.sortBy = sort.active;
    this.searchFilters.sortOrder = sort.direction.toUpperCase() as 'ASC' | 'DESC';
    this.loadParcelles();
  }

  retry(): void {
    this.error = null;
    this.loadParcelles();
  }

  refreshData(): void {
    console.log('Actualisation forcée des données...');
    this.loadParcelles();
    this.loadStatistics();
  }

  testAPI(): void {
    console.log('🧪 TEST API - Début du test...');
    console.log('🧪 URL de base:', this.parcellesApiService['apiUrl']);
    
    // Test 1: Sans aucun filtre
    console.log('🧪 TEST 1: Appel API sans filtres');
    this.parcellesApiService.getParcelles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('🧪 TEST 1 - Réponse reçue:', response);
          console.log('🧪 TEST 1 - Nombre de parcelles:', response.data?.length || 0);
          console.log('🧪 TEST 1 - Total:', response.total || 0);
          
          if (response.data && response.data.length > 0) {
            console.log('🧪 TEST 1 - Première parcelle:', response.data[0]);
          } else {
            console.log('🧪 TEST 1 - Aucune parcelle trouvée');
          }
          
          // Test 2: Avec filtres minimaux
          console.log('🧪 TEST 2: Appel API avec filtres minimaux');
          const minimalFilters = { page: 1, limit: 10 };
          this.parcellesApiService.getParcelles(minimalFilters)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response2) => {
                console.log('🧪 TEST 2 - Réponse reçue:', response2);
                console.log('🧪 TEST 2 - Nombre de parcelles:', response2.data?.length || 0);
                console.log('🧪 TEST 2 - Total:', response2.total || 0);
              },
              error: (error2) => {
                console.error('🧪 TEST 2 - Erreur:', error2);
              }
            });
        },
        error: (error) => {
          console.error('🧪 TEST 1 - Erreur:', error);
          console.error('🧪 TEST 1 - Status:', error.status);
          console.error('🧪 TEST 1 - Message:', error.message);
        }
      });
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

  viewMap(): void {
    this.router.navigate(['/parcelles/carte']);
  }

  createNewParcel(): void {
    this.router.navigate(['/parcelles/create']);
  }



  convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }

  downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      'Brouillon': 'badge-brouillon', // Gris
      'Valide': 'badge-valide', // Orange
      'Publie': 'badge-publie', // Vert
      'Archive': 'badge-archive' // Gris
    };
    return statusClasses[statut] || 'badge-secondary';
  }

  getStatusBadgeClass(statut: string): string {
    return this.getStatusClass(statut);
  }

  getStatusLabel(statut: string): string {
    const statusLabels: { [key: string]: string } = {
      'Brouillon': 'Brouillon',
      'Valide': 'Validé',
      'Publie': 'Publié',
      'Archive': 'Archivé'
    };
    return statusLabels[statut] || statut;
  }

  getReferenceBadgeClass(reference: string): string {
    if (reference.startsWith('TF-')) {
      return 'badge-success'; // Vert pour TF
    } else if (reference.startsWith('R-')) {
      return 'badge-warning'; // Orange pour R
    } else if (reference.startsWith('NI-')) {
      return 'badge-info'; // Bleu pour NI
    } else {
      return 'badge-secondary'; // Gris par défaut
    }
  }

  getStatusIconClass(statut: string): string {
    const iconClasses: { [key: string]: string } = {
      'Brouillon': 'status-icon-blue', // Bleu pour Brouillon
      'Valide': 'status-icon-orange', // Orange pour Validé
      'Publie': 'status-icon-green', // Vert pour Publié
      'Archive': 'status-icon-grey' // Gris pour Archivé
    };
    return iconClasses[statut] || 'status-icon-blue';
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
        referenceFonciere: 'REF001',
        statutFoncier: 'PRIVEE',
        surfaceTotale: 150.5,
        surfaceImposable: 150.5,
        zonage: 'R4',
        statutOccupation: 'NU',
        etatValidation: 'Publie',
        montantTotalTnb: 2500,
        prixUnitaireM2: 16.6,
        exonereTnb: false,
        dateCreation: new Date('2024-01-15'),
        dateModification: new Date('2024-01-15'),
        utilisateurCreation: 'admin',
        utilisateurModification: 'admin',
        proprietaires: [
          {
            id: 1,
            parcelleId: 1,
            nom: 'Benali',
            prenom: 'Ahmed',
            type: 'PHYSIQUE',
            cin: 'AB123456',
            quotePart: 100,
            montantTnb: 2500,
            dateCreation: new Date('2024-01-15')
          }
        ]
      },
      {
        id: 2,
        referenceFonciere: 'REF002',
        statutFoncier: 'PRIVEE',
        surfaceTotale: 89.2,
        surfaceImposable: 89.2,
        zonage: 'R2',
        statutOccupation: 'NU',
        etatValidation: 'Valide',
        montantTotalTnb: 1800,
        prixUnitaireM2: 20.2,
        exonereTnb: false,
        dateCreation: new Date('2024-01-10'),
        dateModification: new Date('2024-01-10'),
        utilisateurCreation: 'admin',
        utilisateurModification: 'admin',
        proprietaires: [
          {
            id: 2,
            parcelleId: 2,
            nom: 'Zahra',
            prenom: 'Fatima',
            type: 'PHYSIQUE',
            cin: 'FZ789012',
            quotePart: 100,
            montantTnb: 1800,
            dateCreation: new Date('2024-01-10')
          }
        ]
      }
    ];

    this.dataSource.data = mockParcelles;
    this.totalParcelles = mockParcelles.length;
    this.totalPages = 1;
  }
}