export interface Proprietaire {
  id: number;
  nom: string;
  nature: 'Physique' | 'Morale';
  cin_ou_rc: string;
  adresse: string;
  telephone: string;
  quotePart?: number; // Pour l'affichage dans parcelle
}

export interface ParcelleProprietaire {
  id: number;
  parcelleId: number;
  proprietaireId: number;
  quotePart: number;
  montantIndividuel: number;
  proprietaire?: Proprietaire; // Pour les requêtes avec join
}