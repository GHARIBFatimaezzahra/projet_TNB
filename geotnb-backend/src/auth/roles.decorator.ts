import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export enum UserRoles {
  ADMIN = 'Admin',
  AGENT_FISCAL = 'AgentFiscal', 
  TECHNICIEN_SIG = 'TechnicienSIG',
  LECTEUR = 'Lecteur'
}

// Helpers pour les combinaisons courantes
export const AdminOnly = () => Roles('Admin');
export const AgentFiscalOrAdmin = () => Roles('Admin', 'AgentFiscal');
export const TechnicienSIGOrAdmin = () => Roles('Admin', 'TechnicienSIG'); // Ajout manquant
export const AllRoles = () => Roles('Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur');