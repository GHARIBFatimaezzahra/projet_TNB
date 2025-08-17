export interface Auditable {
    dateCreation: Date;
    dateModification?: Date;
    creeParUtilisateur?: string;
    modifieParUtilisateur?: string;
    version?: number;
  }
  
  export interface SoftDeletable {
    estSupprime: boolean;
    dateSuppression?: Date;
    supprimeParUtilisateur?: string;
  }
  
  export interface Trackable extends Auditable, SoftDeletable {
    // Combine auditable et soft deletable
  }