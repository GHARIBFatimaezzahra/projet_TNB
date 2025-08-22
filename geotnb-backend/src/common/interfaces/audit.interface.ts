export interface AuditLogEntity {
    utilisateurId: number;
    action: string;
    tableCible: string;
    idCible: number;
    dateHeure: Date;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }
  
  export interface AuditableAction {
    entity: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'IMPORT';
    entityId: number;
    changes?: {
      before?: Record<string, any>;
      after?: Record<string, any>;
    };
    metadata?: Record<string, any>;
  }