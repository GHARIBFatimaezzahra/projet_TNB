// =====================================================
// COMPOSANT INTERFACE SIG - VISUALISATION ET NAVIGATION
// =====================================================

import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MapModule } from '../../../../shared/components/map/map.module';
import { MapOptions } from '../../../../shared/components/map/map.component';
import { ParcellesApiService, ParcelleAPI } from '../../services/parcelles-api.service';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// Interfaces
export interface MapStats {
  parcellesVisibles: number;
  parcellesPubliees: number;
  surfaceImposable: number;
  tnbCalculee: number;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  type: 'parcelles' | 'zones' | 'infrastructure';
  count: number;
}

export interface SelectedParcel {
  id: number;
  reference: string;
  surface: number;
  surfaceImposable: number;
  zone: string;
  proprietaire: string;
  tnb: number;
}

@Component({
  selector: 'app-sig-interface',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MapModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './sig-interface.component.html',
  styleUrls: ['./sig-interface.component.scss']
})
export class SigInterfaceComponent implements OnInit, OnDestroy {

  // =====================================================
  // PROPRIÉTÉS
  // =====================================================

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  // Statistiques de la carte
  mapStats: MapStats = {
    parcellesVisibles: 3847,
    parcellesPubliees: 1923,
    surfaceImposable: 2847.5, // en hectares
    tnbCalculee: 8456720 // en DH
  };

  // Couches cartographiques
  mapLayers: MapLayer[] = [
    { id: 'parcelles-tnb', name: 'Parcelles TNB', visible: true, type: 'parcelles', count: 3847 },
    { id: 'zones-urbanistiques', name: 'Zones urbanistiques', visible: true, type: 'zones', count: 12 },
    { id: 'limites-tf-r', name: 'Limites TF/R', visible: false, type: 'infrastructure', count: 892 },
    { id: 'orthophoto-2024', name: 'Orthophoto 2024', visible: false, type: 'infrastructure', count: 1 },
    { id: 'reseau-viaire', name: 'Réseau viaire', visible: false, type: 'infrastructure', count: 456 },
    { id: 'equipements-publics', name: 'Équipements publics', visible: false, type: 'infrastructure', count: 78 }
  ];

  // Outil sélectionné
  selectedTool: string = 'select';

  // État de la carte
  mapInitialized: boolean = false;
  currentCoordinates = { x: 524750.25, y: 385642.75 };
  currentScale: number = 25000;
  currentZoom: number = 12;

  // Parcelle sélectionnée
  selectedParcel: SelectedParcel | null = null;

  // Données des parcelles
  parcelles: ParcelleAPI[] = [];

  // Options de la carte
  mapOptions: MapOptions = {
    center: [-7.6114, 33.5731], // Casablanca en WGS84
    zoom: 10, // Zoom pour voir toute la région de Casablanca
    enableSelection: true,
    showParcelles: true,
    showLayers: true,
    mode: 'view' // Mode consultation
  };

