// Énumérations basées sur votre BDD
export enum UserProfil {
  ADMIN = 'Admin',
  AGENT_FISCAL = 'AgentFiscal', 
  TECHNICIEN_SIG = 'TechnicienSIG',
  LECTEUR = 'Lecteur'
}

export enum StatutFoncier {
  TF = 'TF',
  R = 'R', 
  NI = 'NI',
  DOMANIAL = 'Domanial',
  COLLECTIF = 'Collectif'
}

export enum StatutOccupation {
  NU = 'Nu',
  CONSTRUIT = 'Construit',
  EN_CONSTRUCTION = 'En_Construction', 
  PARTIELLEMENT_CONSTRUIT = 'Partiellement_Construit'
}

export enum EtatValidation {
  BROUILLON = 'Brouillon',
  VALIDE = 'Valide', 
  PUBLIE = 'Publie',
  ARCHIVE = 'Archive'
}

export enum TypeDocument {
  CERTIFICAT = 'Certificat',
  PHOTO = 'Photo',
  REQUISITION = 'Requisition',
  PLAN = 'Plan', 
  AUTORISATION = 'Autorisation',
  AUTRE = 'Autre'
}

export enum ActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE', 
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT'
}

export enum StatutPayment {
  EN_ATTENTE = 'EnAttente',
  PAYE = 'Paye',
  RETARD = 'Retard',
  ANNULE = 'Annule'
}

export enum NatureProprietaire {
  PHYSIQUE = 'Physique', 
  MORALE = 'Morale'
}

// Types géométrie PostGIS
export interface GeometryPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeometryMultiPolygon {
  type: 'MultiPolygon';
  coordinates: number[][][][]; 
}

export interface GeometryPoint {
  type: 'Point';
  coordinates: [number, number];
}

export type Geometry = GeometryPolygon | GeometryMultiPolygon | GeometryPoint;

// Interface User (table users)
export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  nom: string;
  prenom?: string;
  profil: UserProfil;
  telephone?: string;
  est_actif: boolean;
  date_creation: string;
  date_modification: string;
  dernier_acces?: string;
}

// Interface Proprietaire (table proprietaires)
export interface Proprietaire {
  id: number;
  nom: string;
  prenom?: string;
  nature: NatureProprietaire;
  cin_ou_rc?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  date_creation: string;
  date_modification: string;
  est_actif: boolean;
}

// Interface ConfigurationZone (table configurations_zones)
export interface ConfigurationZone {
  id: number;
  code_zone: string;
  nom_zone: string;
  description?: string;
  couleur_carte: string;
  geometry?: GeometryMultiPolygon;
  actif: boolean;
  date_creation: string;
}

// Interface ConfigurationFiscale (table configurations_fiscales)  
export interface ConfigurationFiscale {
  id: number;
  zonage: string;
  tarif_unitaire: number;
  annee: number;
  actif: boolean;
  date_creation: string;
  creer_par?: number;
}

// Interface Parcelle (table parcelles)
export interface Parcelle {
  id: number;
  reference_fonciere: string;
  surface_totale?: number;
  surface_imposable?: number;
  statut_foncier?: StatutFoncier;
  statut_occupation?: StatutOccupation;
  zonage?: string;
  categorie_fiscale?: string;
  prix_unitaire_m2?: number;
  montant_total_tnb: number;
  exonere_tnb: boolean;
  date_permis?: string;
  duree_exoneration?: number;
  geometry?: GeometryPolygon;
  date_creation: string;
  date_modification: string;
  etat_validation: EtatValidation;
  derniere_mise_a_jour: string;
  version: number;
}

// Interface ParcelleProprietaire (table parcelle_proprietaires)
export interface ParcelleProprietaire {
  id: number;
  parcelle_id: number;
  proprietaire_id: number;
  quote_part: number;
  montant_individuel: number;
  date_debut: string;
  date_fin?: string;
  est_actif: boolean;
  date_creation: string;
  // Relations 
  parcelle?: Parcelle;
  proprietaire?: Proprietaire;
}

// Interface FicheFiscale (table fiches_fiscales) 
export interface FicheFiscale {
  id: number;
  parcelle_proprietaire_id: number;
  code_unique: string;
  annee: number;
  date_generation: string;
  date_limite_payment: string;
  montant_tnb: number;
  montant_paye: number;
  statut_payment: StatutPayment;
  chemin_fichier_pdf?: string;
  genere_par?: number;
  date_creation: string;
  // Relation
  parcelle_proprietaire?: ParcelleProprietaire;
}

