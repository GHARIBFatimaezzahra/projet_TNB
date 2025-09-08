/* =====================================================
   DASHBOARD MODELS - MODÈLES DE DONNÉES
   ===================================================== */

// Interface pour les KPIs principaux
export interface DashboardKPIs {
  terrainsRecenses: number;
  totalTerrains: number; // Alias pour terrainsRecenses
  terrainsImposables: number;
  superficieTotale: number;
  surfaceImposable: number;
  rendementPrevisionnel: number;
  tauxAssujettissement: number;
  tauxImposition: number; // Taux d'imposition (terrainsImposables / totalTerrains)
  tauxSurfaceImposable: number; // Taux de surface imposable (surfaceImposable / superficieTotale)
  evolutionMensuelle: number;
  evolutionImposables: number;
  evolutionSuperficie: number;
  evolutionRendement: number;
  evolutionTaux: number;
}

// Interface pour les données de statut foncier (cohérent avec la création des parcelles)
export interface StatutFoncierData {
  titreFoncier: number;      // TF - Titre Foncier
  requisition: number;       // R - Réquisition
  nonImmatricule: number;    // NI - Non Immatriculé
  domanial: number;          // Domanial
  collectif: number;         // Collectif
}

// Interface pour les données de zonage urbanistique (cohérent avec la création des parcelles)
export interface ZonageUrbanistiqueData {
  r1: number;        // R1 - Résidentiel dense
  r2: number;        // R2 - Résidentiel moyen
  r3: number;        // R3 - Résidentiel faible
  industriel: number; // I - Industriel
  commercial: number; // C - Commercial
}

// Interface pour l'évolution mensuelle
export interface EvolutionMensuelleData {
  month: string;
  value: number;
  recettes: number;
  parcelles: number;
}

// Interface pour le top des parcelles TNB
export interface TopParcelleTNB {
  id: number;
  referenceFonciere: string;
  montantTNB: number;
  statut: string;
  proprietaire: string;
  quartier: string;
}

// Interface pour les activités récentes
export interface ActiviteRecente {
  id: number;
  type: string;
  description: string;
  utilisateur: string;
  timestamp: Date;
  parcelleReference?: string;
  montant?: number;
}

// Interface principale pour toutes les données du dashboard
export interface DashboardData {
  kpis: DashboardKPIs;
  statutFoncier: StatutFoncierData;
  zonageUrbanistique: ZonageUrbanistiqueData;
  evolutionMensuelle: EvolutionMensuelleData[];
  topParcellesTNB: TopParcelleTNB[];
  activitesRecentes: ActiviteRecente[];
  lastUpdate: Date;
}

// Interface pour les filtres du dashboard
export interface DashboardFilters {
  annee: number;
  statut: string;
  zonage: string;
  quartier: string;
  secteur: string;
  dateDebut?: Date;
  dateFin?: Date;
}

// Interface pour les options d'export
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeMaps: boolean;
  includeTables: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Interface pour les paramètres de la carte
export interface MapSettings {
  center: [number, number];
  zoom: number;
  layers: string[];
  showParcelles: boolean;
  showLayers: boolean;
  showLegend: boolean;
}

// Interface pour les statistiques en temps réel
export interface RealTimeStats {
  totalParcelles: number;
  parcellesImposables: number;
  parcellesExonerees: number;
  superficieTotale: number;
  superficieImposable: number;
  recettesTotales: number;
  recettesMensuelles: number;
  tauxRecouvrement: number;
  dernierUpdate: Date;
}

// Interface pour les alertes du dashboard
export interface DashboardAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    callback: () => void;
  };
}

// Interface pour les métriques de performance
export interface PerformanceMetrics {
  tempsChargement: number;
  nombreRequetes: number;
  tailleDonnees: number;
  erreurs: number;
  dernierRefresh: Date;
}

// Interface pour les préférences utilisateur
export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'fr' | 'ar' | 'en';
  autoRefresh: boolean;
  refreshInterval: number;
  defaultFilters: DashboardFilters;
  chartTypes: {
    statutFoncier: 'donut' | 'pie' | 'bar';
    evolutionMensuelle: 'line' | 'bar' | 'area';
    zonageUrbanistique: 'bar' | 'column' | 'pie';
  };
}

// Interface pour les notifications
export interface DashboardNotification {
  id: string;
  type: 'update' | 'error' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url?: string;
    callback?: () => void;
  };
}

// Interface pour les métadonnées du dashboard
export interface DashboardMetadata {
  version: string;
  lastUpdate: Date;
  dataSource: string;
  refreshInterval: number;
  totalRecords: number;
  filters: DashboardFilters;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

// Interface pour les paramètres de configuration
export interface DashboardConfig {
  apiUrl: string;
  refreshInterval: number;
  maxRetries: number;
  timeout: number;
  enableRealTime: boolean;
  enableNotifications: boolean;
  enableExport: boolean;
  enableFilters: boolean;
  enableCharts: boolean;
  enableMaps: boolean;
}

// Interface pour les erreurs du dashboard
export interface DashboardError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  component?: string;
  action?: string;
}

// Interface pour les statistiques de chargement
export interface LoadingStats {
  isLoading: boolean;
  progress: number;
  currentStep: string;
  totalSteps: number;
  startTime: Date;
  estimatedTime?: number;
}

// Interface pour les métriques de qualité des données
export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
  lastValidation: Date;
}

// Interface pour les paramètres de la carte thématique
export interface ThematicMapSettings {
  baseLayer: string;
  overlayLayers: string[];
  colorScheme: string;
  classification: 'equal' | 'quantile' | 'natural' | 'custom';
  numberOfClasses: number;
  showLabels: boolean;
  showLegend: boolean;
  showScale: boolean;
  showNorthArrow: boolean;
}

// Interface pour les données de géolocalisation
export interface GeoLocationData {
  latitude: number;
  longitude: number;
  address?: string;
  quartier?: string;
  secteur?: string;
  commune?: string;
  region?: string;
}

// Interface pour les paramètres d'export
export interface ExportSettings {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeMaps: boolean;
  includeTables: boolean;
  includeMetadata: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: DashboardFilters;
  filename?: string;
}
