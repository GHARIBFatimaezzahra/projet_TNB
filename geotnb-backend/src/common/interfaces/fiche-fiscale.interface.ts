export interface FicheFiscaleEntity {
    codeUnique: string;
    annee: number;
    dateGeneration: Date;
    dateLimitePayment: Date;
    montantTnb: number;
    montantPaye: number;
    statutPayment: 'EnAttente' | 'Paye' | 'Retard' | 'Annule';
    cheminFichierPdf?: string;
  }
  
  export interface FicheGenerationOptions {
    annee: number;
    parcelleIds?: number[];
    proprietaireIds?: number[];
    zones?: string[];
    template?: string;
    includeGeometry?: boolean;
    format?: 'PDF' | 'Excel' | 'CSV';
  }