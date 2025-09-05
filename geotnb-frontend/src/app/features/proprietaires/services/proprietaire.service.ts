import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Proprietaire {
  id: number;
  nom: string;
  prenom?: string;
  nature: 'Physique' | 'Morale';
  cinOuRc: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  estActif: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProprietaireService {
  private apiUrl = `${environment.apiUrl}/v1/proprietaires`;

  constructor(private http: HttpClient) {}

  /**
   * Créer les headers d'authentification
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('geotnb_token') || sessionStorage.getItem('geotnb_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Récupérer tous les propriétaires actifs
   */
  getProprietaires(): Observable<Proprietaire[]> {
    return this.http.get<Proprietaire[]>(`${this.apiUrl}?estActif=true`, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Récupérer un propriétaire par ID
   */
  getProprietaire(id: number): Observable<Proprietaire> {
    return this.http.get<Proprietaire>(`${this.apiUrl}/${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Créer un nouveau propriétaire
   */
  createProprietaire(proprietaire: Partial<Proprietaire>): Observable<Proprietaire> {
    return this.http.post<Proprietaire>(this.apiUrl, proprietaire, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Mettre à jour un propriétaire
   */
  updateProprietaire(id: number, proprietaire: Partial<Proprietaire>): Observable<Proprietaire> {
    return this.http.patch<Proprietaire>(`${this.apiUrl}/${id}`, proprietaire, { 
      headers: this.getAuthHeaders() 
    });
  }

  /**
   * Rechercher des propriétaires par nom ou CIN/RC
   */
  searchProprietaires(query: string): Observable<Proprietaire[]> {
    return this.http.get<Proprietaire[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`, { 
      headers: this.getAuthHeaders() 
    });
  }
}
