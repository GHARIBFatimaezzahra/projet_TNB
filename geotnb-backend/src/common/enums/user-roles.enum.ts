export enum UserRoles {
    ADMIN = 'Admin',
    AGENT_FISCAL = 'AgentFiscal',
    TECHNICIEN_SIG = 'TechnicienSIG',
    LECTEUR = 'Lecteur'
  }
  
  export const USER_ROLES_DESCRIPTIONS = {
    [UserRoles.ADMIN]: 'Administrateur système avec tous les droits',
    [UserRoles.AGENT_FISCAL]: 'Agent fiscal - gestion TNB et propriétaires',
    [UserRoles.TECHNICIEN_SIG]: 'Technicien SIG - gestion parcelles et cartographie',
    [UserRoles.LECTEUR]: 'Lecteur - consultation uniquement'
  };
  
  export const USER_ROLES_PERMISSIONS = {
    [UserRoles.ADMIN]: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE_USERS', 'MANAGE_CONFIG'],
    [UserRoles.AGENT_FISCAL]: ['CREATE', 'READ', 'UPDATE', 'GENERATE_FICHES'],
    [UserRoles.TECHNICIEN_SIG]: ['CREATE', 'READ', 'UPDATE', 'MANAGE_PARCELLES', 'IMPORT_DATA'],
    [UserRoles.LECTEUR]: ['READ']
  };
  