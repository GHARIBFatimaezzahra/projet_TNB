/* =====================================================
   SERVICE REQUÊTES SPATIALES - POSTGIS & GEOSERVER
   ===================================================== */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Interfaces pour les requêtes spatiales
export interface SpatialQueryParams {
  type: 'emprise' | 'secteur' | 'distance';
  geometry?: string; // WKT geometry
  secteurId?: string;
  point?: { x: number; y: number };
  radius?: number;
  filters?: {
    statutFoncier?: string;
    zonage?: string;
    surfaceMin?: number;
  };
}

export interface ParcelleResult {
  id: number;
  referenceFonciere: string;
  proprietaire: string;
  statutFoncier: 'TF' | 'R' | 'NI';
  surfaceCadastrale: number;
  surfaceImposable: number;
  zoneUrbanistique: string;
  montantTNB: number;
  adresse: string;
  geometry: string; // WKT
  distance?: number; // Pour les requêtes de distance
}

export interface SpatialQueryResult {
  parcelles: ParcelleResult[];
  summary: {
    totalParcelles: number;
    surfaceTotale: number;
    surfaceImposable: number;
    recettePrevue: number;
  };
  queryInfo: {
    type: string;
    geometry?: string;
    secteur?: string;
    radius?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SpatialQueryService {
  private readonly apiUrl = 'http://localhost:8080/api/spatial-queries';
  private readonly geoserverUrl = 'http://localhost:8080/geoserver';

  constructor(private http: HttpClient) {}

  /**
   * Exécuter une requête spatiale
   */
  executeSpatialQuery(params: SpatialQueryParams): Observable<SpatialQueryResult> {
    console.log('🔍 Exécution requête spatiale:', params);
    
    // Pour le développement, utiliser des données de démonstration
    return of(this.generateMockResults(params));
  }

  /**
   * Requête d'intersection avec emprise
   */
  queryByEmprise(geometry: string, filters?: any): Observable<SpatialQueryResult> {
    const params: SpatialQueryParams = {
      type: 'emprise',
      geometry: geometry,
      filters: filters
    };
    return this.executeSpatialQuery(params);
  }

  /**
   * Requête par secteur administratif
   */
  queryBySecteur(secteurId: string, filters?: any): Observable<SpatialQueryResult> {
    const params: SpatialQueryParams = {
      type: 'secteur',
      secteurId: secteurId,
      filters: filters
    };
    return this.executeSpatialQuery(params);
  }

  /**
   * Requête par rayon de distance
   */
  queryByDistance(point: { x: number; y: number }, radius: number, filters?: any): Observable<SpatialQueryResult> {
    const params: SpatialQueryParams = {
      type: 'distance',
      point: point,
      radius: radius,
      filters: filters
    };
    return this.executeSpatialQuery(params);
  }

  /**
   * Export des résultats
   */
  exportResults(results: ParcelleResult[], format: 'excel' | 'csv' | 'gpkg' | 'pdf'): Observable<Blob> {
    console.log(`📤 Export ${format} de ${results.length} parcelles`);
    
    // Simulation d'export
    const mockBlob = new Blob(['Export data'], { type: 'application/octet-stream' });
    return of(mockBlob);
  }

  /**
   * Obtenir les secteurs disponibles
   */
  getSecteurs(type: 'arrondissement' | 'quartier' | 'commune'): Observable<any[]> {
    const secteurs = {
      arrondissement: [
        { id: 'arr-1', nom: '1er Arrondissement', geometry: 'POLYGON(...)' },
        { id: 'arr-2', nom: '2ème Arrondissement', geometry: 'POLYGON(...)' }
      ],
      quartier: [
        { id: 'quartier-centre', nom: 'Centre-ville', geometry: 'POLYGON(...)' },
        { id: 'quartier-hay-qods', nom: 'Hay Al Qods', geometry: 'POLYGON(...)' },
        { id: 'quartier-sidi-maafa', nom: 'Sidi Maâfa', geometry: 'POLYGON(...)' },
        { id: 'quartier-andalous', nom: 'Al Andalous', geometry: 'POLYGON(...)' }
      ],
      commune: [
        { id: 'commune-oujda', nom: 'Commune Oujda', geometry: 'POLYGON(...)' },
        { id: 'commune-bni-drar', nom: 'Commune Bni Drar', geometry: 'POLYGON(...)' }
      ]
    };
    
    return of(secteurs[type] || []);
  }

  /**
   * Génération de données de démonstration
   */
  private generateMockResults(params: SpatialQueryParams): SpatialQueryResult {
    const mockParcelles: ParcelleResult[] = [
      {
        id: 1,
        referenceFonciere: 'TF-45628/O',
        proprietaire: 'ALAMI Mohammed',
        statutFoncier: 'TF',
        surfaceCadastrale: 850,
        surfaceImposable: 720,
        zoneUrbanistique: 'R+2',
        montantTNB: 10625,
        adresse: 'Secteur Lazaret, Quartier Al Qods',
        geometry: 'POLYGON((-1.9 34.7, -1.89 34.7, -1.89 34.71, -1.9 34.71, -1.9 34.7))',
        distance: params.type === 'distance' ? Math.random() * 500 : undefined
      },
      {
        id: 2,
        referenceFonciere: 'R-2341/O',
        proprietaire: 'BENALI Fatima',
        statutFoncier: 'R',
        surfaceCadastrale: 1200,
        surfaceImposable: 1020,
        zoneUrbanistique: 'Villas',
        montantTNB: 21600,
        adresse: 'Secteur Centre, Quartier Andalous',
        geometry: 'POLYGON((-1.88 34.69, -1.87 34.69, -1.87 34.7, -1.88 34.7, -1.88 34.69))',
        distance: params.type === 'distance' ? Math.random() * 500 : undefined
      },
      {
        id: 3,
        referenceFonciere: 'NI-789/O',
        proprietaire: 'Héritiers TAZI',
        statutFoncier: 'NI',
        surfaceCadastrale: 650,
        surfaceImposable: 520,
        zoneUrbanistique: 'R+4',
        montantTNB: 9750,
        adresse: 'Secteur Sidi Maâfa, Quartier Résidentiel',
        geometry: 'POLYGON((-1.91 34.68, -1.9 34.68, -1.9 34.69, -1.91 34.69, -1.91 34.68))',
        distance: params.type === 'distance' ? Math.random() * 500 : undefined
      },
      {
        id: 4,
        referenceFonciere: 'TF-12345/O',
        proprietaire: 'EL FASSI Ahmed',
        statutFoncier: 'TF',
        surfaceCadastrale: 950,
        surfaceImposable: 800,
        zoneUrbanistique: 'R+2',
        montantTNB: 12000,
        adresse: 'Secteur Hay Al Qods, Quartier Commercial',
        geometry: 'POLYGON((-1.87 34.71, -1.86 34.71, -1.86 34.72, -1.87 34.72, -1.87 34.71))',
        distance: params.type === 'distance' ? Math.random() * 500 : undefined
      },
      {
        id: 5,
        referenceFonciere: 'R-5678/O',
        proprietaire: 'BENJELLOUN Khadija',
        statutFoncier: 'R',
        surfaceCadastrale: 750,
        surfaceImposable: 600,
        zoneUrbanistique: 'Industriel',
        montantTNB: 9000,
        adresse: 'Secteur Industriel, Zone d\'activité',
        geometry: 'POLYGON((-1.92 34.67, -1.91 34.67, -1.91 34.68, -1.92 34.68, -1.92 34.67))',
        distance: params.type === 'distance' ? Math.random() * 500 : undefined
      }
    ];

    // Filtrer selon les critères
    let filteredParcelles = mockParcelles;

    if (params.filters) {
      if (params.filters.statutFoncier) {
        filteredParcelles = filteredParcelles.filter(p => p.statutFoncier === params.filters!.statutFoncier);
      }
      if (params.filters.zonage) {
        filteredParcelles = filteredParcelles.filter(p => p.zoneUrbanistique === params.filters!.zonage);
      }
      if (params.filters.surfaceMin) {
        filteredParcelles = filteredParcelles.filter(p => p.surfaceCadastrale >= params.filters!.surfaceMin!);
      }
    }

    // Calculer le résumé
    const summary = {
      totalParcelles: filteredParcelles.length,
      surfaceTotale: filteredParcelles.reduce((sum, p) => sum + p.surfaceCadastrale, 0),
      surfaceImposable: filteredParcelles.reduce((sum, p) => sum + p.surfaceImposable, 0),
      recettePrevue: filteredParcelles.reduce((sum, p) => sum + p.montantTNB, 0)
    };

    return {
      parcelles: filteredParcelles,
      summary: summary,
      queryInfo: {
        type: params.type,
        geometry: params.geometry,
        secteur: params.secteurId,
        radius: params.radius
      }
    };
  }
}
