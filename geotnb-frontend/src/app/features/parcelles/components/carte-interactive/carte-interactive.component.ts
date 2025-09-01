import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Interfaces pour les données de la carte
interface MapStats {
  parcellesVisibles: number;
  parcellesPubliees: number;
  surfaceImposable: number;
  tnbCalculee: number;
}

interface Parcel {
  id: number;
  reference: string;
  proprietaire: string;
  surface: number;
  zone: string;
  tnb: number;
  geometry: any;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  active?: boolean;
  count: number;
}

@Component({
  selector: 'app-carte-interactive',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './carte-interactive.component.html',
  styleUrls: ['./carte-interactive.component.scss']
})
export class CarteInteractiveComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private destroy$ = new Subject<void>();

  // État des panneaux
  layersPanelOpen = false;
  toolsPanelOpen = false;

  // Statistiques de la carte
  mapStats: MapStats = {
    parcellesVisibles: 0,
    parcellesPubliees: 0,
    surfaceImposable: 0,
    tnbCalculee: 0
  };

  // Parcelle sélectionnée
  selectedParcel: Parcel | null = null;

  // Couches de base
  baseLayers: Layer[] = [
    { id: 'osm', name: 'OpenStreetMap', visible: true, active: true, count: 0 },
    { id: 'ortho', name: 'Orthophotos', visible: false, active: false, count: 0 },
    { id: 'cadastre', name: 'Plan cadastral', visible: false, active: false, count: 0 }
  ];

  // Couches thématiques
  thematicLayers: Layer[] = [
    { id: 'parcelles', name: 'Parcelles TNB', visible: true, count: 0 },
    { id: 'zonage', name: 'Zonage urbanistique', visible: false, count: 0 },
    { id: 'limites', name: 'Limites administratives', visible: false, count: 0 }
  ];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMapStats();
    this.loadLayersData();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger les statistiques de la carte
   */
  private loadMapStats(): void {
    // Simulation des données - à remplacer par des appels API réels
    this.mapStats = {
      parcellesVisibles: 1247,
      parcellesPubliees: 892,
      surfaceImposable: 156.8,
      tnbCalculee: 2345678
    };
  }

  /**
   * Charger les données des couches
   */
  private loadLayersData(): void {
    // Simulation des données - à remplacer par des appels API réels
    this.thematicLayers[0].count = 1247; // Parcelles TNB
    this.thematicLayers[1].count = 15;   // Zones urbanistiques
    this.thematicLayers[2].count = 8;    // Limites administratives
  }

  /**
   * Initialiser la carte OpenLayers
   */
  private initializeMap(): void {
    if (this.mapContainer) {
      // Placeholder pour l'initialisation OpenLayers
      // À implémenter avec la vraie carte OpenLayers
      console.log('Initialisation de la carte OpenLayers');
      
      // Simuler le chargement des parcelles
      setTimeout(() => {
        this.mapStats.parcellesVisibles = 1247;
      }, 1000);
    }
  }

  /**
   * Retourner au dashboard
   */
  goBack(): void {
    this.router.navigate(['/parcelles']);
  }

  /**
   * Basculer l'ouverture d'un panneau coulissant
   */
  toggleSidePanel(panelId: string): void {
    if (panelId === 'layers-panel') {
      this.layersPanelOpen = !this.layersPanelOpen;
      this.toolsPanelOpen = false;
    } else if (panelId === 'tools-panel') {
      this.toolsPanelOpen = !this.toolsPanelOpen;
      this.layersPanelOpen = false;
    }
  }

  /**
   * Basculer une couche de base
   */
  toggleBaseLayer(layerId: string): void {
    this.baseLayers.forEach(layer => {
      layer.active = layer.id === layerId;
    });
    
    this.showNotification(`Couche de base changée: ${this.baseLayers.find(l => l.id === layerId)?.name}`, 'info');
  }

  /**
   * Basculer une couche thématique
   */
  toggleThematicLayer(layerId: string): void {
    const layer = this.thematicLayers.find(l => l.id === layerId);
    if (layer) {
      layer.visible = !layer.visible;
      this.showNotification(`${layer.visible ? 'Affichage' : 'Masquage'} de la couche: ${layer.name}`, 'info');
    }
  }

  /**
   * Activer un outil de mesure
   */
  activateMeasureTool(toolType: 'distance' | 'area'): void {
    this.showNotification(`Outil de mesure ${toolType === 'distance' ? 'distance' : 'surface'} activé`, 'info');
    // À implémenter avec OpenLayers
  }

  /**
   * Exporter la carte en PNG
   */
  exportMapPNG(): void {
    this.showNotification('Export PNG de la carte en cours...', 'info');
    // À implémenter avec OpenLayers
  }

  /**
   * Exporter la carte en PDF
   */
  exportMapPDF(): void {
    this.showNotification('Export PDF de la carte en cours...', 'info');
    // À implémenter avec OpenLayers
  }

  /**
   * Voir le détail d'une parcelle
   */
  viewParcelDetail(): void {
    if (this.selectedParcel) {
      this.router.navigate(['/parcelles/detail', this.selectedParcel.id]);
    }
  }

  /**
   * Modifier une parcelle
   */
  editParcel(): void {
    if (this.selectedParcel) {
      this.router.navigate(['/parcelles/edit', this.selectedParcel.id]);
    }
  }

  /**
   * Obtenir le pourcentage de parcelles publiées
   */
  getPublishedPercentage(): number {
    if (this.mapStats.parcellesVisibles === 0) return 0;
    return Math.round((this.mapStats.parcellesPubliees / this.mapStats.parcellesVisibles) * 100);
  }

  /**
   * Obtenir la classe CSS pour une zone
   */
  getZoneClass(zone: string): string {
    const zoneMap: { [key: string]: string } = {
      'R1': 'r1',
      'R2': 'r2',
      'R3': 'r3',
      'I': 'i',
      'C': 'c'
    };
    return zoneMap[zone] || 'r1';
  }

  /**
   * Afficher une notification
   */
  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: `snackbar-${type}`
    });
  }

  /**
   * Simuler la sélection d'une parcelle (pour les tests)
   */
  simulateParcelSelection(): void {
    this.selectedParcel = {
      id: 1,
      reference: 'TF-123456',
      proprietaire: 'ALAMI Mohammed',
      surface: 1250,
      zone: 'R1',
      tnb: 15680,
      geometry: null
    };
  }
}




