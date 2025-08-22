import { BaseEntity } from './base-entity.interface';

export interface AuditableEntity extends BaseEntity {
    version?: number;
    derniereMiseAJour?: Date;
  }
  