  // Subject pour la destruction
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private parcellesApiService: ParcellesApiService
  ) {}

  // =====================================================
  // CYCLE DE VIE
  // =====================================================

  ngOnInit(): void {
    console.log('Interface SIG initialisée');
    this.loadParcelles();
  }

  private loadParcelles(): void {
    this.parcellesApiService.getParcelles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.parcelles = response.data || [];
          this.updateStatistics();
          console.log('Parcelles chargées pour la carte:', this.parcelles.length);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des parcelles:', error);
          this.showError('Erreur lors du chargement des parcelles');
        }
      });
  }

  private updateStatistics(): void {
    this.mapStats.parcellesVisibles = this.parcelles.length;
    this.mapStats.parcellesPubliees = this.parcelles.filter(p => p.etatValidation === 'Publie').length;
    this.mapStats.surfaceImposable = this.parcelles.reduce((total, p) => total + (p.surfaceImposable || 0), 0) / 10000; // Convertir en hectares
    this.mapStats.tnbCalculee = this.parcelles.reduce((total, p) => total + (p.montantTotalTnb || 0), 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // GESTION DES OUTILS
  // =====================================================

  selectTool(toolId: string): void {
    this.selectedTool = toolId;
    this.showSuccess(`Outil "${toolId}" sélectionné`);
  }

  // =====================================================
  // GESTION DES COUCHES
  // =====================================================

  toggleLayer(layerId: string, visible: boolean): void {
    const layer = this.mapLayers.find(l => l.id === layerId);
    if (layer) {
      layer.visible = visible;
      this.showSuccess(`Couche "${layer.name}" ${visible ? 'affichée' : 'masquée'}`);
    }
  }

  getLayerBadgeClass(type: string): string {
    switch (type) {
      case 'parcelles':
        return 'success';
      case 'zones':
        return 'info';
      case 'infrastructure':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  // =====================================================
  // ACTIONS CARTOGRAPHIQUES
  // =====================================================

  initializeMap(): void {
    this.mapInitialized = true;
    this.showSuccess('Carte OpenLayers initialisée');
  }

  onParcelleSelected(parcelle: ParcelleAPI): void {
    this.selectedParcel = {
      id: parcelle.id,
      reference: parcelle.referenceFonciere,
      surface: parcelle.surfaceTotale,
      surfaceImposable: parcelle.surfaceImposable,
      zone: parcelle.zonage,
      proprietaire: parcelle.proprietaires?.[0] ? `${parcelle.proprietaires[0].nom} ${parcelle.proprietaires[0].prenom}` : 'Non défini',
      tnb: parcelle.montantTotalTnb
    };
    this.showSuccess(`Parcelle ${parcelle.referenceFonciere} sélectionnée`);
  }

  onMapReady(map: any): void {
    console.log('Carte prête:', map);
    this.mapInitialized = true;
  }

  zoomIn(): void {
    this.currentZoom++;
    this.currentScale = Math.round(this.currentScale / 2);
    this.showSuccess('Zoom avant');
  }

  zoomOut(): void {
    this.currentZoom--;
    this.currentScale = this.currentScale * 2;
    this.showSuccess('Zoom arrière');
  }

  zoomToExtent(): void {
    this.currentZoom = 12;
    this.currentScale = 25000;
    this.showSuccess('Vue d\'ensemble');
  }

  toggleFullscreen(): void {
    this.showSuccess('Mode plein écran');
    // TODO: Implémenter le plein écran
  }

  showSpatialQuery(): void {
    this.showSuccess('Requête spatiale activée');
    // TODO: Implémenter la requête spatiale
  }

  showBufferAnalysis(): void {
    this.showSuccess('Analyse de zone tampon activée');
    // TODO: Implémenter l'analyse de zone tampon
  }

  exportMap(): void {
    this.showSuccess('Export de la carte en cours...');
    // TODO: Implémenter l'export de carte
  }

  // =====================================================
  // GESTION PARCELLE SÉLECTIONNÉE
  // =====================================================

  viewParcelDetails(): void {
    if (this.selectedParcel) {
      this.router.navigate(['/parcelles/detail', this.selectedParcel.id]);
    }
  }

  centerOnParcel(): void {
    if (this.selectedParcel) {
      this.showSuccess(`Centrage sur la parcelle ${this.selectedParcel.reference}`);
      // TODO: Centrer la carte sur la parcelle
    }
  }

  // =====================================================
  // MÉTHODES DE FORMATAGE
  // =====================================================

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

  formatSurface(value: number): string {
    return `${this.formatNumber(value)} Ha`;
  }

  getPublishedPercentage(): number {
    return Math.round((this.mapStats.parcellesPubliees / this.mapStats.parcellesVisibles) * 100);
  }

  getZoneLabel(zone: string): string {
    const zoneLabels: { [key: string]: string } = {
      'R+4': 'Résidentiel 4 étages',
      'I1': 'Industriel léger',
      'C': 'Commercial',
      'E': 'Équipements'
    };
    return zoneLabels[zone] || zone;
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}