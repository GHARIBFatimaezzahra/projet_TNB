import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { DashboardStats, RecentAction } from '../../../core/models/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private apiService: ApiService) {}

  getStats(): Observable<DashboardStats> {
    // Données mock en attendant l'API
    const mockStats: DashboardStats = {
      totalParcelles: 1250,
      parcellesImposables: 980,
      surfaceTotale: 125000,
      surfaceImposable: 98000,
      montantTotalTNB: 2450000,
      tauxAssujettissement: 78.4
    };
    
    return of(mockStats);
    // Pour utiliser l'API réelle plus tard :
    // return this.apiService.get<DashboardStats>('dashboard/stats');
  }

  getRecentActions(): Observable<RecentAction[]> {
    // Données mock en attendant l'API
    const mockActions: RecentAction[] = [
      {
        id: 1,
        type: 'create',
        description: 'Nouvelle parcelle ajoutée - Ref: 123/45',
        date: new Date(),
        user: 'Admin'
      },
      {
        id: 2,
        type: 'update',
        description: 'Parcelle modifiée - Ref: 67/89',
        date: new Date(Date.now() - 3600000),
        user: 'TechnicienSIG'
      },
      {
        id: 3,
        type: 'delete',
        description: 'Parcelle supprimée - Ref: 11/22',
        date: new Date(Date.now() - 7200000),
        user: 'Admin'
      }
    ];
    
    return of(mockActions);
    // Pour utiliser l'API réelle plus tard :
    // return this.apiService.get<RecentAction[]>('dashboard/recent-actions');
  }

  getChartData(chartType: string): Observable<any> {
    const mockData = {
      pie: {
        labels: ['Zone Résidentielle', 'Zone Commerciale', 'Zone Industrielle', 'Zone Agricole'],
        datasets: [{
          data: [45, 30, 20, 5],
          backgroundColor: ['#1976d2', '#4caf50', '#ff9800', '#f44336']
        }]
      },
      bar: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Parcelles ajoutées',
          data: [12, 19, 8, 15, 22, 30],
          backgroundColor: '#1976d2'
        }]
      }
    };
    
    return of(mockData[chartType as keyof typeof mockData] || mockData.pie);
    // Pour utiliser l'API réelle plus tard :
    // return this.apiService.get(`dashboard/charts/${chartType}`);
  }
}