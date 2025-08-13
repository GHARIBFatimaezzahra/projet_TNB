import { Parcelle } from './parcelle.model';

export interface FicheFiscale {
  id: number;
  parcelleId: number;
  codeUnique: string;
  dateGeneration: Date;
  montantTNB: number;
  anneeExercice: number;
  statut: 'GENEREE' | 'ENVOYEE' | 'PAYEE';
  
  // Relations
  parcelle?: Parcelle;
}

export interface CreateFicheFiscaleDto {
  parcelleId: number;
  codeUnique: string;
  montantTNB: number;
  anneeExercice: number;
  statut?: 'GENEREE' | 'ENVOYEE' | 'PAYEE';
}

export interface UpdateFicheFiscaleDto {
  montantTNB?: number;
  statut?: 'GENEREE' | 'ENVOYEE' | 'PAYEE';
}