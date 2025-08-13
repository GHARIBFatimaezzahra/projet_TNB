import { UserRole } from './enums/user-roles.enum';

export interface User {
  id: number;
  username: string;
  email: string;
  profil: UserRole;
  estActif: boolean;
  dernierAcces?: Date;
  dateCreation: Date;
  dateModification?: Date;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  profil: UserRole;
  estActif?: boolean;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  profil?: UserRole;
  estActif?: boolean;
}