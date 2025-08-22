import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'auditLog';

export interface AuditLogConfig {
  action: string;
  description?: string;
  sensitiveData?: boolean;
}

/**
 * Decorator pour marquer une méthode pour l'audit automatique
 * @param config Configuration de l'audit
 * @example
 * @AuditLog({ action: 'CREATE_PARCELLE', description: 'Création d\'une nouvelle parcelle' })
 * @Post()
 * create() { ... }
 */
export const AuditLog = (config: AuditLogConfig) => SetMetadata(AUDIT_LOG_KEY, config);

// Helpers pour actions communes
export const AuditCreate = (entity: string) => 
  AuditLog({ action: `CREATE_${entity.toUpperCase()}`, description: `Création ${entity}` });

export const AuditUpdate = (entity: string) => 
  AuditLog({ action: `UPDATE_${entity.toUpperCase()}`, description: `Modification ${entity}` });

export const AuditDelete = (entity: string) => 
  AuditLog({ action: `DELETE_${entity.toUpperCase()}`, description: `Suppression ${entity}` });

export const AuditView = (entity: string) => 
  AuditLog({ action: `VIEW_${entity.toUpperCase()}`, description: `Consultation ${entity}` });