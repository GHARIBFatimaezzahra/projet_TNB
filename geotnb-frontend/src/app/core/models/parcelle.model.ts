import { Proprietaire } from './proprietaire.model';

export interface Parcelle {
  id: number;
  referenceFonciere: string;
  surfaceTotale: number;
  surfaceImposable: number;
  statutFoncier: string;
  statutOccupation: string;
  zonage: string;
  categorieFiscale: string;
  prixUnitaireM2: number;
  montantTotalTNB: number;
  exonereTNB: boolean;
  datePermis?: Date;
  dureeExoneration?: number;
  geometry: any; // GeoJSON geometry
  dateCreation: Date;
  dateModification: Date;
  etatValidation: 'Brouillon' | 'Validé' | 'Publié';
  proprietaires?: Proprietaire[];
}

export interface CreateParcelleDto {
  referenceFonciere: string;
  surfaceTotale: number;
  surfaceImposable: number;
  statutFoncier: string;
  statutOccupation: string;
  zonage: string;
  categorieFiscale?: string;
  prixUnitaireM2: number;
  exonereTNB: boolean;
  datePermis?: Date;
  dureeExoneration?: number;
  geometry?: any;
}

export interface UpdateParcelleDto extends Partial<CreateParcelleDto> {}