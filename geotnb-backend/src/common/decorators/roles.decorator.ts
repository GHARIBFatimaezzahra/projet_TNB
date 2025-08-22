import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator pour définir les rôles autorisés à accéder à une route
 * @param roles - Liste des rôles autorisés
 * @returns Metadata decorator
 * 
 * @example
 * @Roles('Admin', 'AgentFiscal')
 * @UseGuards(RolesGuard)
 * adminRoute() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Enum des rôles disponibles dans le système TNB
 */
export enum UserRoles {
  ADMIN = 'Admin',
  AGENT_FISCAL = 'AgentFiscal',
  TECHNICIEN_SIG = 'TechnicienSIG',
  LECTEUR = 'Lecteur'
}

/**
 * Helper pour utiliser les rôles avec l'enum (recommandé)
 */
export const RolesEnum = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);
// Helpers pour les combinaisons courantes de rôles
export const AdminOnly = () => Roles(UserRoles.ADMIN);
export const AgentFiscalOrAdmin = () => Roles(UserRoles.ADMIN, UserRoles.AGENT_FISCAL);
export const TechnicienSIGOrAdmin = () => Roles(UserRoles.ADMIN, UserRoles.TECHNICIEN_SIG);
export const AllRoles = () => Roles(UserRoles.ADMIN, UserRoles.AGENT_FISCAL, UserRoles.TECHNICIEN_SIG, UserRoles.LECTEUR);
export const NoLecteur = () => Roles(UserRoles.ADMIN, UserRoles.AGENT_FISCAL, UserRoles.TECHNICIEN_SIG);
