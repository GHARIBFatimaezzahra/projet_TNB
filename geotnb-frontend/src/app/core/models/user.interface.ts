export interface User {
  id: number;
  username: string;
  email: string;
  profil: 'Admin' | 'AgentFiscal' | 'TechnicienSIG' | 'Lecteur';
  estActif: boolean;
  dernierAcces: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  profil: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}