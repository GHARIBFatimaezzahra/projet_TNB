export interface ProprietaireEntity {
    nom: string;
    prenom?: string;
    nature: 'Physique' | 'Morale';
    cinOuRc?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    estActif: boolean;
  }
  
  export interface ContactInfo {
    telephone?: string;
    email?: string;
    adresse?: string;
  }