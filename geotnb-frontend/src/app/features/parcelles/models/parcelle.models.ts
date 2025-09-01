// =====================================================
// MODELS PARCELLES - INTERFACES TYPESCRIPT COMPLÈTES
// =====================================================

import { Geometry } from 'geojson';

// Énumérations pour les statuts (correspondant exactement à la BDD)
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

export enum NatureProprietaire {
  PHYSIQUE = 'Physique',
  MORALE = 'Morale'
}

export enum UserProfil {
  ADMIN = 'Admin',
  AGENT_FISCAL = 'AgentFiscal',
  TECHNICIEN_SIG = 'TechnicienSIG',
  LECTEUR = 'Lecteur'
}

// Interface principale Parcelle (noms correspondant exactement à la BDD)
export interface Parcelle {
  id: number;
  reference_fonciere: string;
  surface_totale: number;
  surface_imposable: number;
  statut_foncier: StatutFoncier;
  statut_occupation: StatutOccupation;
  zonage: string;
  categorie_fiscale: string;
  prix_unitaire_m2: number;
  montant_total_tnb: number;
  exonere_tnb: boolean;
  date_permis?: Date;
  duree_exoneration?: number;
  geometry?: Geometry;
  date_creation: Date;
  date_modification: Date;
  etat_validation: EtatValidation;
  derniere_mise_a_jour: Date;
  version: number;
  
  // Relations
  proprietaires?: ParcelleProprietaire[];
  documents?: DocumentJoint[];
  
  // Propriétés calculées (pour l'affichage frontend)
  pourcentageSurfaceImposable?: number;
  estExonereeTemporairement?: boolean;
  dateExpirationExoneration?: Date;
  prixTnbParM2?: number;
}

// Interface pour les relations parcelle-propriétaire (noms BDD)
export interface ParcelleProprietaire {
  id: number;
  parcelle_id: number;
  proprietaire_id: number;
  quote_part: number;
  montant_individuel: number;
  date_debut: Date;
  date_fin?: Date;
  est_actif: boolean;
  date_creation: Date;
  
  // Relations
  parcelle?: Parcelle;
  proprietaire?: Proprietaire;
  
  // Propriétés calculées (pour l'affichage frontend)
  pourcentageQuotePart?: number;
  periodeValidite?: string;
  quotePartValide?: boolean;
}

// Interface Propriétaire (noms BDD)
export interface Proprietaire {
  id: number;
  nom: string;
  prenom?: string;
  nature: 'Physique' | 'Morale';
  cin_ou_rc?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  date_creation: Date;
  date_modification: Date;
  est_actif: boolean;
  
  // Propriétés calculées (pour l'affichage frontend)
  nomComplet?: string;
  typeIdentifiant?: string;
  identifiantValide?: boolean;
  contactsDisponibles?: string[];
}

// Interface Document Joint (noms BDD)
export interface DocumentJoint {
  id: number;
  parcelle_id: number;
  proprietaire_id?: number;
  type_doc: 'Certificat' | 'Photo' | 'Requisition' | 'Plan' | 'Autorisation' | 'Autre';
  nom_fichier: string;
  chemin_fichier: string;
  taille_fichier?: number;
  mime_type?: string;
  description?: string;
  uploader_par?: number;
  auteur_ajout?: string;
  date_ajout: Date;
  est_valide: boolean;
  
  // Propriétés calculées (pour l'affichage frontend)
  tailleFichierFormatee?: string;
  estImage?: boolean;
  estPDF?: boolean;
  extensionFichier?: string;
}

// DTOs pour les formulaires (utilisant les noms BDD)
export interface CreateParcelleDto {
  reference_fonciere: string;
  surface_totale: number;
  surface_imposable: number;
  statut_foncier: StatutFoncier;
  statut_occupation: StatutOccupation;
  zonage: string;
  categorie_fiscale?: string;
  exonere_tnb: boolean;
  date_permis?: Date;
  duree_exoneration?: number;
  geometry?: Geometry;
}

export interface UpdateParcelleDto extends Partial<CreateParcelleDto> {
  id: number;
  etat_validation?: EtatValidation;
  derniere_mise_a_jour?: Date;
}

export interface SearchParcelleDto {
  reference_fonciere?: string;
  proprietaire?: string;
  zonage?: string;
  statut_foncier?: StatutFoncier;
  statut_occupation?: StatutOccupation;
  etat_validation?: EtatValidation;
  surface_min?: number;
  surface_max?: number;
  montant_min?: number;
  montant_max?: number;
  exonere_tnb?: boolean;
  date_creation_debut?: Date;
  date_creation_fin?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  // Propriétés supplémentaires pour compatibilité
  search?: string;
  proprietaire_nom?: string;
  surface_imposable_min?: number;
  surface_imposable_max?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  montantMin?: number;
  montantMax?: number;
  dateCreationDebut?: Date;
  dateCreationFin?: Date;
}

