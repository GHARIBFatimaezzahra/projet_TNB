export interface TnbCalculation {
    surfaceImposable: number;
    tarifUnitaire: number;
    montantBase: number;
    exonerations: ExonerationDetail[];
    montantFinal: number;
    dateCalcul: Date;
  }
  
  export interface ExonerationDetail {
    type: 'PERMIS' | 'ZONE_SPECIALE' | 'AUTRE';
    description: string;
    duree?: number;
    dateDebut?: Date;
    dateFin?: Date;
    montantReduit: number;
  }
  
  export interface QuotePart {
    proprietaireId: number;
    quotePart: number;
    montantIndividuel: number;
  }
  
  export interface IndivisionDetail {
    parcelleId: number;
    proprietaires: QuotePart[];
    totalQuoteParts: number;
    montantTotal: number;
    estValide: boolean;
  }
  
  // Types pour les configurations fiscales
  export interface TarifZone {
    zone: string;
    tarifUnitaire: number;
    annee: number;
    actif: boolean;
  }