// ========================================
// INTERFACES COMPATIBLES AVEC LA BASE DE DONNÉES
// ========================================

/**
 * Interface principale d'une parcelle (table parcelles)
 */
export interface Parcelle {
  id: number;
  reference_fonciere: string;
  surface_totale: number; // en m²
  surface_imposable: number; // en m²
  coordonnees: string; // WKT geometry
  zone_urbanistique: string; // R1, R2, R3, I, C
  secteur: string; // centre, nord, sud, est, ouest
  statut_foncier: string; // nu, construit, en_construction
  statut_fiscal: string; // imposable, exonere, en_cours
  prix_unitaire_m2: number; // tarif en DH/m²
  montant_total_tnb: number; // TNB calculée en DH
  annee_fiscale: number;
  date_creation: Date;
  date_modification: Date;
  date_validation: Date | null;
  date_publication: Date | null;
  statut_workflow: 'brouillon' | 'valide' | 'publie';
  utilisateur_creation: string;
  utilisateur_modification: string;
  utilisateur_validation: string | null;
  commentaires: string | null;
  geometrie: any; // PostGIS geometry
}

/**
 * Interface pour un propriétaire (table proprietaires)
 */
export interface Proprietaire {
  id: number;
  type: 'personne_physique' | 'personne_morale';
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  cin: string | null;
  rc: string | null;
  adresse: string;
  telephone: string | null;
  email: string | null;
  date_naissance: Date | null;
  lieu_naissance: string | null;
  nationalite: string;
  profession: string | null;
  date_creation: Date;
  date_modification: Date;
  statut: 'actif' | 'inactif';
}

/**
 * Interface pour la relation parcelle-propriétaire (table parcelle_proprietaires)
 */
export interface ParcelleProprietaire {
  id: number;
  parcelle_id: number;
  proprietaire_id: number;
  quote_part: number; // pourcentage (ex: 50.0 pour 50%)
  date_debut: Date;
  date_fin: Date | null;
  statut: 'actif' | 'historique';
  type_titre: string; // propriété, usufruit, etc.
  reference_titre: string | null;
  date_creation: Date;
  date_modification: Date;
}

/**
 * Interface pour les documents (table documents)
 */
export interface Document {
  id: number;
  parcelle_id: number;
  type_document: string; // plan, certificat, photo, etc.
  nom_fichier: string;
  chemin_fichier: string;
  taille_fichier: number; // en bytes
  format_fichier: string; // pdf, jpg, png, etc.
  description: string | null;
  date_upload: Date;
  utilisateur_upload: string;
  statut: 'valide' | 'en_attente' | 'rejete';
}

/**
 * Interface pour l'historique des actions (table historique_actions)
 */
export interface HistoriqueAction {
  id: number;
  parcelle_id: number;
  type_action: string; // creation, modification, suppression, validation, etc.
  description: string;
  utilisateur: string;
  date_action: Date;
  donnees_avant: any | null; // JSON des données avant modification
  donnees_apres: any | null; // JSON des données après modification
  ip_utilisateur: string | null;
  user_agent: string | null;
}

/**
 * Interface pour les zones urbanistiques (table zones_urbanistiques)
 */
export interface ZoneUrbanistique {
  id: number;
  code: string; // R1, R2, R3, I, C
  nom: string; // Résidentiel, Industriel, Commercial
  description: string;
  tarif_base: number; // tarif de base en DH/m²
  coefficient_majoration: number; // coefficient de majoration
  geometrie: any; // PostGIS geometry
  statut: 'actif' | 'inactif';
}

/**
 * Interface pour les secteurs (table secteurs)
 */
export interface Secteur {
  id: number;
  code: string; // centre, nord, sud, est, ouest
  nom: string; // Centre-ville, Secteur Nord, etc.
  description: string;
  geometrie: any; // PostGIS geometry
  statut: 'actif' | 'inactif';
}

