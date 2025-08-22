export interface IndivisionEntity {
    quotePart: number;
    montantIndividuel: number;
    dateDebut: Date;
    dateFin?: Date;
    estActif: boolean;
  }
  
  export interface QuotePartValidation {
    parcelleId: number;
    quoteParts: Array<{
      proprietaireId: number;
      quotePart: number;
    }>;
    totalQuotePart: number;
    estValide: boolean;
    erreurs?: string[];
  }