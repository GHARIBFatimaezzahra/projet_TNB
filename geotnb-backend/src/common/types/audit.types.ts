export interface AuditableEntity {
    dateCreation: Date;
    dateModification: Date;
    version?: number;
  }
  
  export interface AuditLog {
    id: number;
    utilisateurId: number;
    action: AuditAction;
    tableCible: string;
    idCible: number;
    dateHeure: Date;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }
  
  export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE', 
    DELETE = 'DELETE',
    VIEW = 'VIEW',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    EXPORT = 'EXPORT',
    IMPORT = 'IMPORT',
    VALIDATE = 'VALIDATE',
    GENERATE_FICHE = 'GENERATE_FICHE'
  }