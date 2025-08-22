export enum TypeExoneration {
    AUCUNE = 0,
    TROIS_ANS = 3,
    CINQ_ANS = 5,
    SEPT_ANS = 7
  }
  
  export const TYPE_EXONERATION_DESCRIPTIONS = {
    [TypeExoneration.AUCUNE]: 'Aucune exonération',
    [TypeExoneration.TROIS_ANS]: 'Exonération 3 ans (parcelles < 500m²)',
    [TypeExoneration.CINQ_ANS]: 'Exonération 5 ans (parcelles 500-2000m²)',
    [TypeExoneration.SEPT_ANS]: 'Exonération 7 ans (parcelles > 2000m²)'
  };
  
  export const TYPE_EXONERATION_CONDITIONS = {
    [TypeExoneration.AUCUNE]: 'Aucune condition',
    [TypeExoneration.TROIS_ANS]: 'Surface < 500m² avec permis de construire',
    [TypeExoneration.CINQ_ANS]: 'Surface entre 500m² et 2000m² avec permis',
    [TypeExoneration.SEPT_ANS]: 'Surface > 2000m² avec permis de lotir/construire'
  };