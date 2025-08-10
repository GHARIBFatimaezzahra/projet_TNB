import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { DashboardStats } from '../../../core/models/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private apiService: ApiService) {}

  getStats(): Observable<DashboardStats> {
    return this.apiService.get<DashboardStats>('dashboard/stats');
  }

  getRecentActions(): Observable<any[]> {
    return this.apiService.get<any[]>('dashboard/recent-actions');
  }

  getChartData(chartType: string): Observable<any> {
    return this.apiService.get(`dashboard/charts/${chartType}`);
  }
}