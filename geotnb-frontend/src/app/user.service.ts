import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Test de connexion
  testConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/test`);
  }

  // Créer un utilisateur (pour plus tard avec auth)
  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, userData);
  }

  // Récupérer tous les utilisateurs (pour plus tard avec auth)
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }
}