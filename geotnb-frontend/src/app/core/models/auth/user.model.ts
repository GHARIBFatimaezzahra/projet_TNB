export interface User {
    id: number;
    username: string;
    email: string;
    profil: UserRole;
    estActif: boolean;
    dernierAcces?: Date;
    dateCreation?: Date;
    dateModification?: Date;
    avatar?: string;
    preferences?: UserPreferences;
  }
  
  export enum UserRole {
    ADMIN = 'Admin',
    AGENT_FISCAL = 'AgentFiscal',
    TECHNICIEN_SIG = 'TechnicienSIG',
    LECTEUR = 'Lecteur'
  }
  
  export interface UserPreferences {
    theme?: 'light' | 'dark' | 'auto';
    language?: 'fr' | 'ar' | 'en';
    dateFormat?: string;
    timezone?: string;
    notificationsEnabled?: boolean;
    emailNotifications?: boolean;
    dashboardLayout?: string;
  }
  
  export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    profil: UserRole;
    estActif?: boolean;
  }
  
  export interface UpdateUserRequest {
    username?: string;
    email?: string;
    profil?: UserRole;
    estActif?: boolean;
    preferences?: Partial<UserPreferences>;
  }
  
  export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }