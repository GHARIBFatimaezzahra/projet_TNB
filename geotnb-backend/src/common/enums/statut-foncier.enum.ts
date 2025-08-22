export enum StatutFoncier {
    TF = 'TF',
    R = 'R', 
    NI = 'NI',
    DOMANIAL = 'Domanial',
    COLLECTIF = 'Collectif'
  }
  
  export const STATUT_FONCIER_DESCRIPTIONS = {
    [StatutFoncier.TF]: 'Titre Foncier - Propriété privée titrée',
    [StatutFoncier.R]: 'Réquisition - Propriété en cours de titrement',
    [StatutFoncier.NI]: 'Non Immatriculé - Propriété non titrée',
    [StatutFoncier.DOMANIAL]: 'Domaine public ou privé de l\'État',
    [StatutFoncier.COLLECTIF]: 'Propriété collective/tribale'
  };
  
  export const STATUT_FONCIER_IMPOSABLE = {
    [StatutFoncier.TF]: true,
    [StatutFoncier.R]: true,
    [StatutFoncier.NI]: true,
    [StatutFoncier.DOMANIAL]: false, // Généralement exonéré
    [StatutFoncier.COLLECTIF]: false // Généralement exonéré
  };