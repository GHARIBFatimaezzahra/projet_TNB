export enum StatutFoncier {
    TF = 'TF',
    R = 'R',
    NI = 'NI',
    DOMANIAL = 'Domanial',
    HABOUS = 'Habous',
    COLLECTIF = 'Collectif'
  }
  
  export const STATUT_FONCIER_LABELS: Record<StatutFoncier, string> = {
    [StatutFoncier.TF]: 'Titre Foncier (TF)',
    [StatutFoncier.R]: 'Réquisition (R)',
    [StatutFoncier.NI]: 'Non Immatriculé (NI)',
    [StatutFoncier.DOMANIAL]: 'Domaine Public',
    [StatutFoncier.HABOUS]: 'Habous',
    [StatutFoncier.COLLECTIF]: 'Collectif'
  };
  
  export const STATUT_FONCIER_DESCRIPTIONS: Record<StatutFoncier, string> = {
    [StatutFoncier.TF]: 'Terrain immatriculé avec titre foncier définitif',
    [StatutFoncier.R]: 'Terrain en cours d\'immatriculation',
    [StatutFoncier.NI]: 'Terrain non immatriculé',
    [StatutFoncier.DOMANIAL]: 'Terrain appartenant au domaine public',
    [StatutFoncier.HABOUS]: 'Terrain appartenant aux Habous',
    [StatutFoncier.COLLECTIF]: 'Terrain collectif tribal'
  };