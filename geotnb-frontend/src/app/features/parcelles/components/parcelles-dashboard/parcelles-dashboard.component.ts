// =====================================================
// DASHBOARD PARCELLES - CONNECTÉ AU BACKEND
// =====================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MapComponent, MapOptions } from '../../../../shared/components/map/map.component';
import { ParcellesApiService, ParcelleAPI } from '../../services/parcelles-api.service';
import Map from 'ol/Map';

@Component({
  selector: 'app-parcelles-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatSnackBarModule,
    MapComponent
  ],
  templateUrl: './parcelles-dashboard.component.html',
  styleUrls: ['./parcelles-dashboard.component.scss']
})
export class ParcellesDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // =====================================================
  // PROPRIÉTÉS CARTES THÉMATIQUES
  // =====================================================
  
  // Thème sélectionné (par défaut : statut foncier)
  selectedTheme: 'status' | 'zoning' = 'status';
  
  // Carte OpenLayers
  thematicMap!: Map;
  
  // Options de la carte
  thematicMapOptions: MapOptions = {
    center: [-7.6114, 33.5731], // Casablanca
    zoom: 12,
    enableDrawing: false,
    enableSelection: true,
    showParcelles: true,
    showLayers: true,
    mode: 'view'
  };
  
  // Données des parcelles
  allParcelles: ParcelleAPI[] = [];
  filteredParcelles: ParcelleAPI[] = [];
  
  // Statistiques thématiques
  thematicStats: Array<{
    label: string;
    count: number;
    percentage: number;
    color: string;
    trend?: number;
  }> = [];

  // Date de dernière mise à jour
  lastUpdateDate = new Date();

  // Légende interactive
  activeLegendItems: Set<string> = new Set();

  // Couches actives
  activeLayers: Set<string> = new Set(['parcelles', 'communes']);

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private parcellesApiService: ParcellesApiService
  ) {}

  ngOnInit(): void {
    console.log('Dashboard des parcelles initialisé');
    this.loadParcelles();
    // Initialiser avec le thème statut foncier par défaut
    this.updateThematicStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Naviguer vers une interface spécifique
   */
  navigateToInterface(interfaceName: string): void {
    switch (interfaceName) {
      case 'carte-interactive':
        this.router.navigate(['/parcelles/sig']);
        break;
      case 'recherche-avancee':
        this.router.navigate(['/spatial-queries']);
        break;
      case 'liste-parcelles':
        this.router.navigate(['/parcelles/list']);
        break;
      case 'creation-parcelle':
        this.router.navigate(['/parcelles/create']);
        break;
      case 'detail-parcelle':
        this.router.navigate(['/parcelles/detail']);
        break;
      case 'gestion-indivision':
        this.router.navigate(['/parcelles/indivision']);
        break;
      case 'import-export':
        this.router.navigate(['/parcelles/import-export']);
        break;
      default:
        this.showNotification(`Interface ${interfaceName} non implémentée`, 'warning');
        break;
    }
  }

  /**
   * Retourner au dashboard principal
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Afficher toutes les interfaces
   */
  showAllInterfaces(): void {
    this.showNotification('Navigation vers toutes les interfaces', 'info');
    // Ici on pourrait afficher un modal ou une vue avec toutes les interfaces
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

  // =====================================================
  // MÉTHODES CARTES THÉMATIQUES
  // =====================================================

  /**
   * Charger les parcelles depuis l'API
   */
  private loadParcelles(): void {
    this.parcellesApiService.getParcelles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: any) => {
          this.allParcelles = result.data || result.parcelles || [];
          this.filteredParcelles = this.allParcelles;
          console.log('Parcelles chargées:', this.allParcelles.length);
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des parcelles:', error);
          this.showNotification('Erreur lors du chargement des parcelles', 'error');
        }
      });
  }

  /**
   * Basculer entre les thèmes de carte
   */
  switchTheme(theme: 'status' | 'zoning'): void {
    this.selectedTheme = theme;
    this.updateThematicStats();
    this.applyThematicStyles();
    console.log('Thème changé vers:', theme);
  }

  /**
   * Mettre à jour les statistiques thématiques
   */
  private updateThematicStats(): void {
    if (!this.selectedTheme || this.allParcelles.length === 0) {
      this.thematicStats = [];
      return;
    }

    const total = this.allParcelles.length;
    const stats: { [key: string]: number } = {};

    // Compter les parcelles par catégorie
    this.allParcelles.forEach(parcelle => {
      let key: string;
      
      if (this.selectedTheme === 'status') {
        key = parcelle.statutFoncier || 'Inconnu';
      } else {
        key = (parcelle as any).zoneUrbanistique || 'Inconnu';
      }
      
      stats[key] = (stats[key] || 0) + 1;
    });

    // Convertir en tableau de statistiques
    this.thematicStats = Object.entries(stats).map(([label, count]) => ({
      label,
      count,
      percentage: Math.round((count / total) * 100),
      color: this.getColorForCategory(label, this.selectedTheme!)
    }));

    console.log('Statistiques mises à jour:', this.thematicStats);
  }

  /**
   * Obtenir la couleur pour une catégorie
   */
  private getColorForCategory(category: string, theme: 'status' | 'zoning'): string {
    if (theme === 'status') {
      switch (category.toUpperCase()) {
        case 'TF':
        case 'TITRE FONCIER':
          return '#10b981';
        case 'R':
        case 'RÉQUISITION':
          return '#f59e0b';
        case 'NI':
        case 'NON IMMATRICULÉ':
          return '#ef4444';
        default:
          return '#6b7280';
      }
    } else {
      switch (category.toUpperCase()) {
        case 'R+2':
        case 'ZONE R+2':
          return '#3b82f6';
        case 'R+4':
        case 'ZONE R+4':
          return '#10b981';
        case 'VILLAS':
        case 'ZONE VILLAS':
          return '#f59e0b';
        case 'INDUSTRIEL':
        case 'ZONE INDUSTRIELLE':
          return '#6b7280';
        default:
          return '#9ca3af';
      }
    }
  }

  /**
   * Gérer la sélection d'une parcelle sur la carte
   */
  onParcelleSelected(parcelle: ParcelleAPI): void {
    console.log('Parcelle sélectionnée:', parcelle);
    this.showNotification(`Parcelle ${parcelle.referenceFonciere} sélectionnée`, 'info');
  }

  /**
   * Gérer la carte prête
   */
  onThematicMapReady(map: Map): void {
    this.thematicMap = map;
    console.log('Carte thématique prête');
    // Appliquer les styles thématiques si un thème est déjà sélectionné
    if (this.selectedTheme) {
      this.applyThematicStyles();
    }
  }

  /**
   * Appliquer les styles thématiques aux parcelles
   */
  private applyThematicStyles(): void {
    if (!this.thematicMap || !this.selectedTheme) {
      return;
    }

    // Cette méthode sera implémentée pour appliquer des styles différents
    // aux parcelles selon le thème sélectionné
    console.log('Application des styles thématiques pour:', this.selectedTheme);
    
    // Pour l'instant, on simule l'application des styles
    // Dans une implémentation complète, on modifierait les styles des couches vectorielles
    this.showNotification(`Mode ${this.selectedTheme === 'status' ? 'Statut Foncier' : 'Zonage Urbanistique'} activé`, 'info');
  }
}
