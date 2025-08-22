export enum ActionType {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    VIEW = 'VIEW',
    EXPORT = 'EXPORT',
    IMPORT = 'IMPORT',
    GENERATE_FICHE = 'GENERATE_FICHE',
    VALIDATE = 'VALIDATE',
    PUBLISH = 'PUBLISH',
    ARCHIVE = 'ARCHIVE'
  }
  
  export const ACTION_TYPE_DESCRIPTIONS = {
    [ActionType.CREATE]: 'Création d\'un enregistrement',
    [ActionType.UPDATE]: 'Modification d\'un enregistrement',
    [ActionType.DELETE]: 'Suppression d\'un enregistrement',
    [ActionType.LOGIN]: 'Connexion utilisateur',
    [ActionType.LOGOUT]: 'Déconnexion utilisateur',
    [ActionType.VIEW]: 'Consultation d\'un enregistrement',
    [ActionType.EXPORT]: 'Export de données',
    [ActionType.IMPORT]: 'Import de données',
    [ActionType.GENERATE_FICHE]: 'Génération de fiche fiscale',
    [ActionType.VALIDATE]: 'Validation d\'un enregistrement',
    [ActionType.PUBLISH]: 'Publication d\'un enregistrement',
    [ActionType.ARCHIVE]: 'Archivage d\'un enregistrement'
  };