import { StatutFoncier } from './enums/statut-foncier.enum';
import { StatutOccupation } from './enums/statut-occupation.enum';
import { EtatValidation } from './enums/etat-validation.enum';

export interface Geometry {
  type: 'Polygon' | 'MultiPolygon' | 'Point';
  coordinates: number[][][] | number[][][][];
}

export interface Parcelle {
  id: number;
  referenceFonciere: string;
  surfaceTotale: number;
  surfaceImposable: number;
  statutFoncier: StatutFoncier;
  statutOccupation: StatutOccupation;
  zonage: string;
  categorieFiscale: string;
  prixUnitaireM2: number;
  montantTotalTNB: number;
  exonereTNB: boolean;
  datePermis?: Date;
  dureeExoneration?: number;
  geometry: Geometry;
  dateCreation: Date;
  dateModification?: Date;
  etatValidation: EtatValidation;
  
  // Relations - Forward declarations (will be resolved at runtime)
  proprietaires?: ParcelleProprietaire[];
  documentsJoints?: DocumentJoint[];
  fichesFiscales?: FicheFiscale[];
}

export interface CreateParcelleDto {
  referenceFonciere: string;
  surfaceTotale: number;
  surfaceImposable: number;
  statutFoncier: StatutFoncier;
  statutOccupation: StatutOccupation;
  zonage: string;
  categorieFiscale: string;
  prixUnitaireM2: number;
  exonereTNB?: boolean;
  datePermis?: Date;
  dureeExoneration?: number;
  geometry: Geometry;
  etatValidation?: EtatValidation;
}

export interface UpdateParcelleDto {
  referenceFonciere?: string;
  surfaceTotale?: number;
  surfaceImposable?: number;
  statutFoncier?: StatutFoncier;
  statutOccupation?: StatutOccupation;
  zonage?: string;
  categorieFiscale?: string;
  prixUnitaireM2?: number;
  exonereTNB?: boolean;
  datePermis?: Date;
  dureeExoneration?: number;
  geometry?: Geometry;
  etatValidation?: EtatValidation;
}

// Forward declarations for related interfaces
export interface ParcelleProprietaire {
  id: number;
  parcelleId: number;
  proprietaireId: number;
  quotePart: number;
  montantIndividuel: number;
}

export interface DocumentJoint {
  id: number;
  parcelleId: number;
  typeDoc: string;
  cheminFichier: string;
  nomFichier: string;
  tailleFichier: number;
  mimeType: string;
  dateAjout: Date;
}

export interface FicheFiscale {
  id: number;
  parcelleId: number;
  codeUnique: string;
  dateGeneration: Date;
  montantTNB: number;
  anneeExercice: number;
  statut: 'GENEREE' | 'ENVOYEE' | 'PAYEE';
}