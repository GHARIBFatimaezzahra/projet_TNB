export enum StatutOccupation {
    NU = 'Nu',
    PARTIELLEMENT_CONSTRUIT = 'Partiellement_construit',
    ENTIEREMENT_CONSTRUIT = 'Entierement_construit',
    EN_CONSTRUCTION = 'En_construction',
    ABANDONNE = 'Abandonne'
  }
  
  export const STATUT_OCCUPATION_LABELS: Record<StatutOccupation, string> = {
    [StatutOccupation.NU]: 'Terrain nu',
    [StatutOccupation.PARTIELLEMENT_CONSTRUIT]: 'Partiellement construit',
    [StatutOccupation.ENTIEREMENT_CONSTRUIT]: 'Entièrement construit',
    [StatutOccupation.EN_CONSTRUCTION]: 'En construction',
    [StatutOccupation.ABANDONNE]: 'Abandonné'
  };
  
  export const STATUT_OCCUPATION_DESCRIPTIONS: Record<StatutOccupation, string> = {
    [StatutOccupation.NU]: 'Terrain sans construction',
    [StatutOccupation.PARTIELLEMENT_CONSTRUIT]: 'Terrain avec construction partielle',
    [StatutOccupation.ENTIEREMENT_CONSTRUIT]: 'Terrain entièrement bâti',
    [StatutOccupation.EN_CONSTRUCTION]: 'Construction en cours',
    [StatutOccupation.ABANDONNE]: 'Construction abandonnée'
  };