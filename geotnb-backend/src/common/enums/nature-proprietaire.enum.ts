export enum NatureProprietaire {
    PHYSIQUE = 'Physique',
    MORALE = 'Morale'
  }
  
  export const NATURE_PROPRIETAIRE_DESCRIPTIONS = {
    [NatureProprietaire.PHYSIQUE]: 'Personne physique (individu)',
    [NatureProprietaire.MORALE]: 'Personne morale (société, association, etc.)'
  };
  
  export const NATURE_PROPRIETAIRE_FORMAT_ID = {
    [NatureProprietaire.PHYSIQUE]: 'CIN (1-2 lettres + 6-8 chiffres)',
    [NatureProprietaire.MORALE]: 'RC (chiffres uniquement)'
  };