import { Parcelle } from './parcelle.model';
import { Proprietaire } from './proprietaire.model';

export interface ParcelleProprietaire {
  id: number;
  parcelleId: number;
  proprietaireId: number;
  quotePart: number;
  montantIndividuel: number;
  
  // Relations populated
  parcelle?: Parcelle;
  proprietaire?: Proprietaire;
}

export interface CreateParcelleProprietaireDto {
  parcelleId: number;
  proprietaireId: number;
  quotePart: number;
  montantIndividuel: number;
}

export interface UpdateParcelleProprietaireDto {
  quotePart?: number;
  montantIndividuel?: number;
}