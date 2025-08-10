import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParcelleService } from '../services/parcelle.service';
import { Parcelle } from '../../../core/models/parcelle.interface';

@Component({
  selector: 'app-parcelle-detail',
  templateUrl: './parcelle-detail.component.html',
  styleUrls: ['./parcelle-detail.component.scss']
})
export class ParcelleDetailComponent implements OnInit {
  parcelle: Parcelle | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parcelleService: ParcelleService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadParcelle(parseInt(id));
    }
  }

  loadParcelle(id: number): void {
    this.parcelleService.getParcelle(id).subscribe({
      next: (parcelle) => {
        this.parcelle = parcelle;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement de la parcelle';
        this.loading = false;
        console.error(error);
      }
    });
  }

  editParcelle(): void {
    if (this.parcelle) {
      this.router.navigate(['/parcelles', this.parcelle.id, 'edit']);
    }
  }

  generateFiche(): void {
    if (this.parcelle) {
      // TODO: Implement PDF generation
      console.log('Generating fiche for parcelle:', this.parcelle.id);
    }
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Brouillon': 'status-draft',
      'Validé': 'status-validated',
      'Publié': 'status-published'
    };
    return classes[status] || '';
  }
}