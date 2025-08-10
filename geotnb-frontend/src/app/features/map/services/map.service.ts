import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Style, Fill, Stroke } from 'ol/style';
import { ApiService } from '../../../core/services/api.service';
import { Parcelle } from '../../../core/models/parcelle.interface';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor(private apiService: ApiService) {}

  getParcelles(): Observable<Parcelle[]> {
    return this.apiService.get<Parcelle[]>('parcelles/geojson');
  }

  getParcelle(id: number): Observable<Parcelle> {
    return this.apiService.get<Parcelle>(`parcelles/${id}`);
  }

  getParcelleStyle(): Style {
    return new Style({
      fill: new Fill({
        color: 'rgba(25, 118, 210, 0.3)'
      }),
      stroke: new Stroke({
        color: '#1976d2',
        width: 2
      })
    });
  }

  getParcelleStyleByStatus(status: string): Style {
    const colors: { [key: string]: string } = {
      'Brouillon': 'rgba(255, 152, 0, 0.3)',
      'Validé': 'rgba(76, 175, 80, 0.3)',
      'Publié': 'rgba(25, 118, 210, 0.3)'
    };

    const strokeColors: { [key: string]: string } = {
      'Brouillon': '#ff9800',
      'Validé': '#4caf50',
      'Publié': '#1976d2'
    };

    return new Style({
      fill: new Fill({
        color: colors[status] || colors['Brouillon']
      }),
      stroke: new Stroke({
        color: strokeColors[status] || strokeColors['Brouillon'],
        width: 2
      })
    });
  }
}