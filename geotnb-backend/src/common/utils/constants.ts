export const TNB_CONSTANTS = {
    // Durées d'exonération possibles (en années)
    DUREES_EXONERATION: [3, 5, 7],
    
    // Statuts fonciers
    STATUTS_FONCIERS: ['TF', 'R', 'NI', 'Domanial', 'Collectif'] as const,
    
    // Statuts d'occupation
    STATUTS_OCCUPATION: ['Nu', 'Construit', 'En_Construction', 'Partiellement_Construit'] as const,
    
    // États de validation
    ETATS_VALIDATION: ['Brouillon', 'Valide', 'Publie', 'Archive'] as const,
    
    // Rôles utilisateurs
    USER_ROLES: ['Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur'] as const,
    
    // Types de documents
    DOCUMENT_TYPES: ['Certificat', 'Photo', 'Requisition', 'Plan', 'Autorisation', 'Autre'] as const,
    
    // Limites système
    MAX_FILE_SIZE_MB: 50,
    MAX_PAGINATION_LIMIT: 100,
    DEFAULT_PAGINATION_LIMIT: 10,
    
    // Formats regex
    REGEX: {
      CIN: /^[A-Z]{1,2}[0-9]{6,8}$/,
      RC: /^[0-9]+$/,
      PHONE_MOROCCO: /^(\+212|0)[5-7][0-9]{8}$/,
      REFERENCE_FONCIERE: /^(TF|R|NI)\s*\d+[\/\-]?\d*[A-Z]*$/i,
    },
    
    // Messages d'erreur fréquents
    ERROR_MESSAGES: {
      CIN_INVALID: 'Format CIN invalide (ex: AB123456)',
      RC_INVALID: 'Format RC invalide (chiffres uniquement)',
      PHONE_INVALID: 'Numéro de téléphone marocain invalide',
      REFERENCE_INVALID: 'Référence foncière invalide',
      QUOTE_PARTS_SUM: 'La somme des quotes-parts doit être égale à 1',
      FILE_TOO_LARGE: 'Fichier trop volumineux (max 50MB)',
    }
  };
  
  export default TNB_CONSTANTS;