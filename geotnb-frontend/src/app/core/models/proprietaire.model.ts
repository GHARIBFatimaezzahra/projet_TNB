import { NatureProprietaire } from './enums/nature-proprietaire.enum';

export interface Proprietaire {
  id: number;
  nom: string;
  nature: NatureProprietaire;
  cin_ou_rc: string;
  adresse: string;
  telephone?: string;
  quotePart?: number;
  dateCreation: Date;
  dateModification?: Date;
}

export interface CreateProprietaireDto {
  nom: string;
  nature: NatureProprietaire;
  cin_ou_rc: string;
  adresse: string;
  telephone?: string;
}

export interface UpdateProprietaireDto {
  nom?: string;
  nature?: NatureProprietaire;
  cin_ou_rc?: string;
  adresse?: string;
  telephone?: string;
}