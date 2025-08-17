export interface LoginResponse {
    access_token: string;
    refresh_token: string; 
    user: {
      id: number;
      username: string;
      email: string;
      profil: UserRole;
      estActif: boolean;
      dernierAcces: Date;
    };
  }
  
  export enum UserRole {
    ADMIN = 'Admin',
    AGENT_FISCAL = 'AgentFiscal',
    TECHNICIEN_SIG = 'TechnicienSIG',
    LECTEUR = 'Lecteur'
  }