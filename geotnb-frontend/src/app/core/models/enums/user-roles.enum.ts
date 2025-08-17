export enum UserRoles {
    ADMIN = 'Admin',
    AGENT_FISCAL = 'AgentFiscal',
    TECHNICIEN_SIG = 'TechnicienSIG',
    LECTEUR = 'Lecteur'
  }
  
  export const USER_ROLE_LABELS: Record<UserRoles, string> = {
    [UserRoles.ADMIN]: 'Administrateur',
    [UserRoles.AGENT_FISCAL]: 'Agent Fiscal',
    [UserRoles.TECHNICIEN_SIG]: 'Technicien SIG',
    [UserRoles.LECTEUR]: 'Lecteur'
  };
  
  export const USER_ROLE_DESCRIPTIONS: Record<UserRoles, string> = {
    [UserRoles.ADMIN]: 'Accès complet à toutes les fonctionnalités',
    [UserRoles.AGENT_FISCAL]: 'Gestion des fiches fiscales et calculs TNB',
    [UserRoles.TECHNICIEN_SIG]: 'Gestion des données cartographiques et import/export',
    [UserRoles.LECTEUR]: 'Consultation uniquement'
  };