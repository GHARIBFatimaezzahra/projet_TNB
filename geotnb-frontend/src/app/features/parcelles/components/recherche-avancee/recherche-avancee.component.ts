import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Interfaces simplifiées pour la recherche (à faire évoluer vers la base de données)
interface SearchFilters {
  reference_fonciere: string;
  proprietaire_nom: string;
  proprietaire_cin: string;
  proprietaire_rc: string;
  zone_urbanistique: string;
  secteur: string;
  surface_min: number | undefined;
  surface_max: number | undefined;
  statut_fiscal: string;
  tnb_min: number | undefined;
  tnb_max: number | undefined;
  annee_fiscale: number | undefined;
}

interface SearchResult {
  id: number;
  reference_fonciere: string;
  proprietaire_nom: string;
  surface_totale: number;
  zone_urbanistique: string;
  montant_total_tnb: number;
  statut_fiscal: string;
  secteur: string;
}

@Component({
  selector: 'app-recherche-avancee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './recherche-avancee.component.html',
  styleUrls: ['./recherche-avancee.component.scss']
})
export class RechercheAvanceeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Filtres de recherche
  searchFilters: SearchFilters = {
    reference_fonciere: '',
    proprietaire_nom: '',
    proprietaire_cin: '',
    proprietaire_rc: '',
    zone_urbanistique: '',
    secteur: '',
    surface_min: undefined,
    surface_max: undefined,
    statut_fiscal: '',
    tnb_min: undefined,
    tnb_max: undefined,
    annee_fiscale: undefined
  };

  // Résultats de recherche
  searchResults: SearchResult[] = [];
  selectedParcelles: Set<number> = new Set();
  
  // États de l'interface
  searchPerformed = false;
  searchTime = 0;
  isLoading = false;

  // Données simulées pour les tests
  private mockData: SearchResult[] = [
    {
      id: 1,
      reference_fonciere: 'TF-123456',
      proprietaire_nom: 'ALAMI Mohammed',
      surface_totale: 1250,
      zone_urbanistique: 'R1',
      montant_total_tnb: 15680,
      statut_fiscal: 'imposable',
      secteur: 'centre'
    },
    {
      id: 2,
      reference_fonciere: 'TF-789012',
      proprietaire_nom: 'BENNANI Fatima',
      surface_totale: 890,
      zone_urbanistique: 'R2',
      montant_total_tnb: 11200,
      statut_fiscal: 'imposable',
      secteur: 'nord'
    },
    {
      id: 3,
      reference_fonciere: 'TF-345678',
      proprietaire_nom: 'CHERKAOUI Ahmed',
      surface_totale: 2100,
      zone_urbanistique: 'I',
      montant_total_tnb: 26800,
      statut_fiscal: 'exonere',
      secteur: 'est'
    }
  ];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('Interface Recherche Avancée initialisée');
    this.initializeSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialiser la recherche
   */
  private initializeSearch(): void {
    // Simulation d'une recherche initiale
    this.searchResults = [...this.mockData];
    this.searchPerformed = true;
    this.searchTime = 150;
  }

  /**
   * Appliquer la recherche
   */
  applySearch(): void {
    this.isLoading = true;
    const startTime = Date.now();

    // Simulation d'une recherche avec délai
    setTimeout(() => {
      this.performSearch();
      this.searchTime = Date.now() - startTime;
      this.isLoading = false;
      this.searchPerformed = true;
      
      this.showNotification(`Recherche effectuée en ${this.searchTime}ms`, 'success');
    }, 800);
  }

  /**
   * Effectuer la recherche selon les filtres
   */
  private performSearch(): void {
    let results = [...this.mockData];

    // Filtrage par référence
    if (this.searchFilters.reference_fonciere) {
      results = results.filter(p => 
        p.reference_fonciere.toLowerCase().includes(this.searchFilters.reference_fonciere.toLowerCase())
      );
    }

    // Filtrage par propriétaire
    if (this.searchFilters.proprietaire_nom) {
      results = results.filter(p => 
        p.proprietaire_nom.toLowerCase().includes(this.searchFilters.proprietaire_nom.toLowerCase())
      );
    }

    // Filtrage par zone
    if (this.searchFilters.zone_urbanistique) {
      results = results.filter(p => p.zone_urbanistique === this.searchFilters.zone_urbanistique);
    }

    // Filtrage par secteur
    if (this.searchFilters.secteur) {
      results = results.filter(p => p.secteur === this.searchFilters.secteur);
    }

    // Filtrage par surface
    if (this.searchFilters.surface_min !== undefined) {
      results = results.filter(p => p.surface_totale >= this.searchFilters.surface_min!);
    }
    if (this.searchFilters.surface_max !== undefined) {
      results = results.filter(p => p.surface_totale <= this.searchFilters.surface_max!);
    }

    // Filtrage par statut fiscal
    if (this.searchFilters.statut_fiscal) {
      results = results.filter(p => p.statut_fiscal === this.searchFilters.statut_fiscal);
    }

    // Filtrage par TNB
    if (this.searchFilters.tnb_min !== undefined) {
      results = results.filter(p => p.montant_total_tnb >= this.searchFilters.tnb_min!);
    }
    if (this.searchFilters.tnb_max !== undefined) {
      results = results.filter(p => p.montant_total_tnb <= this.searchFilters.tnb_max!);
    }

    this.searchResults = results;
    this.selectedParcelles.clear();
  }

  /**
   * Réinitialiser tous les filtres
   */
  resetFilters(): void {
    this.searchFilters = {
      reference_fonciere: '',
      proprietaire_nom: '',
      proprietaire_cin: '',
      proprietaire_rc: '',
      zone_urbanistique: '',
      secteur: '',
      surface_min: undefined,
      surface_max: undefined,
      statut_fiscal: '',
      tnb_min: undefined,
      tnb_max: undefined,
      annee_fiscale: undefined
    };
    
    this.searchResults = [...this.mockData];
    this.selectedParcelles.clear();
    this.searchPerformed = false;
    
    this.showNotification('Filtres réinitialisés', 'info');
  }

  /**
   * Activer un outil de recherche spatiale
   */
  activateSpatialTool(toolType: 'point' | 'polygon' | 'buffer' | 'intersection'): void {
    const toolNames = {
      point: 'recherche par point',
      polygon: 'recherche par polygone',
      buffer: 'recherche par buffer',
      intersection: 'intersection avec couche'
    };
    
    this.showNotification(`Outil spatial activé: ${toolNames[toolType]}`, 'info');
    // TODO: Implémenter les outils spatiaux avec OpenLayers
  }

  /**
   * Sélectionner/désélectionner une parcelle
   */
  toggleParcelleSelection(parcelleId: number): void {
    if (this.selectedParcelles.has(parcelleId)) {
      this.selectedParcelles.delete(parcelleId);
    } else {
      this.selectedParcelles.add(parcelleId);
    }
  }

  /**
   * Vérifier si une parcelle est sélectionnée
   */
  isParcelleSelected(parcelleId: number): boolean {
    return this.selectedParcelles.has(parcelleId);
  }

  /**
   * Sélectionner tous les résultats
   */
  selectAllResults(): void {
    this.searchResults.forEach(p => this.selectedParcelles.add(p.id));
    this.showNotification(`${this.searchResults.length} parcelles sélectionnées`, 'info');
  }

  /**
   * Désélectionner tous les résultats
   */
  deselectAllResults(): void {
    this.selectedParcelles.clear();
    this.showNotification('Sélection annulée', 'info');
  }

  /**
   * Basculer la sélection de tous les résultats
   */
  toggleAllResults(event: any): void {
    if (event.target.checked) {
      this.selectAllResults();
    } else {
      this.deselectAllResults();
    }
  }

  /**
   * Exporter les résultats sélectionnés en Excel
   */
  exportSelectedResults(): void {
    if (this.selectedParcelles.size === 0) {
      this.showNotification('Aucune parcelle sélectionnée pour l\'export', 'warning');
      return;
    }
    
    this.showNotification(`Export Excel de ${this.selectedParcelles.size} parcelles en cours...`, 'info');
    // TODO: Implémenter l'export Excel
  }

  /**
   * Exporter les résultats sélectionnés en CSV
   */
  exportSelectedResultsCSV(): void {
    if (this.selectedParcelles.size === 0) {
      this.showNotification('Aucune parcelle sélectionnée pour l\'export', 'warning');
      return;
    }
    
    this.showNotification(`Export CSV de ${this.selectedParcelles.size} parcelles en cours...`, 'info');
    // TODO: Implémenter l'export CSV
  }

  /**
   * Exporter les résultats sélectionnés en PDF
   */
  exportSelectedResultsPDF(): void {
    if (this.selectedParcelles.size === 0) {
      this.showNotification('Aucune parcelle sélectionnée pour l\'export', 'warning');
      return;
    }
    
    this.showNotification(`Export PDF de ${this.selectedParcelles.size} parcelles en cours...`, 'info');
    // TODO: Implémenter l'export PDF
  }

  /**
   * Exporter tous les résultats
   */
  exportResults(): void {
    if (this.searchResults.length === 0) {
      this.showNotification('Aucun résultat à exporter', 'warning');
      return;
    }
    
    this.showNotification(`Export de ${this.searchResults.length} parcelles en cours...`, 'info');
    // TODO: Implémenter l'export général
  }

  /**
   * Voir le détail d'une parcelle
   */
  viewParcelle(parcelleId: number): void {
    this.router.navigate(['/parcelles/detail', parcelleId]);
  }

  /**
   * Modifier une parcelle
   */
  editParcelle(parcelleId: number): void {
    this.router.navigate(['/parcelles/edit', parcelleId]);
  }

  /**
   * Afficher une parcelle sur la carte
   */
  showOnMap(parcelleId: number): void {
    this.router.navigate(['/parcelles/sig'], { queryParams: { parcelle: parcelleId } });
  }

  /**
   * Afficher toutes les parcelles
   */
  showAllParcelles(): void {
    this.router.navigate(['/parcelles/liste']);
  }

  /**
   * Retourner au dashboard
   */
  goBack(): void {
    this.router.navigate(['/parcelles']);
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
   * Fonction de suivi pour ngFor
   */
  trackByParcelleId(index: number, parcelle: SearchResult): number {
    return parcelle.id;
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
}
