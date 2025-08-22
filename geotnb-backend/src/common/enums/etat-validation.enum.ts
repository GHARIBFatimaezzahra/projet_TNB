import { UserRoles } from './user-roles.enum';

export enum EtatValidation {
    BROUILLON = 'Brouillon',
    VALIDE = 'Valide',
    PUBLIE = 'Publie',
    ARCHIVE = 'Archive'
  }

export const ETAT_VALIDATION_DESCRIPTIONS = {
    [EtatValidation.BROUILLON]: 'En cours de saisie - non finalisé',
    [EtatValidation.VALIDE]: 'Validé techniquement - prêt pour publication',
    [EtatValidation.PUBLIE]: 'Publié officiellement - visible publiquement',
    [EtatValidation.ARCHIVE]: 'Archivé - non actif'
  };
  
export const ETAT_VALIDATION_WORKFLOW = {
    [EtatValidation.BROUILLON]: [EtatValidation.VALIDE, EtatValidation.ARCHIVE],
    [EtatValidation.VALIDE]: [EtatValidation.PUBLIE, EtatValidation.BROUILLON, EtatValidation.ARCHIVE],
    [EtatValidation.PUBLIE]: [EtatValidation.ARCHIVE],
    [EtatValidation.ARCHIVE]: [EtatValidation.BROUILLON]
  };
  
export const ETAT_VALIDATION_PERMISSIONS = {
    [EtatValidation.BROUILLON]: [UserRoles.ADMIN, UserRoles.TECHNICIEN_SIG],
    [EtatValidation.VALIDE]: [UserRoles.ADMIN, UserRoles.AGENT_FISCAL],
    [EtatValidation.PUBLIE]: [UserRoles.ADMIN],
    [EtatValidation.ARCHIVE]: [UserRoles.ADMIN]
  };