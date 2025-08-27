/* =====================================================
   PARCELLE LIST COMPONENT - TABLE AVANCÉE MODERNE
   ===================================================== */

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ParcelleService } from '../../services/parcelle.service';
import { Parcelle, SearchParcelleDto, PaginatedResult, EtatValidation, StatutFoncier, StatutOccupation } from '../../models/parcelle.models';

@Component({
  selector: 'app-parcelle-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatCardModule,
    MatButtonToggleModule,
    MatTooltipModule
  ],
  templateUrl: './parcelle-list.component.html',
  styleUrls: ['./parcelle-list.component.scss']
})
export class ParcelleListComponent implements OnInit, OnDestroy {
  
  // =====================================================
  // PROPRIÉTÉS
  // =====================================================
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // DataSource et données
  dataSource = new MatTableDataSource<Parcelle>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  totalParcelles = 2847; // Simulation du total
  
  // Colonnes affichées
  displayedColumns: string[] = [
    'reference_fonciere',
    'proprietaires', 
    'surface_totale',
    'zonage',
    'montant_total_tnb',
    'etat_validation',
    'actions'
  ];
  
  // Paramètres de recherche et filtrage
  searchTerm = '';
  selectedStatus = '';
  selectedZone = '';
  hasActiveFilters = false;
  
  // Pagination
  pageSize = 25;
  startIndex = 1;
  endIndex = 25;
  
  // Vue (table/cards)
  viewMode: 'table' | 'cards' = 'table';
  
  // Parcelle sélectionnée
  selectedParcelle: Parcelle | null = null;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // =====================================================
  // DONNÉES SIMULÉES (comme vos exemples)
  // =====================================================
  
  private mockParcelles: Parcelle[] = [
    {
      id: 1,
      reference_fonciere: 'TF-478923-B',
      surface_totale: 1250.75,
      surface_imposable: 1120.50,
      statut_foncier: StatutFoncier.TF,
      statut_occupation: StatutOccupation.CONSTRUIT,
      zonage: 'R+4',
      categorie_fiscale: 'R4',
      prix_unitaire_m2: 5.0,
      montant_total_tnb: 5603.75,
      exonere_tnb: false,
      etat_validation: EtatValidation.VALIDE,
      date_creation: new Date('2024-01-15'),
      date_modification: new Date('2024-02-10'),
      derniere_mise_a_jour: new Date('2024-02-10'),
      version: 1,
      // Simulation données propriétaires
      proprietaires: [
        { 
          id: 1,
          parcelle_id: 1,
          proprietaire_id: 1,
          quote_part: 100,
          montant_individuel: 5603.75,
          date_debut: new Date('2024-01-15'),
          est_actif: true,
          date_creation: new Date('2024-01-15'),
          proprietaire: { 
            id: 1, 
            nom: 'ALAMI', 
            prenom: 'Mohammed', 
            nature: 'Physique' as const,
            cin_ou_rc: 'PA123456',
            date_creation: new Date('2024-01-15'),
            date_modification: new Date('2024-01-15'),
            est_actif: true
          }
        }
      ]
    },
    {
      id: 2,
      reference_fonciere: 'R-789456-C',
      surface_totale: 2450.00,
      surface_imposable: 2450.00,
      statut_foncier: StatutFoncier.R,
      statut_occupation: StatutOccupation.CONSTRUIT,
      zonage: 'COM',
      categorie_fiscale: 'COM',
      prix_unitaire_m2: 10.0,
      montant_total_tnb: 24500.00,
      exonere_tnb: false,
      etat_validation: EtatValidation.PUBLIE,
      date_creation: new Date('2024-01-20'),
      date_modification: new Date('2024-02-15'),
      derniere_mise_a_jour: new Date('2024-02-15'),
      version: 1,
      proprietaires: [
        { 
          id: 2,
          parcelle_id: 2,
          proprietaire_id: 2,
          quote_part: 100,
          montant_individuel: 24500.00,
          date_debut: new Date('2024-01-20'),
          est_actif: true,
          date_creation: new Date('2024-01-20'),
          proprietaire: { 
            id: 2, 
            nom: 'SARL IMMOBILIER MODERNE', 
            nature: 'Morale' as const,
            cin_ou_rc: '45789',
            date_creation: new Date('2024-01-20'),
            date_modification: new Date('2024-01-20'),
            est_actif: true
          }
        }
      ]
    },
    {
      id: 3,
      reference_fonciere: 'TF-123789-A',
      surface_totale: 850.25,
      surface_imposable: 850.25,
      statut_foncier: StatutFoncier.TF,
      statut_occupation: StatutOccupation.CONSTRUIT,
      zonage: 'R+2',
      categorie_fiscale: 'R2',
      prix_unitaire_m2: 3.0,
      montant_total_tnb: 2550.75,
      exonere_tnb: false,
      etat_validation: EtatValidation.BROUILLON,
      date_creation: new Date('2024-02-01'),
      date_modification: new Date('2024-02-20'),
      derniere_mise_a_jour: new Date('2024-02-20'),
      version: 1,
      proprietaires: [
        { 
          id: 3,
          parcelle_id: 3,
          proprietaire_id: 3,
          quote_part: 100,
          montant_individuel: 2550.75,
          date_debut: new Date('2024-02-01'),
          est_actif: true,
          date_creation: new Date('2024-02-01'),
          proprietaire: { 
            id: 3, 
            nom: 'BENJELLOUN', 
            prenom: 'Ahmed', 
            nature: 'Physique' as const,
            cin_ou_rc: 'PA789123',
            date_creation: new Date('2024-02-01'),
            date_modification: new Date('2024-02-01'),
            est_actif: true
          }
        }
      ]
    },
    {
      id: 4,
      reference_fonciere: 'NI-456123-D',
      surface_totale: 1750.50,
      surface_imposable: 0.00,
      statut_foncier: StatutFoncier.NI,
      statut_occupation: StatutOccupation.NU,
      zonage: 'R+4',
      categorie_fiscale: 'R4',
      prix_unitaire_m2: 0.0,
      montant_total_tnb: 0.00,
      exonere_tnb: true,
      duree_exoneration: 5,
      etat_validation: EtatValidation.VALIDE,
      date_creation: new Date('2024-02-05'),
      date_modification: new Date('2024-02-25'),
      derniere_mise_a_jour: new Date('2024-02-25'),
      version: 1,
      proprietaires: [
        { 
          id: 4,
          parcelle_id: 4,
          proprietaire_id: 4,
          quote_part: 100,
          montant_individuel: 0.00,
          date_debut: new Date('2024-02-05'),
          est_actif: true,
          date_creation: new Date('2024-02-05'),
          proprietaire: { 
            id: 4, 
            nom: 'RACHID', 
            prenom: 'Héritiers', 
            nature: 'Physique' as const,
            cin_ou_rc: 'PA456789',
            date_creation: new Date('2024-02-05'),
            date_modification: new Date('2024-02-05'),
            est_actif: true
          }
        }
      ]
    }
  ];

