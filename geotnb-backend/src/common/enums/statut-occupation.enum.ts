export enum StatutOccupation {
    NU = 'Nu',
    CONSTRUIT = 'Construit',
    EN_CONSTRUCTION = 'En_Construction',
    PARTIELLEMENT_CONSTRUIT = 'Partiellement_Construit'
  }
  
  export const STATUT_OCCUPATION_DESCRIPTIONS = {
    [StatutOccupation.NU]: 'Terrain nu - aucune construction',
    [StatutOccupation.CONSTRUIT]: 'Terrain entièrement construit',
    [StatutOccupation.EN_CONSTRUCTION]: 'Construction en cours',
    [StatutOccupation.PARTIELLEMENT_CONSTRUIT]: 'Partiellement construit'
  };
  
  export const STATUT_OCCUPATION_TNB_APPLICABLE = {
    [StatutOccupation.NU]: true, // TNB applicable
    [StatutOccupation.CONSTRUIT]: false, // Généralement non applicable
    [StatutOccupation.EN_CONSTRUCTION]: true, // Selon la surface non bâtie
    [StatutOccupation.PARTIELLEMENT_CONSTRUIT]: true // Selon la surface non bâtie
  };