// Interface DocumentJoint (table documents_joints)
export interface DocumentJoint {
  id: number;
  parcelle_id: number;
  proprietaire_id?: number;
  type_doc?: TypeDocument;
  nom_fichier: string;
  chemin_fichier: string;
  taille_fichier?: number;
  mime_type?: string;
  description?: string;
  uploader_par?: number;
  date_ajout: string;
  est_valide: boolean;
  // Relations
  parcelle?: Parcelle;
  proprietaire?: Proprietaire;
}

// Interface JournalAction (table journal_actions)
export interface JournalAction {
  id: number;
  utilisateur_id?: number;
  action: ActionType;
  date_heure: string;
  table_cible: string;
  id_cible?: number;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  // Relation
  utilisateur?: User;
}

// Interfaces pour les vues
export interface VueParcelleProprietaire {
  id: number;
  reference_fonciere: string;
  surface_totale?: number;
  surface_imposable?: number;
  montant_total_tnb: number;
  etat_validation: EtatValidation;
  zonage?: string;
  statut_foncier?: StatutFoncier;
  exonere_tnb: boolean;
  date_permis?: string;
  duree_exoneration?: number;
  proprietaires?: string;
  quotes_parts?: string;
  nombre_proprietaires: number;
  montant_total_proprietaires: number;
  quote_part_moyenne: number;
  date_creation: string;
  date_modification: string;
  surface_calculee_gis?: number;
}

export interface VueStatistiquesTnb {
  total_parcelles: number;
  parcelles_brouillon: number;
  parcelles_validees: number;
  parcelles_publiees: number;
  parcelles_imposables: number;
  parcelles_exonerees: number;
  surface_totale_commune: number;
  surface_imposable_totale: number;
  recettes_prevues: number;
  prix_moyen_m2: number;
  parcelles_avec_permis: number;
  taux_imposition_pct: number;
}

export interface VueStatistiquesParZone {
  zonage?: string;
  nom_zone?: string;
  couleur_carte?: string;
  nombre_parcelles: number;
  surface_totale: number;
  surface_imposable: number;
  recettes_zone: number;
  prix_moyen_zone: number;
  parcelles_exonerees: number;
  taux_imposition_pct: number;
}

export interface VueDashboardFiches {
  annee: number;
  total_fiches: number;
  fiches_payees: number;
  fiches_en_attente: number;
  fiches_en_retard: number;
  montant_total_emis: number;
  montant_total_paye: number;
  taux_recouvrement_pct: number;
}

// Types utilitaires pour l'API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilters {
  page?: number;
  limit?: number;
  search?: string;
  zonage?: string;
  statut_foncier?: StatutFoncier;
  etat_validation?: EtatValidation;
  exonere_tnb?: boolean;
  date_debut?: string;
  date_fin?: string;
}

// Interfaces spécifiques au projet TNB
export interface ParcelleWithDetails extends Parcelle {
  proprietaires: Proprietaire[];
  quotes_parts: ParcelleProprietaire[];
  documents_joints: DocumentJoint[];
  fiches_fiscales: FicheFiscale[];
  surface_calculee?: number;
  centroide?: [number, number];
}

export interface StatistiquesDashboard {
  vue_statistiques_tnb: VueStatistiquesTnb;
  vue_statistiques_par_zone: VueStatistiquesParZone[];
  vue_dashboard_fiches: VueDashboardFiches[];
}

// Types pour l'import/export
export interface ImportResult {
  success: boolean;
  imported_count: number;
  failed_count: number;
  errors: string[];
  warnings: string[];
}

export interface ExportOptions {
  format: 'excel' | 'csv' | 'geojson' | 'shapefile' | 'pdf';
  filters?: SearchFilters;
  include_geometry?: boolean;
  include_documents?: boolean;
}

// Types pour les requêtes spatiales
export interface SpatialQuery {
  geometry: Geometry;
  operation: 'intersects' | 'contains' | 'within' | 'touches' | 'distance';
  distance?: number; // en mètres pour l'opération distance
}

export interface SpatialSearchResult {
  parcelles: Parcelle[];
  total_found: number;
  search_area: number; // superficie de la zone de recherche en m²
}

// Types pour le workflow de validation
export interface WorkflowTransition {
  from_state: EtatValidation;
  to_state: EtatValidation;
  required_roles: UserProfil[];
  validation_rules: string[];
}

// Types pour les notifications
export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  notification_types: {
    fiche_generated: boolean;
    payment_received: boolean;
    parcelle_validated: boolean;
    document_uploaded: boolean;
  };
}

// Interface pour les fichiers uploadés
export interface UploadedFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: any;
}

// Types pour la configuration système
export interface SystemConfig {
  fiscal_year: number;
  default_tax_rates: { [zonage: string]: number };
  exemption_rules: {
    duration_by_surface: { [surface: string]: number };
    max_exemption_years: number;
  };
  validation_workflow: WorkflowTransition[];
}