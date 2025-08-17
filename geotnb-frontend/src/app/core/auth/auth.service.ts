import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TokenService } from './token.service';
import { UserRole } from '../models/auth/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenService = inject(TokenService);
  
  // ✅ AJOUTEZ ce BehaviorSubject pour gérer l'utilisateur courant
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Charger l'utilisateur depuis localStorage au démarrage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  // ✅ AJOUTEZ cette méthode
  setCurrentUser(user: any): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // ✅ MODIFIEZ cette méthode pour retourner un type précis
  getCurrentUser(): any | null {
    return this.currentUserSubject.value;
  }

  // ✅ AJOUTEZ cette méthode si elle n'existe pas
  isAuthenticated(): boolean {
    return this.tokenService.hasToken() && !this.tokenService.isTokenExpired();
  }

  // ✅ AJOUTEZ cette méthode si elle n'existe pas
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user && user.profil === role;
  }

  // ✅ AJOUTEZ cette méthode si elle n'existe pas
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user && roles.includes(user.profil);
  }

  // ✅ AJOUTEZ cette méthode si elle n'existe pas
  logout(): void {
    this.tokenService.clearTokens();
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  // ... gardez vos autres méthodes existantes
}