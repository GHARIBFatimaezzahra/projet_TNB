import { BaseEntity } from './base-entity.interface';

export interface UserEntity extends BaseEntity {
    username: string;
    email: string;
    nom: string;
    prenom?: string;
    profil: 'Admin' | 'AgentFiscal' | 'TechnicienSIG' | 'Lecteur';
    telephone?: string;
    estActif: boolean;
    dernierAcces?: Date;
  }
  
  export interface UserPermissions {
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canExport: boolean;
    canImport: boolean;
    canValidate: boolean;
    resources: string[];
  }