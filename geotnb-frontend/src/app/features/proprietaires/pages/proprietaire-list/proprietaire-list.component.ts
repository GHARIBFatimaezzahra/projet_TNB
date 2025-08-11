import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProprietaireService } from '../../services/proprietaire.service';
import { Proprietaire } from '../../../../core/models/proprietaire.model';

@Component({
  selector: 'app-proprietaire-list',
  templateUrl: './proprietaire-list.component.html',
  styleUrls: ['./proprietaire-list.component.scss']
})
export class ProprietaireListComponent implements OnInit {
  proprietaires: Proprietaire[] = [];
  loading = true;
  error = '';

  constructor(
    private proprietaireService: ProprietaireService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProprietaires();
  }

  loadProprietaires(): void {
    this.proprietaireService.getProprietaires().subscribe({
      next: (proprietaires) => {
        this.proprietaires = proprietaires;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des propriétaires';
        this.loading = false;
      }
    });
  }

  createProprietaire(): void {
    this.router.navigate(['/proprietaires/new']);
  }

  editProprietaire(id: number): void {
    this.router.navigate(['/proprietaires', id, 'edit']);
  }

  deleteProprietaire(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce propriétaire ?')) {
      this.proprietaireService.deleteProprietaire(id).subscribe({
        next: () => {
          this.loadProprietaires();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }
}