export interface FiscalEntity {
    montantTotalTnb: number;
    exonereTnb: boolean;
    datePermis?: Date;
    dureeExoneration?: number;
    prixUnitaireM2?: number;
  }
  
  export interface TaxCalculation {
    surfaceImposable: number;
    tarifUnitaire: number;
    montantBase: number;
    quotePart?: number;
    montantFinal: number;
    exoneration?: {
      type: 'temporaire' | 'permanente';
      dateDebut?: Date;
      dateFin?: Date;
      motif?: string;
    };
  }
  
  export interface FiscalConfiguration {
    zonage: string;
    tarifUnitaire: number;
    annee: number;
    actif: boolean;
  }