import { User, UserRole } from '../models/user.interface';

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
  }
  
  export interface JwtPayload {
    sub: number;
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
  }