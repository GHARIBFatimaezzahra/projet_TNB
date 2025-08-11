import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ParcelleService } from '../../services/parcelle-api.service';
import { Parcelle } from '../../../../core/models/parcelle.model';

@Component({
  selector: 'app-parcelle-list',
  templateUrl: './parcelle-list.component.html',
  styleUrls: ['./parcelle-list.component.scss']
})
export class ParcelleListComponent implements OnInit {
  parcelles: Parcelle[] = [];
  loading = true;
  error = '';
  
  // Filtres
  searchTerm = '';
  selectedZonage = '';
  selectedStatut = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  zonages = [
    { value: '', label: 'Tous les zonages' },
    { value: 'Résidentiel', label: 'Résidentiel' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Industriel', label: 'Industriel' },
    { value: 'Agricole', label: 'Agricole' }
  ];

  statuts = [
    { value: '', label: 'Tous les statuts' },
    { value: 'Brouillon', label: 'Brouillon' },
    { value: 'Validé', label: 'Validé' },
    { value: 'Publié', label: 'Publié' }
  ];

  constructor(
    private parcelleService: ParcelleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadParcelles();
  }

  loadParcelles(): void {
    this.loading = true;
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm,
      zonage: this.selectedZonage,
      statut: this.selectedStatut
    };

    this.parcelleService.getParcelles(filters).subscribe({
      next: (response) => {
        this.parcelles = response.data;
        this.totalItems = response.total;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des parcelles';
        this.loading = false;
        console.error(error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadParcelles();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadParcelles();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadParcelles();
  }

  createParcelle(): void {
    this.router.navigate(['/parcelles/new']);
  }

  viewParcelle(id: number): void {
    this.router.navigate(['/parcelles', id]);
  }

  editParcelle(id: number): void {
    this.router.navigate(['/parcelles', id, 'edit']);
  }

  deleteParcelle(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette parcelle ?')) {
      this.parcelleService.deleteParcelle(id).subscribe({
        next: () => {
          this.loadParcelles();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  getStatusClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'Brouillon': 'status-draft',
      'Validé': 'status-validated', 
      'Publié': 'status-published'
    };
    return classes[statut] || '';
  }
}