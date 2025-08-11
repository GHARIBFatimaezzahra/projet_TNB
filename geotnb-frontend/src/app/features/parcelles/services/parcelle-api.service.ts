import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Parcelle } from '../../../core/models/parcelle.model';

export interface ParcelleListResponse {
  data: Parcelle[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class ParcelleService {
  constructor(private apiService: ApiService) {}

  getParcelles(filters?: any): Observable<ParcelleListResponse> {
    return this.apiService.get<ParcelleListResponse>('parcelles', filters);
  }

  getParcelle(id: number): Observable<Parcelle> {
    return this.apiService.get<Parcelle>(`parcelles/${id}`);
  }

  createParcelle(parcelle: Partial<Parcelle>): Observable<Parcelle> {
    return this.apiService.post<Parcelle>('parcelles', parcelle);
  }

  updateParcelle(id: number, parcelle: Partial<Parcelle>): Observable<Parcelle> {
    return this.apiService.put<Parcelle>(`parcelles/${id}`, parcelle);
  }

  deleteParcelle(id: number): Observable<void> {
    return this.apiService.delete<void>(`parcelles/${id}`);
  }

  searchParcelles(searchTerm: string): Observable<Parcelle[]> {
    return this.apiService.get<Parcelle[]>('parcelles/search', { q: searchTerm });
  }
}