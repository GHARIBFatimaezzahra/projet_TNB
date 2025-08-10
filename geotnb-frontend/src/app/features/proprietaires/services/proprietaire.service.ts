import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Proprietaire } from '../../../core/models/proprietaire.interface';

@Injectable({
  providedIn: 'root'
})
export class ProprietaireService {
  constructor(private apiService: ApiService) {}

  getProprietaires(): Observable<Proprietaire[]> {
    return this.apiService.get<Proprietaire[]>('proprietaires');
  }

  getProprietaire(id: number): Observable<Proprietaire> {
    return this.apiService.get<Proprietaire>(`proprietaires/${id}`);
  }

  createProprietaire(proprietaire: Partial<Proprietaire>): Observable<Proprietaire> {
    return this.apiService.post<Proprietaire>('proprietaires', proprietaire);
  }

  updateProprietaire(id: number, proprietaire: Partial<Proprietaire>): Observable<Proprietaire> {
    return this.apiService.put<Proprietaire>(`proprietaires/${id}`, proprietaire);
  }

  deleteProprietaire(id: number): Observable<void> {
    return this.apiService.delete<void>(`proprietaires/${id}`);
  }
}
