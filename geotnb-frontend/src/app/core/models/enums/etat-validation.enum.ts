export enum EtatValidation {
    BROUILLON = 'Brouillon',
    EN_ATTENTE = 'En_attente',
    VALIDE = 'Valide',
    REJETE = 'Rejete',
    PUBLIE = 'Publie'
  }
  
  export const ETAT_VALIDATION_LABELS: Record<EtatValidation, string> = {
    [EtatValidation.BROUILLON]: 'Brouillon',
    [EtatValidation.EN_ATTENTE]: 'En attente de validation',
    [EtatValidation.VALIDE]: 'Validé',
    [EtatValidation.REJETE]: 'Rejeté',
    [EtatValidation.PUBLIE]: 'Publié'
  };
  
  export const ETAT_VALIDATION_COLORS: Record<EtatValidation, string> = {
    [EtatValidation.BROUILLON]: 'gray',
    [EtatValidation.EN_ATTENTE]: 'orange',
    [EtatValidation.VALIDE]: 'green',
    [EtatValidation.REJETE]: 'red',
    [EtatValidation.PUBLIE]: 'blue'
  };