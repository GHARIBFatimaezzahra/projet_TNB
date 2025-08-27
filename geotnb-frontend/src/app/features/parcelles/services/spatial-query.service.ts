// =====================================================
// SERVICE REQUÊTES SPATIALES - RECHERCHES GÉOGRAPHIQUES
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

// Configuration
import { getConfig } from '../../../core/config/app.config';
import { API_ENDPOINTS } from '../../../core/config/endpoints.config';

// Types
export interface SpatialQueryOptions {
  buffer?: number;
  limit?: number;
  includeGeometry?: boolean;
  fields?: string[];
}

export interface SpatialQueryResult {
  id: number;
  reference_fonciere: string;
  surface_totale: number;
  etat_validation: string;
  zonage: string;
  montant_total_tnb: number;
  geometry?: any;
  distance?: number;
  intersection_area?: number;
}

export interface BoundsQuery {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface RadiusQuery {
  center: [number, number];
  radius: number;
  unit?: 'meters' | 'kilometers';
}

@Injectable({
  providedIn: 'root'
})
export class SpatialQueryService {
  private apiUrl = `${getConfig().apiUrl}${API_ENDPOINTS.parcelles.spatial}`;

  constructor(private http: HttpClient) {}

  // =====================================================
  // REQUÊTES D'INTERSECTION
  // =====================================================

  /**
   * Trouve les parcelles qui intersectent avec une géométrie
   */
  findIntersecting(
    geometry: any, 
    options: SpatialQueryOptions = {}
  ): Observable<SpatialQueryResult[]> {
    // Simulation de requête spatiale
    return this.simulateIntersectionQuery(geometry, options);
    
    /* Vraie implémentation:
    return this.http.post<SpatialQueryResult[]>(`${this.apiUrl}/intersect`, {
      geometry,
      options
    });
    */
  }

  /**
   * Trouve les parcelles qui contiennent un point
   */
  findContaining(
    point: [number, number],
    options: SpatialQueryOptions = {}
  ): Observable<SpatialQueryResult[]> {
    return this.http.post<SpatialQueryResult[]>(`${this.apiUrl}/contains`, {
      point,
      options
    });
  }

  /**
   * Trouve les parcelles complètement contenues dans une géométrie
   */
  findWithin(
    geometry: any,
    options: SpatialQueryOptions = {}
  ): Observable<SpatialQueryResult[]> {
    return this.http.post<SpatialQueryResult[]>(`${this.apiUrl}/within`, {
      geometry,
      options
    });
  }

  // =====================================================
  // REQUÊTES DE PROXIMITÉ
  // =====================================================

  /**
   * Trouve les parcelles proches d'une géométrie
   */
  findNearby(
    geometry: any,
    distance: number,
    options: SpatialQueryOptions = {}
  ): Observable<SpatialQueryResult[]> {
    // Simulation
    return this.simulateNearbyQuery(geometry, distance, options);
    
    /* Vraie implémentation:
    return this.http.post<SpatialQueryResult[]>(`${this.apiUrl}/nearby`, {
      geometry,
      distance,
      options
    });
    */
  }

  /**
   * Trouve les parcelles dans un rayon
   */
  findInRadius(
    query: RadiusQuery,
    options: SpatialQueryOptions = {}
  ): Observable<SpatialQueryResult[]> {
    return this.http.post<SpatialQueryResult[]>(`${this.apiUrl}/radius`, {
      query,
      options
    });
  }

  /**
   * Trouve les parcelles dans une emprise
   */
  findInBounds(
    bounds: BoundsQuery,
    options: SpatialQueryOptions = {}
  ): Observable<SpatialQueryResult[]> {
    return this.http.post<SpatialQueryResult[]>(`${this.apiUrl}/bounds`, {
      bounds,
      options
    });
  }

  // =====================================================
  // REQUÊTES DE MESURE
  // =====================================================

  /**
   * Calcule la distance entre deux géométries
   */
  calculateDistance(
    geometry1: any,
    geometry2: any,
    unit: 'meters' | 'kilometers' = 'meters'
  ): Observable<{ distance: number; unit: string }> {
    return this.http.post<{ distance: number; unit: string }>(`${this.apiUrl}/distance`, {
      geometry1,
      geometry2,
      unit
    });
  }

  /**
   * Calcule l'aire d'intersection entre deux géométries
   */
  calculateIntersectionArea(
    geometry1: any,
    geometry2: any
  ): Observable<{ area: number; geometry: any }> {
    return this.http.post<{ area: number; geometry: any }>(`${this.apiUrl}/intersection-area`, {
      geometry1,
      geometry2
    });
  }

  /**
   * Calcule le buffer autour d'une géométrie
   */
  calculateBuffer(
    geometry: any,
    distance: number,
    unit: 'meters' | 'kilometers' = 'meters'
  ): Observable<{ geometry: any; area: number }> {
    return this.http.post<{ geometry: any; area: number }>(`${this.apiUrl}/buffer`, {
      geometry,
      distance,
      unit
    });
  }

  // =====================================================
  // REQUÊTES COMPLEXES
  // =====================================================

  /**
   * Analyse spatiale complète d'une parcelle
   */
  analyzeParcelle(
    parcelleId: number,
    includeNeighbors: boolean = true
  ): Observable<{
    parcelle: SpatialQueryResult;
    neighbors: SpatialQueryResult[];
    intersections: SpatialQueryResult[];
    statistics: {
      neighbor_count: number;
      average_neighbor_size: number;
      total_area_nearby: number;
      density_index: number;
    };
  }> {
    return this.http.get<any>(`${this.apiUrl}/analyze/${parcelleId}`, {
      params: { include_neighbors: includeNeighbors.toString() }
    });
  }