  // =====================================================
  // LIFECYCLE
  // =====================================================

  constructor(
    private parcelleService: ParcelleService,
    private snackBar: MatSnackBar
  ) {
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadParcelles();
    this.updateIndexes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================

  private loadParcelles(): void {
    this.loading$.next(true);
    
    // Simulation du chargement
    setTimeout(() => {
      this.dataSource.data = this.mockParcelles;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.setupCustomSorting();
      this.loading$.next(false);
      this.updateIndexes();
    }, 800);
  }

  private setupCustomSorting(): void {
    this.dataSource.sortingDataAccessor = (item: Parcelle, property: string): string | number => {
      switch (property) {
        case 'reference_fonciere': return item.reference_fonciere;
        case 'surface_totale': return item.surface_totale;
        case 'montant_total_tnb': return item.montant_total_tnb;
        case 'etat_validation': return item.etat_validation;
        case 'date_modification': return item.date_modification?.getTime() || 0;
        default: return '';
      }
    };
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.applyFilters();
    });
  }

  // =====================================================
  // RECHERCHE ET FILTRAGE
  // =====================================================

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  onFilterChange(): void {
    this.applyFilters();
    this.updateFilterIndicator();
  }

  private applyFilters(): void {
    let filteredData = [...this.mockParcelles];
    
    // Filtre par terme de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(parcelle => 
        parcelle.reference_fonciere.toLowerCase().includes(term) ||
        this.getProprietairePrincipal(parcelle).toLowerCase().includes(term)
      );
    }
    
    // Filtre par statut
    if (this.selectedStatus) {
      filteredData = filteredData.filter(parcelle => 
        parcelle.etat_validation === this.selectedStatus
      );
    }
    
    // Filtre par zone
    if (this.selectedZone) {
      filteredData = filteredData.filter(parcelle => 
        parcelle.zonage === this.selectedZone
      );
    }
    
    this.dataSource.data = filteredData;
    this.totalParcelles = filteredData.length;
    this.updateIndexes();
  }

  private updateFilterIndicator(): void {
    this.hasActiveFilters = !!(this.selectedStatus || this.selectedZone);
  }

  onAdvancedFilters(): void {
    // Ouvrir un dialog de filtres avancés
    console.log('Filtres avancés...');
  }

  // =====================================================
  // GESTION DE LA TABLE
  // =====================================================

  onSortChange(sort: Sort): void {
    // La logique de tri est gérée par MatTableDataSource
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.updateIndexes();
  }

  private updateIndexes(): void {
    if (this.paginator) {
      this.startIndex = (this.paginator.pageIndex * this.paginator.pageSize) + 1;
      this.endIndex = Math.min(
        (this.paginator.pageIndex + 1) * this.paginator.pageSize,
        this.totalParcelles
      );
    }
  }

  onRowClick(parcelle: Parcelle): void {
    this.selectedParcelle = parcelle;
  }

  onViewModeChange(event: any): void {
    this.viewMode = event.value;
  }

  // =====================================================
  // ACTIONS SUR LES PARCELLES
  // =====================================================

  onExportExcel(): void {
    this.snackBar.open('Export Excel en cours...', 'Fermer', { duration: 3000 });
    // Logique d'export
  }

  onDuplicate(parcelle: Parcelle): void {
    this.snackBar.open(`Parcelle ${parcelle.reference_fonciere} dupliquée`, 'Fermer', { duration: 3000 });
  }

  onValidate(parcelle: Parcelle): void {
    this.snackBar.open(`Parcelle ${parcelle.reference_fonciere} validée`, 'Fermer', { duration: 3000 });
  }

  onPublish(parcelle: Parcelle): void {
    this.snackBar.open(`Parcelle ${parcelle.reference_fonciere} publiée`, 'Fermer', { duration: 3000 });
  }

  onArchive(parcelle: Parcelle): void {
    this.snackBar.open(`Parcelle ${parcelle.reference_fonciere} archivée`, 'Fermer', { duration: 3000 });
  }

  onDelete(parcelle: Parcelle): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la parcelle ${parcelle.reference_fonciere} ?`)) {
      this.snackBar.open(`Parcelle ${parcelle.reference_fonciere} supprimée`, 'Fermer', { duration: 3000 });
    }
  }

  // =====================================================
  // UTILITAIRES D'AFFICHAGE
  // =====================================================

  getProprietairePrincipal(parcelle: Parcelle): string {
    if (!parcelle.proprietaires || parcelle.proprietaires.length === 0) {
      return 'Non défini';
    }
    
    const premier = parcelle.proprietaires[0];
    if (premier.proprietaire?.prenom) {
      return `${premier.proprietaire.nom} ${premier.proprietaire.prenom}`;
    }
    return premier.proprietaire?.nom || 'Non défini';
  }

  getProprietairesCount(parcelle: Parcelle): number {
    return parcelle.proprietaires?.length || 0;
  }

  getReferenceType(reference: string): string {
    if (reference.startsWith('TF-')) return 'Titre Foncier';
    if (reference.startsWith('R-')) return 'Réquisition';
    if (reference.startsWith('NI-')) return 'Non Immatriculé';
    return 'Autre';
  }

  getReferenceTypeClass(reference: string): string {
    if (reference.startsWith('TF-')) return 'tf';
    if (reference.startsWith('R-')) return 'melk';
    return 'other';
  }

  getZoneClass(zone: string): string {
    switch (zone) {
      case 'R+4': return 'r4';
      case 'R+2': return 'r2';
      case 'COM': return 'com';
      case 'IND': return 'ind';
      default: return 'other';
    }
  }

  getStatusClass(status: EtatValidation): string {
    switch (status) {
      case EtatValidation.VALIDE: return 'valide';
      case EtatValidation.PUBLIE: return 'publie';
      case EtatValidation.BROUILLON: return 'brouillon';
      case EtatValidation.ARCHIVE: return 'archive';
      default: return 'brouillon';
    }
  }

  getStatusLabel(status: EtatValidation): string {
    switch (status) {
      case EtatValidation.VALIDE: return 'VALIDÉ';
      case EtatValidation.PUBLIE: return 'PUBLIÉ';
      case EtatValidation.BROUILLON: return 'BROUILLON';
      case EtatValidation.ARCHIVE: return 'ARCHIVÉ';
      default: return 'BROUILLON';
    }
  }

  getStatusIcon(status: EtatValidation): string {
    switch (status) {
      case EtatValidation.VALIDE: return 'check_circle';
      case EtatValidation.PUBLIE: return 'publish';
      case EtatValidation.BROUILLON: return 'edit';
      case EtatValidation.ARCHIVE: return 'archive';
      default: return 'edit';
    }
  }

  getPaymentStatus(parcelle: Parcelle): string {
    if (parcelle.montant_total_tnb === 0) return 'Exonéré';
    // Simulation déterministe basée sur l'ID
    return parcelle.id % 2 === 0 ? 'Payé' : 'Impayé';
  }

  getPaymentStatusClass(parcelle: Parcelle): string {
    if (parcelle.montant_total_tnb === 0) return 'exonere';
    // Simulation déterministe basée sur l'ID
    return parcelle.id % 2 === 0 ? 'paye' : 'impaye';
  }

  // =====================================================
  // PERMISSIONS
  // =====================================================

  canCreateParcelle(): boolean {
    return this.parcelleService.canCreateParcelle();
  }

  canEditParcelle(parcelle: Parcelle): boolean {
    return this.parcelleService.canEditParcelle();
  }

  canDeleteParcelle(parcelle: Parcelle): boolean {
    return this.parcelleService.canDeleteParcelle();
  }

  canValidateParcelle(parcelle: Parcelle): boolean {
    return this.parcelleService.canValidateParcelle();
  }

  canPublishParcelle(parcelle: Parcelle): boolean {
    return this.parcelleService.canPublishParcelle();
  }

  canArchiveParcelle(parcelle: Parcelle): boolean {
    return this.parcelleService.canArchiveParcelle();
  }
}