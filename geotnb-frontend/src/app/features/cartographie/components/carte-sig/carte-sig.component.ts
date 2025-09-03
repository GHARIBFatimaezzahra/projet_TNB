import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MapModule } from '../../../../shared/components/map/map.module';
import { MapOptions } from '../../../../shared/components/map/map.component';
import { ParcellesApiService, ParcelleAPI } from '../../../parcelles/services/parcelles-api.service';

@Component({
  selector: 'app-carte-sig',
  standalone: true,
  imports: [CommonModule, MapModule],
  template: `
    <div class="carte-sig-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1>
              <i class="fas fa-map-marked-alt"></i>
              Carte SIG - Casablanca
            </h1>
            <p class="subtitle">Visualisation cartographique interactive des parcelles TNB</p>
          </div>
          
          <div class="header-actions">
            <button class="btn btn-primary" (click)="refreshData()" [disabled]="loading">
              <i class="fas fa-sync-alt" [class.fa-spin]="loading"></i>
              Actualiser
            </button>
            <button class="btn btn-secondary" (click)="fitToParcelles()">
              <i class="fas fa-expand-arrows-alt"></i>
              Ajuster vue
            </button>
          </div>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-number">{{ totalParcelles }}</span>
          <span class="stat-label">Parcelles totales</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ parcellesAvecGeometrie }}</span>
          <span class="stat-label">Géolocalisées</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ parcellesBrouillon }}</span>
          <span class="stat-label">Brouillons</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ parcellesValidees }}</span>
          <span class="stat-label">Validées</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ parcellesPubliees }}</span>
          <span class="stat-label">Publiées</span>
        </div>
      </div>

      <!-- Carte principale -->
      <div class="map-section">
        <app-map
          mapId="carte-sig"
          [options]="mapOptions"
          [parcelles]="parcelles"
          [showControls]="true"
          [showLayers]="true"
          [enableSelection]="true"
          [enableDrawing]="false"
          (parcelleSelected)="onParcelleSelected($event)"
          (mapReady)="onMapReady($event)">
        </app-map>
      </div>

      <!-- Panneau latéral d'informations -->
      <div class="info-panel" *ngIf="selectedParcelle">
        <div class="panel-header">
          <h3>
            <i class="fas fa-info-circle"></i>
            Détails de la parcelle
          </h3>
          <button class="btn btn-sm btn-secondary" (click)="closeInfoPanel()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="panel-content">
          <div class="info-section">
            <h4>Informations générales</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>Référence foncière:</label>
                <span class="value">{{ selectedParcelle.referenceFonciere }}</span>
              </div>
              <div class="info-item">
                <label>Surface totale:</label>
                <span class="value">{{ selectedParcelle.surfaceTotale | number }} m²</span>
              </div>
              <div class="info-item">
                <label>Surface imposable:</label>
                <span class="value">{{ selectedParcelle.surfaceImposable | number }} m²</span>
              </div>
              <div class="info-item">
                <label>Zonage:</label>
                <span class="value">{{ selectedParcelle.zonage }}</span>
              </div>
              <div class="info-item">
                <label>Statut foncier:</label>
                <span class="value">{{ selectedParcelle.statutFoncier }}</span>
              </div>
              <div class="info-item">
                <label>Statut occupation:</label>
                <span class="value">{{ selectedParcelle.statutOccupation }}</span>
              </div>
              <div class="info-item">
                <label>État validation:</label>
                <span class="badge" [ngClass]="getStatusClass(selectedParcelle.etatValidation)">
                  {{ getStatusLabel(selectedParcelle.etatValidation) }}
                </span>
              </div>
              <div class="info-item">
                <label>Montant TNB:</label>
                <span class="value amount">{{ selectedParcelle.montantTotalTnb | number:'1.0-0' }} DH</span>
              </div>
            </div>
          </div>

          <div class="info-section" *ngIf="selectedParcelle.proprietaires && selectedParcelle.proprietaires.length > 0">
            <h4>Propriétaires</h4>
            <div class="proprietaires-list">
              <div class="proprietaire-item" *ngFor="let prop of selectedParcelle.proprietaires">
                <div class="proprietaire-info">
                  <strong>{{ prop.nom }} {{ prop.prenom }}</strong>
                  <span class="quote-part">({{ (prop.quotePart * 100) | number:'1.0-1' }}%)</span>
                </div>
                <div class="proprietaire-details">
                  <small>CIN: {{ prop.cin }}</small>
                </div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h4>Actions</h4>
            <div class="action-buttons">
              <button class="btn btn-primary btn-sm" (click)="viewParcelleDetails()">
                <i class="fas fa-eye"></i> Voir détails
              </button>
              <button class="btn btn-secondary btn-sm" (click)="editParcelle()">
                <i class="fas fa-edit"></i> Modifier
              </button>
              <button class="btn btn-info btn-sm" (click)="generatePDF()">
                <i class="fas fa-file-pdf"></i> Fiche PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading overlay -->
      <div class="loading-overlay" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement des données cartographiques...</p>
      </div>
    </div>
  `,
  styleUrls: ['./carte-sig.component.scss']
})
export class CarteSigComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Propriétés de la carte
  public mapOptions: MapOptions = {
    center: [-7.6114, 33.5731], // Casablanca
    zoom: 12,
    enableSelection: true,
    showParcelles: true,
    showLayers: true,
    mode: 'sig' // Mode SIG pour consultation détaillée
  };

  // Données
  public parcelles: ParcelleAPI[] = [];
  public selectedParcelle: ParcelleAPI | null = null;
  public loading = false;

  // Statistiques
  public totalParcelles = 0;
  public parcellesAvecGeometrie = 0;
  public parcellesBrouillon = 0;
  public parcellesValidees = 0;
  public parcellesPubliees = 0;

  constructor(private parcellesApiService: ParcellesApiService) {}

  ngOnInit(): void {
    this.loadParcelles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadParcelles(): void {
    this.loading = true;
    
    this.parcellesApiService.getParcelles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.parcelles = response.data || [];
          this.calculateStatistics();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des parcelles:', error);
          this.loading = false;
        }
      });
  }

  private calculateStatistics(): void {
    this.totalParcelles = this.parcelles.length;
    this.parcellesAvecGeometrie = this.parcelles.filter(p => p.geometry).length;
    this.parcellesBrouillon = this.parcelles.filter(p => p.etatValidation === 'Brouillon').length;
    this.parcellesValidees = this.parcelles.filter(p => p.etatValidation === 'Valide').length;
    this.parcellesPubliees = this.parcelles.filter(p => p.etatValidation === 'Publie').length;
  }

  public onParcelleSelected(parcelle: ParcelleAPI): void {
    this.selectedParcelle = parcelle;
  }

  public onMapReady(map: any): void {
    console.log('Carte prête:', map);
  }

  public refreshData(): void {
    this.loadParcelles();
  }

  public fitToParcelles(): void {
    // Cette méthode sera appelée sur le composant de carte
    // TODO: Implémenter la logique pour ajuster la vue
  }

  public closeInfoPanel(): void {
    this.selectedParcelle = null;
  }

  public viewParcelleDetails(): void {
    if (this.selectedParcelle) {
      // TODO: Naviguer vers la page de détails
      console.log('Voir détails de la parcelle:', this.selectedParcelle);
    }
  }

  public editParcelle(): void {
    if (this.selectedParcelle) {
      // TODO: Naviguer vers la page d'édition
      console.log('Modifier la parcelle:', this.selectedParcelle);
    }
  }

  public generatePDF(): void {
    if (this.selectedParcelle) {
      // TODO: Générer la fiche PDF
      console.log('Générer PDF pour la parcelle:', this.selectedParcelle);
    }
  }

  public getStatusClass(statut: string): string {
    const statusClasses: { [key: string]: string } = {
      'Brouillon': 'badge-brouillon',
      'Valide': 'badge-valide',
      'Publie': 'badge-publie',
      'Archive': 'badge-archive'
    };
    return statusClasses[statut] || 'badge-secondary';
  }

  public getStatusLabel(statut: string): string {
    const statusLabels: { [key: string]: string } = {
      'Brouillon': 'Brouillon',
      'Valide': 'Validé',
      'Publie': 'Publié',
      'Archive': 'Archivé'
    };
    return statusLabels[statut] || statut;
  }
}