  /**
   * Détection de conflits spatiaux
   */
  detectConflicts(
    geometry: any,
    excludeParcelleId?: number
  ): Observable<{
    conflicts: {
      type: 'overlap' | 'gap' | 'duplicate';
      parcelles: SpatialQueryResult[];
      severity: 'low' | 'medium' | 'high';
      description: string;
    }[];
  }> {
    return this.http.post<any>(`${this.apiUrl}/conflicts`, {
      geometry,
      exclude_id: excludeParcelleId
    });
  }

  /**
   * Validation topologique
   */
  validateTopology(
    geometry: any
  ): Observable<{
    valid: boolean;
    errors: {
      type: string;
      message: string;
      location?: [number, number];
    }[];
  }> {
    return this.http.post<any>(`${this.apiUrl}/validate`, { geometry });
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  /**
   * Convertit des coordonnées entre systèmes
   */
  transformCoordinates(
    coordinates: [number, number][],
    fromSRID: number,
    toSRID: number
  ): Observable<[number, number][]> {
    return this.http.post<[number, number][]>(`${this.apiUrl}/transform`, {
      coordinates,
      from_srid: fromSRID,
      to_srid: toSRID
    });
  }

  /**
   * Simplifie une géométrie
   */
  simplifyGeometry(
    geometry: any,
    tolerance: number
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/simplify`, {
      geometry,
      tolerance
    });
  }

  // =====================================================
  // SIMULATIONS (À REMPLACER)
  // =====================================================

  private simulateIntersectionQuery(
    geometry: any,
    options: SpatialQueryOptions
  ): Observable<SpatialQueryResult[]> {
    const mockResults: SpatialQueryResult[] = [
      {
        id: 1,
        reference_fonciere: 'TF-123456',
        surface_totale: 1500,
        etat_validation: 'Valide',
        zonage: 'Résidentiel',
        montant_total_tnb: 15000,
        intersection_area: 250
      },
      {
        id: 2,
        reference_fonciere: 'R-789012',
        surface_totale: 2200,
        etat_validation: 'Publie',
        zonage: 'Commercial',
        montant_total_tnb: 25000,
        intersection_area: 180
      }
    ];

    return of(mockResults).pipe(delay(800));
  }

  private simulateNearbyQuery(
    geometry: any,
    distance: number,
    options: SpatialQueryOptions
  ): Observable<SpatialQueryResult[]> {
    const mockResults: SpatialQueryResult[] = [
      {
        id: 3,
        reference_fonciere: 'TF-345678',
        surface_totale: 1800,
        etat_validation: 'Valide',
        zonage: 'Résidentiel',
        montant_total_tnb: 18000,
        distance: 45
      },
      {
        id: 4,
        reference_fonciere: 'NI-901234',
        surface_totale: 950,
        etat_validation: 'Brouillon',
        zonage: 'Industriel',
        montant_total_tnb: 12000,
        distance: 78
      },
      {
        id: 5,
        reference_fonciere: 'TF-567890',
        surface_totale: 3200,
        etat_validation: 'Publie',
        zonage: 'Commercial',
        montant_total_tnb: 35000,
        distance: 92
      }
    ];

    // Filtrer par distance
    const filtered = mockResults.filter(r => (r.distance || 0) <= distance);
    
    return of(filtered).pipe(delay(1000));
  }

  // =====================================================
  // HELPERS GÉOMÉTRIQUES
  // =====================================================

  /**
   * Vérifie si une géométrie est valide
   */
  isValidGeometry(geometry: any): boolean {
    if (!geometry || !geometry.type) return false;
    
    switch (geometry.type) {
      case 'Point':
        return Array.isArray(geometry.coordinates) && geometry.coordinates.length === 2;
      case 'Polygon':
        return geometry.coordinates && 
               Array.isArray(geometry.coordinates[0]) && 
               geometry.coordinates[0].length >= 4;
      default:
        return false;
    }
  }

  /**
   * Calcule le centroïde d'une géométrie
   */
  getCentroid(geometry: any): [number, number] | null {
    if (!this.isValidGeometry(geometry)) return null;
    
    switch (geometry.type) {
      case 'Point':
        return geometry.coordinates;
      case 'Polygon':
        // Calcul approximatif du centroïde
        const coords = geometry.coordinates[0];
        const sumX = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0);
        const sumY = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0);
        return [sumX / coords.length, sumY / coords.length];
      default:
        return null;
    }
  }

  /**
   * Calcule les bounds d'une géométrie
   */
  getBounds(geometry: any): [number, number, number, number] | null {
    if (!this.isValidGeometry(geometry)) return null;
    
    let coords: number[][];
    
    switch (geometry.type) {
      case 'Point':
        const [x, y] = geometry.coordinates;
        return [x, y, x, y];
      case 'Polygon':
        coords = geometry.coordinates[0];
        break;
      default:
        return null;
    }
    
    const xs = coords.map(c => c[0]);
    const ys = coords.map(c => c[1]);
    
    return [
      Math.min(...xs),
      Math.min(...ys),
      Math.max(...xs),
      Math.max(...ys)
    ];
  }
}
