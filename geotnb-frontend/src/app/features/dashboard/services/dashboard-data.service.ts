import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { 
  DashboardData, 
  DashboardKPIs, 
  StatutFoncierData, 
  ZonageUrbanistiqueData, 
  EvolutionMensuelleData, 
  TopParcelleTNB, 
  ActiviteRecente 
} from '../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {

  constructor() {}

  /**
   * Récupérer toutes les données du dashboard (données de démonstration)
   */
  getDashboardData(): Observable<DashboardData> {
    console.log('🔄 Chargement des données de démonstration du dashboard...');
    return of(this.getDemoData());
  }

  /**
   * Récupérer les KPIs (données de démonstration)
   */
  getKPIs(): Observable<DashboardKPIs> {
    console.log('🔄 Chargement des KPIs de démonstration...');
    return of(this.getDemoKPIs());
  }

  /**
   * Récupérer les données de statut foncier (données de démonstration)
   */
  getStatutFoncierData(): Observable<StatutFoncierData> {
    console.log('🔄 Chargement des données de statut foncier de démonstration...');
    return of(this.getDemoStatutFoncier());
  }

  /**
   * Récupérer les données de zonage urbanistique (données de démonstration)
   */
  getZonageUrbanistiqueData(): Observable<ZonageUrbanistiqueData> {
    console.log('🔄 Chargement des données de zonage de démonstration...');
    return of(this.getDemoZonageUrbanistique());
  }

  /**
   * Récupérer l'évolution mensuelle (données de démonstration)
   */
  getEvolutionMensuelle(): Observable<EvolutionMensuelleData[]> {
    console.log('🔄 Chargement des données d\'évolution mensuelle de démonstration...');
    return of(this.getDemoEvolutionMensuelle());
  }

  /**
   * Récupérer le top des parcelles TNB (données de démonstration)
   */
  getTopParcellesTNB(): Observable<TopParcelleTNB[]> {
    console.log('🔄 Chargement des données du top des parcelles de démonstration...');
    return of(this.getDemoTopParcelles());
  }

  /**
   * Récupérer les activités récentes (données de démonstration)
   */
  getActivitesRecentes(): Observable<ActiviteRecente[]> {
    console.log('🔄 Chargement des activités récentes de démonstration...');
    return of(this.getDemoActivites());
  }

  // =====================================================
  // DONNÉES DE DÉMONSTRATION
  // =====================================================

  private getDemoData(): DashboardData {
    return {
      kpis: this.getDemoKPIs(),
      statutFoncier: this.getDemoStatutFoncier(),
      zonageUrbanistique: this.getDemoZonageUrbanistique(),
      evolutionMensuelle: this.getDemoEvolutionMensuelle(),
      topParcellesTNB: this.getDemoTopParcelles(),
      activitesRecentes: this.getDemoActivites(),
      lastUpdate: new Date()
    };
  }

  private getDemoKPIs(): DashboardKPIs {
    const totalTerrains = 15847;
    const terrainsImposables = 12456;
    const superficieTotale = 2847;
    const surfaceImposable = 1956;
    
    return {
      terrainsRecenses: totalTerrains,
      totalTerrains: totalTerrains,
      terrainsImposables: terrainsImposables,
      superficieTotale: superficieTotale,
      surfaceImposable: surfaceImposable,
      rendementPrevisionnel: 8.4,
      tauxAssujettissement: 72.3,
      tauxImposition: terrainsImposables / totalTerrains,
      tauxSurfaceImposable: surfaceImposable / superficieTotale,
      evolutionMensuelle: 12.3,
      evolutionImposables: 8.7,
      evolutionSuperficie: 5.2,
      evolutionRendement: 15.8,
      evolutionTaux: 3.1
    };
  }

  private getDemoStatutFoncier(): StatutFoncierData {
    return {
      titreFoncier: 7250,      // TF - Titre Foncier
      requisition: 3420,       // R - Réquisition
      nonImmatricule: 4890,    // NI - Non Immatriculé
      domanial: 287,           // Domanial
      collectif: 0             // Collectif
    };
  }

  private getDemoZonageUrbanistique(): ZonageUrbanistiqueData {
    return {
      r1: 4200,      // R1 - Résidentiel dense
      r2: 3800,      // R2 - Résidentiel moyen
      r3: 2900,      // R3 - Résidentiel faible
      industriel: 1200, // I - Industriel
      commercial: 0  // C - Commercial
    };
  }

  private getDemoEvolutionMensuelle(): EvolutionMensuelleData[] {
    return [
      { month: 'Jan', value: 0.6, recettes: 0.6, parcelles: 45 },
      { month: 'Fév', value: 0.8, recettes: 0.8, parcelles: 52 },
      { month: 'Mar', value: 1.2, recettes: 1.2, parcelles: 68 },
      { month: 'Avr', value: 0.9, recettes: 0.9, parcelles: 58 },
      { month: 'Mai', value: 1.1, recettes: 1.1, parcelles: 62 },
      { month: 'Jun', value: 0.7, recettes: 0.7, parcelles: 48 }
    ];
  }

  private getDemoTopParcelles(): TopParcelleTNB[] {
    return [
      { id: 1, referenceFonciere: 'P-2024-001', proprietaire: 'Ahmed BENALI', montantTNB: 12500, statut: 'Valide', quartier: 'Centre-ville' },
      { id: 2, referenceFonciere: 'P-2024-002', proprietaire: 'Fatima ALAOUI', montantTNB: 9800, statut: 'Valide', quartier: 'Hay Al Qods' },
      { id: 3, referenceFonciere: 'P-2024-003', proprietaire: 'Mohamed CHERKAOUI', montantTNB: 8750, statut: 'Brouillon', quartier: 'Sidi Maâfa' },
      { id: 4, referenceFonciere: 'P-2024-004', proprietaire: 'Aicha EL FASSI', montantTNB: 7200, statut: 'Valide', quartier: 'Al Andalous' },
      { id: 5, referenceFonciere: 'P-2024-005', proprietaire: 'Hassan BOUZIDI', montantTNB: 6800, statut: 'Valide', quartier: 'Centre-ville' }
    ];
  }

  private getDemoActivites(): ActiviteRecente[] {
    return [
      {
        id: 1,
        type: 'Création',
        description: 'Parcelle P-2024-001 créée',
        utilisateur: 'admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        parcelleReference: 'P-2024-001'
      },
      {
        id: 2,
        type: 'Validation',
        description: 'Parcelle P-2024-002 validée',
        utilisateur: 'technicien',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        parcelleReference: 'P-2024-002'
      },
      {
        id: 3,
        type: 'Modification',
        description: 'Surface mise à jour pour P-2024-003',
        utilisateur: 'agent',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        parcelleReference: 'P-2024-003'
      },
      {
        id: 4,
        type: 'Export',
        description: 'Export Excel des parcelles validées',
        utilisateur: 'admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        montant: 125000
      },
      {
        id: 5,
        type: 'Génération',
        description: 'Fiche fiscale générée pour P-2024-004',
        utilisateur: 'agent',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        parcelleReference: 'P-2024-004',
        montant: 7200
      }
    ];
  }
}