// Interface pour les résultats paginés
export interface PaginatedResult<T> {
  data: T[];
  items: T[]; // Alias pour compatibilité
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface pour les statistiques parcelles
export interface ParcelleStats {
  totalParcelles: number;
  parcellesBrouillon: number;
  parcellesValidees: number;
  parcellesPubliees: number;
  parcellesImposables: number;
  parcellesExonerees: number;
  surfaceTotaleCommunne: number;
  surfaceImposableTotale: number;
  recettesPrevues: number;
  prixMoyenM2: number;
  parcellesAvecPermis: number;
  tauxImpositionPct: number;
}

// Interface pour les requêtes spatiales
export interface SpatialQueryDto {
  geometry: Geometry;
  operation: 'intersects' | 'contains' | 'within' | 'touches' | 'crosses';
  buffer?: number;
  srid?: number;
}

// Interface pour les résultats de validation
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// Interface pour les actions workflow
export interface WorkflowAction {
  action: string;
  fromState: EtatValidation;
  toState: EtatValidation;
  comment?: string;
  userId: number;
}

// Interface pour l'historique
export interface ParcelleHistory {
  id: number;
  parcelleId: number;
  action: string;
  dateAction: Date;
  utilisateur: string;
  details: any;
  anciennesValeurs?: any;
  nouvellesValeurs?: any;
}

// Interface pour l'export
export interface ExportOptions {
  format: 'excel' | 'csv' | 'geojson' | 'shapefile' | 'pdf';
  filters?: SearchParcelleDto;
  fields?: string[];
  includeGeometry?: boolean;
  includeDocuments?: boolean;
  includeProprietaires?: boolean;
}

// Types utilitaires
export type ParcelleFormMode = 'create' | 'edit' | 'view';
export type ParcelleTabIndex = 0 | 1 | 2 | 3; // General, Fiscal, Geometry, Proprietaires

// Interface pour la configuration des zones
export interface ZoneConfig {
  id: number;
  codeZone: string;
  nomZone: string;
  description?: string;
  couleurCarte: string;
  geometry?: Geometry;
  actif: boolean;
  dateCreation: Date;
}

// Interface pour la configuration fiscale (noms BDD)
export interface ConfigurationFiscale {
  id: number;
  zonage: string;
  tarif_unitaire: number;
  annee: number;
  actif: boolean;
  date_creation: Date;
  creer_par?: number;
}

// Interface pour la configuration des zones (noms BDD)
export interface ConfigurationZone {
  id: number;
  code_zone: string;
  nom_zone: string;
  description?: string;
  couleur_carte: string;
  geometry?: Geometry;
  actif: boolean;
  date_creation: Date;
}

// Interface User (noms BDD)
export interface User {
  id: number;
  username: string;
  password?: string; // Ne jamais exposer côté frontend
  email: string;
  nom: string;
  prenom?: string;
  profil: UserProfil;
  telephone?: string;
  est_actif: boolean;
  date_creation: Date;
  date_modification: Date;
  dernier_acces?: Date;
}

// Interface Fiche Fiscale (noms BDD)
export interface FicheFiscale {
  id: number;
  parcelle_proprietaire_id: number;
  code_unique: string;
  annee: number;
  date_generation: Date;
  date_limite_payment: Date;
  montant_tnb: number;
  categorie_fiscale?: string;
  tarif?: number;
  surface_imposable?: number;
  montant_paye: number;
  statut_payment: 'EnAttente' | 'Paye' | 'Retard' | 'Annule';
  chemin_fichier_pdf?: string;
  genere_par: number;
  date_creation: Date;
  
  // Relations
  parcelleProprietaire?: ParcelleProprietaire;
  genereParUtilisateur?: User;
  
  // Propriétés calculées (pour l'affichage frontend)
  montantRestant?: number;
  estPayee?: boolean;
  estEnRetard?: boolean;
  pourcentagePaiement?: number;
  joursRetard?: number;
  statutPaymentLibelle?: string;
}

// Interface Journal Action (noms BDD)
export interface JournalAction {
  id: number;
  utilisateur_id?: number;
  action: string;
  date_heure: Date;
  table_cible: string;
  id_cible?: number;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  
  // Relations
  utilisateur?: User;
  
  // Propriétés calculées (pour l'affichage frontend)
  descriptionAction?: string;
  nomTableCible?: string;
  resume?: string;
  estActionCritique?: boolean;
  detailsFormates?: string;
}
