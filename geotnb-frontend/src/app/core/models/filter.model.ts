import { StatutFoncier } from './enums/statut-foncier.enum';
import { StatutOccupation } from './enums/statut-occupation.enum';
import { EtatValidation } from './enums/etat-validation.enum';
import { NatureProprietaire } from './enums/nature-proprietaire.enum';
import { Geometry } from './parcelle.model';

export interface ParcelleFilter {
  referenceFonciere?: string;
  statutFoncier?: StatutFoncier[];
  statutOccupation?: StatutOccupation[];
  zonage?: string[];
  etatValidation?: EtatValidation[];
  exonereTNB?: boolean;
  surfaceMin?: number;
  surfaceMax?: number;
  montantTNBMin?: number;
  montantTNBMax?: number;
  proprietaire?: string;
  dateCreationStart?: Date;
  dateCreationEnd?: Date;
  geometry?: Geometry; // Pour les requêtes spatiales
}

export interface ProprietaireFilter {
  nom?: string;
  nature?: NatureProprietaire[];
  cin_ou_rc?: string;
  ville?: string;
}