export enum TypeExoneration {
    AUCUNE = 'Aucune',
    TROIS_ANS = '3_ans',
    CINQ_ANS = '5_ans',
    SEPT_ANS = '7_ans',
    PERMANENTE = 'Permanente'
  }
  
  export const EXONERATION_LABELS: Record<TypeExoneration, string> = {
    [TypeExoneration.AUCUNE]: 'Aucune exonération',
    [TypeExoneration.TROIS_ANS]: 'Exonération 3 ans',
    [TypeExoneration.CINQ_ANS]: 'Exonération 5 ans',
    [TypeExoneration.SEPT_ANS]: 'Exonération 7 ans',
    [TypeExoneration.PERMANENTE]: 'Exonération permanente'
  };
  
  export const EXONERATION_DURATIONS: Record<TypeExoneration, number> = {
    [TypeExoneration.AUCUNE]: 0,
    [TypeExoneration.TROIS_ANS]: 3,
    [TypeExoneration.CINQ_ANS]: 5,
    [TypeExoneration.SEPT_ANS]: 7,
    [TypeExoneration.PERMANENTE]: 999
  };
  
  export const EXONERATION_CONDITIONS: Record<TypeExoneration, string> = {
    [TypeExoneration.AUCUNE]: 'Pas d\'exonération applicable',
    [TypeExoneration.TROIS_ANS]: 'Parcelles ≤ 100 m²',
    [TypeExoneration.CINQ_ANS]: 'Parcelles 100-500 m²',
    [TypeExoneration.SEPT_ANS]: 'Parcelles > 500 m²',
    [TypeExoneration.PERMANENTE]: 'Domaine public, utilité publique'
  };