/**
 * Interface pour les filtres de recherche
 */
export interface SearchFilters {
  reference_fonciere?: string;
  proprietaire_nom?: string;
  proprietaire_cin?: string;
  proprietaire_rc?: string;
  zone_urbanistique?: string;
  secteur?: string;
  surface_min?: number;
  surface_max?: number;
  statut_fiscal?: string;
  tnb_min?: number;
  tnb_max?: number;
  annee_fiscale?: number;
  statut_workflow?: string;
  date_creation_debut?: Date;
  date_creation_fin?: Date;
}

/**
 * Interface pour les résultats de recherche
 */
export interface SearchResult {
  parcelle: Parcelle;
  proprietaires: Proprietaire[];
  zone_urbanistique: ZoneUrbanistique;
  secteur: Secteur;
  documents_count: number;
  surface_imposable_formatted: string;
  tnb_formatted: string;
}

/**
 * Interface pour les statistiques en temps réel
 */
export interface ParcellesStats {
  total_parcelles: number;
  parcelles_imposables: number;
  parcelles_exonerees: number;
  parcelles_en_cours: number;
  surface_totale: number; // en hectares
  surface_imposable: number; // en hectares
  tnb_totale: number; // en DH
  tnb_collectee: number; // en DH
  repartition_par_zone: { [zone: string]: number };
  repartition_par_secteur: { [secteur: string]: number };
  repartition_par_statut: { [statut: string]: number };
  evolution_mensuelle: { mois: string; nouvelles_parcelles: number; tnb: number }[];
}

/**
 * Interface pour les paramètres de pagination
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Interface pour la réponse paginée
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Interface pour les filtres spatiaux
 */
export interface SpatialFilters {
  type: 'point' | 'polygon' | 'buffer' | 'intersection';
  coordinates?: number[][]; // [longitude, latitude]
  buffer_distance?: number; // en mètres
  layer_name?: string; // nom de la couche pour intersection
  geometrie?: any; // PostGIS geometry
}

/**
 * Interface pour l'export des données
 */
export interface ExportParams {
  format: 'excel' | 'csv' | 'pdf' | 'geojson' | 'shapefile';
  filters: SearchFilters;
  spatial_filters?: SpatialFilters;
  columns?: string[]; // colonnes à exporter
  include_geometrie?: boolean;
  include_documents?: boolean;
}

/**
 * Interface pour la création d'une parcelle
 */
export interface CreateParcelleRequest {
  reference_fonciere: string;
  surface_totale: number;
  surface_imposable: number;
  coordonnees: string; // WKT
  zone_urbanistique: string;
  secteur: string;
  statut_foncier: string;
  prix_unitaire_m2: number;
  proprietaires: {
    proprietaire_id: number;
    quote_part: number;
    type_titre: string;
    reference_titre?: string;
  }[];
  commentaires?: string;
}

/**
 * Interface pour la modification d'une parcelle
 */
export interface UpdateParcelleRequest {
  surface_totale?: number;
  surface_imposable?: number;
  coordonnees?: string; // WKT
  zone_urbanistique?: string;
  secteur?: string;
  statut_foncier?: string;
  prix_unitaire_m2?: number;
  commentaires?: string;
}

/**
 * Interface pour la validation d'une parcelle
 */
export interface ValidateParcelleRequest {
  statut_workflow: 'valide' | 'publie';
  commentaires?: string;
}

/**
 * Interface pour la réponse API standard
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: { [key: string]: string[] };
}

/**
 * Interface pour les métadonnées de la carte
 */
export interface MapMetadata {
  parcelle_id: number;
  reference_fonciere: string;
  surface_totale: number;
  surface_imposable: number;
  zone_urbanistique: string;
  secteur: string;
  statut_fiscal: string;
  tnb: number;
  proprietaires: string[]; // noms des propriétaires
  documents_count: number;
  date_creation: Date;
  statut_workflow: string;
}
