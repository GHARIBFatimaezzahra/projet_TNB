import { Parcelle } from './parcelle.interface';

export interface FicheFiscale {
    id: number;
    parcelleId: number;
    codeUnique: string;
    dateGeneration: Date;
    montantTNB: number;
    anneeReference: number;
    statut: StatutFiche;
    cheminFichier?: string;
    parcelle?: Parcelle;
  }
  
  export type StatutFiche = 'Générée' | 'Envoyée' | 'Payée' | 'Annulée';
  
  export interface GenerateFicheRequest {
    parcelleIds: number[];
    anneeReference: number;
    includeDetails?: boolean;
  }