import { UserRole } from './login-response.model';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  profil: UserRole;
}

export interface UpdateProfileRequest {
  username: string;
  email: string;
}

// Export des autres models
export * from './login-request.model';
export * from './login-response.model';
export * from './user-profile.model';