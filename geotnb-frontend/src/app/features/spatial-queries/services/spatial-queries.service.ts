/* =====================================================
   SERVICE REQUÊTES SPATIALES - FRONTEND
   ===================================================== */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SpatialQueryResult {
  parcelles: any[];
  total: number;
  geometry: any;
  metadata: {
    queryType: 'intersection' | 'sector' | 'buffer';
    parameters: any;
    executionTime: number;
  };
}

export interface SpatialQueryResponse {
  success: boolean;
  data: SpatialQueryResult;
  statistics: any;
  message: string;
}

export interface IntersectionQuery {
  geometry: string; // WKT ou GeoJSON
  srid?: number;
  filters?: {
    statutFoncier?: string;
    zonage?: string;
    surfaceMin?: number;
  };
}

export interface SectorQuery {
  secteurId: string;
  secteurName?: string;
}

export interface BufferQuery {
  center: { x: number; y: number };
  radius: number; // en mètres
  srid?: number;
}

export interface ReferenceData {
  id: string;
  nom: string;
  geometry?: any;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class SpatialQueriesService {
  private apiUrl = `${environment.apiUrl}/v1/spatial-queries`;

  constructor(private http: HttpClient) {}

  /**
   * a) Intersection avec une emprise
   */
  findParcellesByIntersection(query: IntersectionQuery): Observable<SpatialQueryResponse> {
    return this.http.post<SpatialQueryResponse>(`${this.apiUrl}/intersection`, query);
  }

  /**
   * b) Sélection par secteur
   */
  findParcellesBySector(query: SectorQuery): Observable<SpatialQueryResponse> {
    return this.http.post<SpatialQueryResponse>(`${this.apiUrl}/sector`, query);
  }

  /**
   * c) Rayon de distance (buffer)
   */
  findParcellesByBuffer(query: BufferQuery): Observable<SpatialQueryResponse> {
    return this.http.post<SpatialQueryResponse>(`${this.apiUrl}/buffer`, query);
  }

  /**
   * Parcelles près d'un hôtel
   */
  findParcellesNearHotel(hotelId: string, radius: number = 1000): Observable<SpatialQueryResponse> {
    return this.http.post<SpatialQueryResponse>(`${this.apiUrl}/near-hotel`, {
      hotelId,
      radius
    });
  }

  /**
   * Parcelles le long d'une voie
   */
  findParcellesAlongRoad(roadId: string, buffer: number = 100): Observable<SpatialQueryResponse> {
    return this.http.post<SpatialQueryResponse>(`${this.apiUrl}/along-road`, {
      roadId,
      buffer
    });
  }

  /**
   * Obtenir la liste des communes
   */
  getCommunes(): Observable<{ success: boolean; data: ReferenceData[]; message: string }> {
    return this.http.get<{ success: boolean; data: ReferenceData[]; message: string }>(`${this.apiUrl}/communes`);
  }

  /**
   * Obtenir la liste des hôtels
   */
  getHotels(): Observable<{ success: boolean; data: ReferenceData[]; message: string }> {
    return this.http.get<{ success: boolean; data: ReferenceData[]; message: string }>(`${this.apiUrl}/hotels`);
  }

  /**
   * Obtenir la liste des voies
   */
  getRoads(): Observable<{ success: boolean; data: ReferenceData[]; message: string }> {
    return this.http.get<{ success: boolean; data: ReferenceData[]; message: string }>(`${this.apiUrl}/roads`);
  }

  /**
   * Test de connectivité
   */
  testConnection(): Observable<{ success: boolean; message: string; timestamp: string; availableQueries: string[] }> {
    return this.http.get<{ success: boolean; message: string; timestamp: string; availableQueries: string[] }>(`${this.apiUrl}/test`);
  }

  /**
   * Convertir GeoJSON en WKT pour les requêtes PostGIS
   */
  convertGeoJSONToWKT(geoJson: any): string {
    if (!geoJson || !geoJson.type) {
      throw new Error('GeoJSON invalide');
    }

    // Conversion simple GeoJSON vers WKT
    switch (geoJson.type) {
      case 'Point':
        return `POINT(${geoJson.coordinates[0]} ${geoJson.coordinates[1]})`;
      
      case 'LineString':
        const coords = geoJson.coordinates.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(', ');
        return `LINESTRING(${coords})`;
      
      case 'Polygon':
        const rings = geoJson.coordinates.map((ring: number[][]) => 
          ring.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(', ')
        );
        return `POLYGON((${rings[0]}))`;
      
      case 'MultiPolygon':
        const polygons = geoJson.coordinates.map((polygon: number[][][]) => 
          `(${polygon[0].map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(', ')})`
        );
        return `MULTIPOLYGON(${polygons.join(', ')})`;
      
      default:
        throw new Error(`Type de géométrie non supporté: ${geoJson.type}`);
    }
  }

  /**
   * Convertir WKT en GeoJSON pour l'affichage
   */
  convertWKTToGeoJSON(wkt: string): any {
    // Cette fonction nécessiterait une bibliothèque comme wellknown ou une implémentation personnalisée
    // Pour l'instant, on retourne le WKT tel quel
    return wkt;
  }

  /**
   * Calculer le centre d'une géométrie
   */
  calculateGeometryCenter(geoJson: any): { x: number; y: number } {
    if (!geoJson || !geoJson.coordinates) {
      throw new Error('Géométrie invalide');
    }

    let totalX = 0;
    let totalY = 0;
    let pointCount = 0;

    const processCoordinates = (coords: any) => {
      if (Array.isArray(coords[0])) {
        coords.forEach(processCoordinates);
      } else {
        totalX += coords[0];
        totalY += coords[1];
        pointCount++;
      }
    };

    processCoordinates(geoJson.coordinates);

    return {
      x: totalX / pointCount,
      y: totalY / pointCount
    };
  }

  /**
   * Valider une requête spatiale
   */
  validateSpatialQuery(query: any, type: 'intersection' | 'sector' | 'buffer'): boolean {
    switch (type) {
      case 'intersection':
        return !!(query.geometry && query.geometry.trim());
      
      case 'sector':
        return !!(query.secteurId && query.secteurId.trim());
      
      case 'buffer':
        return !!(query.center && query.center.x && query.center.y && query.radius > 0);
      
      default:
        return false;
    }
  }

  /**
   * Ajouter une parcelle temporaire
   */
  addTemporaryParcelle(sessionId: string, parcelle: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/temporary-parcelle`, {
      sessionId,
      parcelle
    });
  }

  /**
   * Obtenir les parcelles temporaires d'une session
   */
  getTemporaryParcelles(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/temporary-parcelles/${sessionId}`);
  }

  /**
   * Vider les parcelles temporaires d'une session
   */
  clearTemporaryParcelles(sessionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/temporary-parcelles/${sessionId}`);
  }
}
