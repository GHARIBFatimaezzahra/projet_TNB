import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MAP_CONFIG } from '../config/map.config';

// Interface locale pour éviter les imports circulaires
export interface Geometry {
  type: 'Polygon' | 'MultiPolygon' | 'Point';
  coordinates: number[][][] | number[][][][];
}

export interface Parcelle {
  id: number;
  referenceFonciere: string;
  geometry: Geometry;
  // Autres propriétés simplifiées
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private mapInstanceSubject = new BehaviorSubject<any>(null);
  public mapInstance$ = this.mapInstanceSubject.asObservable();

  private selectedParcelleSubject = new BehaviorSubject<Parcelle | null>(null);
  public selectedParcelle$ = this.selectedParcelleSubject.asObservable();

  private parcellesLayerSubject = new BehaviorSubject<any>(null);
  public parcellesLayer$ = this.parcellesLayerSubject.asObservable();

  constructor() {}

  setMapInstance(map: any): void {
    this.mapInstanceSubject.next(map);
  }

  getMapInstance(): any {
    return this.mapInstanceSubject.value;
  }

  createDefaultView(): any {
    return {
      center: MAP_CONFIG.DEFAULT_CENTER,
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      projection: MAP_CONFIG.PROJECTION,
      extent: MAP_CONFIG.EXTENT
    };
  }

  selectParcelle(parcelle: Parcelle | null): void {
    this.selectedParcelleSubject.next(parcelle);
  }

  getSelectedParcelle(): Parcelle | null {
    return this.selectedParcelleSubject.value;
  }

  setParcellesLayer(layer: any): void {
    this.parcellesLayerSubject.next(layer);
  }

  calculateArea(geometry: Geometry): number {
    // Placeholder implementation
    return 0;
  }

  isPointInPolygon(point: [number, number], geometry: Geometry): boolean {
    return false;
  }

  getGeometryBounds(geometry: Geometry): number[] {
    return [0, 0, 0, 0];
  }

  zoomToGeometry(geometry: Geometry): void {
    const map = this.getMapInstance();
    if (map) {
      const bounds = this.getGeometryBounds(geometry);
      // map.getView().fit(bounds);
    }
  }

  zoomToParcelles(parcelles: Parcelle[]): void {
    if (parcelles.length === 0) return;
    // Implementation will be added later
  }
}