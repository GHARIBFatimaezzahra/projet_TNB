import { User } from './user.model';

export interface JournalAction {
  id: number;
  utilisateurId: number;
  action: string;
  dateHeure: Date;
  tableCible: string;
  idCible: number;
  details?: string;
  
  // Relations
  utilisateur?: User;
}