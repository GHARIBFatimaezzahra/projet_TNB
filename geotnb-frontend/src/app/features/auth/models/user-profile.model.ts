import { UserRole } from './login-response.model';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  profil: UserRole;
  estActif: boolean;
  dernierAcces: Date;
  dateCreation?: Date;
  dateModification?: Date;
}