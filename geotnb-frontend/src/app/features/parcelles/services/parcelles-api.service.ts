// =====================================================
// SERVICE API PARCELLES - CONNEXION BACKEND COMPLÈTE
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// =====================================================
// INTERFACES API
// =====================================================

export interface ParcelleAPI {
  id: number;
  referenceFonciere: string;
  statutFoncier: string;
  surfaceTotale: number;
  surfaceImposable: number;
  zonage: string;
  statutOccupation: string;
  etatValidation: 'Brouillon' | 'Valide' | 'Publie' | 'Archive';
  montantTotalTnb: number;
  prixUnitaireM2: number;
  exonereTnb: boolean;
  datePermis?: Date;
  dureeExoneration?: number;
  geometry?: any; // GeoJSON
  centroideX?: number;
  centroideY?: number;
  perimetre?: number;
  dateCreation: Date;
  dateModification: Date;
  utilisateurCreation: string;
  utilisateurModification: string;
  proprietaires?: ProprietaireAPI[];
  documents?: DocumentAPI[];
}

export interface ProprietaireAPI {
  id: number;
  parcelleId: number;
  nom: string;
  prenom?: string;
  type: 'PHYSIQUE' | 'MORALE';
  cin?: string;
  rc?: string;
  telephone?: string;
  adresse?: string;
  email?: string;
  quotePart: number;
  montantTnb: number;
  dateCreation: Date;
}

export interface DocumentAPI {
  id: number;
  parcelle_id: number;
  nom_fichier: string;
  type_document: string;
  taille_fichier: number;
  chemin_fichier: string;
  description?: string;
  date_upload: Date;
  utilisateur_upload: string;
}

export interface SearchFilters {
  reference?: string;
  statutFoncier?: string;
  zonage?: string;
  etatValidation?: string;
  proprietaire?: string;
  globalSearch?: string;
  surfaceMin?: number;
  surfaceMax?: number;
  tnbMin?: number;
  tnbMax?: number;
  dateCreationDebut?: Date;
  dateCreationFin?: Date;
  exonereTnb?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UpdateParcelleData {
  referenceFonciere?: string;
  surfaceTotale?: number;
  surfaceImposable?: number;
  statutFoncier?: string;
  statutOccupation?: string;
  zonage?: string;
  exonereTnb?: boolean;
  datePermis?: Date;
  dureeExoneration?: number;
  observations?: string;
  etatValidation?: 'Brouillon' | 'Valide' | 'Publie' | 'Archive';
  geometry?: any;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SpatialQuery {
  type: 'POINT_RADIUS' | 'RECTANGLE' | 'POLYGON' | 'BUFFER';
  coordinates: number[] | number[][];
  radius?: number;
  buffer_distance?: number;
  spatial_relation?: 'INTERSECTS' | 'CONTAINS' | 'WITHIN' | 'TOUCHES';
}

export interface ImportResult {
  success: boolean;
  imported_count: number;
  errors_count: number;
  warnings_count: number;
  errors: string[];
  warnings: string[];
  import_id: string;
}

export interface ExportOptions {
  format: 'SHAPEFILE' | 'GEOJSON' | 'CSV' | 'EXCEL' | 'PDF' | 'KML';
  include_geometry: boolean;
  include_proprietaires: boolean;
  include_documents: boolean;
  projection?: string;
  filters?: SearchFilters;
}

@Injectable({
  providedIn: 'root'
})
export class ParcellesApiService {

  // =====================================================
  // PROPRIÉTÉS
  // =====================================================

  private readonly apiUrl = `${environment.apiUrl}/v1/parcelles`;
  
  // Cache et état
  private parcellesCache$ = new BehaviorSubject<ParcelleAPI[]>([]);
  private loadingState$ = new BehaviorSubject<boolean>(false);
  private errorState$ = new BehaviorSubject<string | null>(null);

  // Observables publics
  public parcelles$ = this.parcellesCache$.asObservable();
  public loading$ = this.loadingState$.asObservable();
  public error$ = this.errorState$.asObservable();

  constructor(private http: HttpClient) {}

  // =====================================================
  // OPÉRATIONS CRUD PARCELLES
  // =====================================================

  /**
   * Récupérer toutes les parcelles avec filtres
   */
  getParcelles(filters?: SearchFilters): Observable<SearchResult<ParcelleAPI>> {
    this.setLoading(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    const url = `${this.apiUrl}`;
    console.log('🔍 API getParcelles - URL:', url);
    console.log('🔍 API getParcelles - Filtres:', filters);
    console.log('🔍 API getParcelles - Paramètres HTTP:', params.toString());

    // Interface pour la réponse encapsulée de l'intercepteur
    interface ApiResponse<T> {
      success: boolean;
      data: T;
      timestamp: string;
      path: string;
      version: string;
    }

    return this.http.get<ApiResponse<SearchResult<ParcelleAPI>>>(url, { params })
      .pipe(
        map(response => response.data), // Extraire les données de l'enveloppe API
        tap(result => {
          console.log('✅ API getParcelles - Réponse reçue:', result);
          console.log('✅ API getParcelles - Type de réponse:', typeof result);
          console.log('✅ API getParcelles - Propriétés:', Object.keys(result || {}));
          this.parcellesCache$.next(result.data);
          this.setLoading(false);
          this.clearError();
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Récupérer une parcelle par ID
   */
  getParcelleById(id: number): Observable<ParcelleAPI> {
    this.setLoading(true);
    
    // Interface pour la réponse encapsulée de l'intercepteur
    interface ApiResponse<T> {
      success: boolean;
      data: T;
      timestamp: string;
      path: string;
      version: string;
    }

    return this.http.get<ApiResponse<ParcelleAPI>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data), // Extraire les données de l'enveloppe API
        tap(() => {
          this.setLoading(false);
          this.clearError();
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Créer une nouvelle parcelle
   */
  createParcelle(parcelle: any): Observable<ParcelleAPI> {
    this.setLoading(true);
    
    const url = `${this.apiUrl}`;
    console.log('🚀 API createParcelle - URL:', url);
    console.log('🚀 API createParcelle - Données envoyées:', parcelle);
    
    // Interface pour la réponse encapsulée de l'intercepteur
    interface ApiResponse<T> {
      success: boolean;
      data: T;
      timestamp: string;
      path: string;
      version: string;
    }
    
    return this.http.post<ApiResponse<ParcelleAPI>>(url, parcelle)
      .pipe(
        map(response => response.data), // Extraire les données de l'enveloppe API
        tap(newParcelle => {
          console.log('✅ API createParcelle - Réponse reçue:', newParcelle);
          const currentParcelles = this.parcellesCache$.value;
          this.parcellesCache$.next([...currentParcelles, newParcelle]);
          this.setLoading(false);
          this.clearError();
        }),
        catchError((error) => {
          console.error('❌ API createParcelle - Erreur:', error);
          console.error('❌ API createParcelle - Status:', error.status);
          console.error('❌ API createParcelle - Message:', error.message);
          console.error('❌ API createParcelle - Error body:', error.error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Mettre à jour une parcelle
   */
  updateParcelle(id: number, parcelle: Partial<UpdateParcelleData>): Observable<ParcelleAPI> {
    this.setLoading(true);
    
    // Interface pour la réponse encapsulée de l'intercepteur
    interface ApiResponse<T> {
      success: boolean;
      data: T;
      timestamp: string;
      path: string;
      version: string;
    }
    
    return this.http.put<ApiResponse<ParcelleAPI>>(`${this.apiUrl}/${id}`, parcelle)
      .pipe(
        map(response => response.data), // Extraire les données de l'enveloppe API
        tap(updatedParcelle => {
          const currentParcelles = this.parcellesCache$.value;
          const index = currentParcelles.findIndex(p => p.id === id);
          if (index !== -1) {
            currentParcelles[index] = updatedParcelle;
            this.parcellesCache$.next([...currentParcelles]);
          }
          this.setLoading(false);
          this.clearError();
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Supprimer une parcelle
   */
  deleteParcelle(id: number): Observable<void> {
    this.setLoading(true);
    
    // Interface pour la réponse encapsulée de l'intercepteur
    interface ApiResponse<T> {
      success: boolean;
      data: T;
      timestamp: string;
      path: string;
      version: string;
    }
    
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data), // Extraire les données de l'enveloppe API
        tap(() => {
          const currentParcelles = this.parcellesCache$.value;
          this.parcellesCache$.next(currentParcelles.filter(p => p.id !== id));
          this.setLoading(false);
          this.clearError();
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // =====================================================
  // OPÉRATIONS GÉOMÉTRIE
  // =====================================================

  /**
   * Mettre à jour la géométrie d'une parcelle
   */
  updateGeometry(id: number, geometry: any): Observable<ParcelleAPI> {
    this.setLoading(true);
    
    return this.http.put<ParcelleAPI>(`${this.apiUrl}/${id}/geometry`, { geometrie: geometry })
      .pipe(
        tap(updatedParcelle => {
          this.updateParcelleInCache(updatedParcelle);
          this.setLoading(false);
          this.clearError();
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Valider la géométrie d'une parcelle
   */
  validateGeometry(geometry: any): Observable<{ isValid: boolean; errors: string[] }> {
    return this.http.post<{ isValid: boolean; errors: string[] }>(`${this.apiUrl}/geometry/validate`, { geometrie: geometry })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Calculer les métriques géométriques
   */
  calculateGeometryMetrics(geometry: any): Observable<{ surface: number; perimetre: number; centroide: [number, number] }> {
    return this.http.post<{ surface: number; perimetre: number; centroide: [number, number] }>(`${this.apiUrl}/geometry/metrics`, { geometrie: geometry })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // =====================================================
  // OPÉRATIONS PROPRIÉTAIRES
  // =====================================================

  /**
   * Récupérer les propriétaires d'une parcelle
   */
  getProprietaires(parcelleId: number): Observable<ProprietaireAPI[]> {
    return this.http.get<ProprietaireAPI[]>(`${this.apiUrl}/${parcelleId}/proprietaires`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Ajouter un propriétaire à une parcelle
   */
  addProprietaire(parcelleId: number, proprietaire: Partial<ProprietaireAPI>): Observable<ProprietaireAPI> {
    return this.http.post<ProprietaireAPI>(`${this.apiUrl}/${parcelleId}/proprietaires`, proprietaire)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Mettre à jour un propriétaire
   */
  updateProprietaire(parcelleId: number, proprietaireId: number, proprietaire: Partial<ProprietaireAPI>): Observable<ProprietaireAPI> {
    return this.http.put<ProprietaireAPI>(`${this.apiUrl}/${parcelleId}/proprietaires/${proprietaireId}`, proprietaire)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Supprimer un propriétaire
   */
  deleteProprietaire(parcelleId: number, proprietaireId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${parcelleId}/proprietaires/${proprietaireId}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Valider les quote-parts d'une parcelle
   */
  validateQuoteParts(parcelleId: number): Observable<{ isValid: boolean; total: number; errors: string[] }> {
    return this.http.get<{ isValid: boolean; total: number; errors: string[] }>(`${this.apiUrl}/${parcelleId}/proprietaires/validate`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Corriger automatiquement les quote-parts
   */
  autoCorrectQuoteParts(parcelleId: number, method: 'PROPORTIONAL' | 'EQUAL' | 'MAJORITY'): Observable<ProprietaireAPI[]> {
    return this.http.post<ProprietaireAPI[]>(`${this.apiUrl}/${parcelleId}/proprietaires/auto-correct`, { method })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // =====================================================
  // CALCULS FISCAUX
  // =====================================================

  /**
   * Calculer la TNB d'une parcelle
   */
  calculateTNB(parcelleId: number): Observable<{ tnb_totale: number; details: any }> {
    return this.http.post<{ tnb_totale: number; details: any }>(`${this.apiUrl}/${parcelleId}/calculate-tnb`, {})
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Recalculer la TNB pour toutes les parcelles
   */
  recalculateAllTNB(): Observable<{ updated_count: number }> {
    this.setLoading(true);
    
    return this.http.post<{ updated_count: number }>(`${this.apiUrl}/recalculate-all-tnb`, {})
      .pipe(
        tap(() => {
          this.setLoading(false);
          this.clearError();
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Obtenir les tarifs TNB par zone
   */
  getTarifs(): Observable<{ zone: string; tarif: number; annee: number }[]> {
    return this.http.get<{ zone: string; tarif: number; annee: number }[]>(`${this.apiUrl}/tarifs`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // =====================================================
  // WORKFLOW ET VALIDATION
  // =====================================================

  /**
   * Changer le statut d'une parcelle
   */
  changeStatus(id: number, newStatus: 'BROUILLON' | 'VALIDE' | 'PUBLIE' | 'ARCHIVE', comment?: string): Observable<ParcelleAPI> {
    this.setLoading(true);
    
    return this.http.put<ParcelleAPI>(`${this.apiUrl}/${id}/status`, { 
      statut_validation: newStatus, 
      commentaire: comment 
    })
      .pipe(
        tap(updatedParcelle => {
          this.updateParcelleInCache(updatedParcelle);
          this.setLoading(false);
          this.clearError();
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Validation en lot
   */
  bulkValidate(parcelleIds: number[], newStatus: string): Observable<{ updated_count: number; errors: any[] }> {
    this.setLoading(true);
    
    return this.http.post<{ updated_count: number; errors: any[] }>(`${this.apiUrl}/bulk-validate`, {
      parcelle_ids: parcelleIds,
      statut_validation: newStatus
    })
      .pipe(
        tap(() => {
          this.setLoading(false);
          this.clearError();
          // Recharger les données
          this.getParcelles().subscribe();
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // =====================================================
  // RECHERCHE SPATIALE
  // =====================================================

  /**
   * Recherche spatiale
   */
  spatialSearch(query: SpatialQuery, filters?: SearchFilters): Observable<SearchResult<ParcelleAPI>> {
    this.setLoading(true);
    
    const body = { spatial_query: query, filters };
    
    return this.http.post<SearchResult<ParcelleAPI>>(`${this.apiUrl}/spatial-search`, body)
      .pipe(
        tap(() => {
          this.setLoading(false);
          this.clearError();
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Analyser les parcelles voisines
   */
  getNeighbors(id: number): Observable<ParcelleAPI[]> {
    return this.http.get<ParcelleAPI[]>(`${this.apiUrl}/${id}/neighbors`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // =====================================================
  // IMPORT/EXPORT
  // =====================================================

  /**
   * Importer des données
   */
  importData(file: File, options: any): Observable<ImportResult> {
    this.setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));
    
    return this.http.post<ImportResult>(`${this.apiUrl}/import`, formData)
      .pipe(
        tap(() => {
          this.setLoading(false);
          this.clearError();
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Exporter des données
   */
  exportData(options: ExportOptions): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export`, options, { 
      responseType: 'blob' 
    })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Obtenir l'historique des imports/exports
   */
  getImportExportHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/import-export/history`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // =====================================================
  // DOCUMENTS
  // =====================================================

  /**
   * Récupérer les documents d'une parcelle
   */
  getDocuments(parcelleId: number): Observable<DocumentAPI[]> {
    return this.http.get<DocumentAPI[]>(`${this.apiUrl}/${parcelleId}/documents`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Uploader un document
   */
  uploadDocument(parcelleId: number, file: File, description?: string): Observable<DocumentAPI> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    
    return this.http.post<DocumentAPI>(`${this.apiUrl}/${parcelleId}/documents`, formData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Supprimer un document
   */
  deleteDocument(parcelleId: number, documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${parcelleId}/documents/${documentId}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // =====================================================
  // STATISTIQUES
  // =====================================================

  /**
   * Obtenir les statistiques générales
   */
  getStatistics(): Observable<any> {
    // Interface pour la réponse encapsulée de l'intercepteur
    interface ApiResponse<T> {
      success: boolean;
      data: T;
      timestamp: string;
      path: string;
      version: string;
    }
    
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/statistics`)
      .pipe(
        map(response => response.data), // Extraire les données de l'enveloppe API
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Obtenir les statistiques par zone
   */
  getStatisticsByZone(): Observable<any[]> {
    // Interface pour la réponse encapsulée de l'intercepteur
    interface ApiResponse<T> {
      success: boolean;
      data: T;
      timestamp: string;
      path: string;
      version: string;
    }
    
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/statistics/by-zone`)
      .pipe(
        map(response => response.data), // Extraire les données de l'enveloppe API
        catchError(this.handleError.bind(this))
      );
  }

  // =====================================================
  // MÉTHODES UTILITAIRES PRIVÉES
  // =====================================================

  private updateParcelleInCache(updatedParcelle: ParcelleAPI): void {
    const currentParcelles = this.parcellesCache$.value;
    const index = currentParcelles.findIndex(p => p.id === updatedParcelle.id);
    if (index !== -1) {
      currentParcelles[index] = updatedParcelle;
      this.parcellesCache$.next([...currentParcelles]);
    }
  }

  private setLoading(loading: boolean): void {
    this.loadingState$.next(loading);
  }

  private clearError(): void {
    this.errorState$.next(null);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    this.setLoading(false);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Erreur ${error.status}: ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    this.errorState$.next(errorMessage);
    console.error('Erreur API Parcelles:', error);
    
    return throwError(() => new Error(errorMessage));
  }

  // =====================================================
  // MÉTHODES PUBLIQUES UTILITAIRES
  // =====================================================

  /**
   * Vider le cache
   */
  clearCache(): void {
    this.parcellesCache$.next([]);
    this.clearError();
  }

  /**
   * Recharger les données
   */
  refresh(): Observable<SearchResult<ParcelleAPI>> {
    this.clearCache();
    return this.getParcelles();
  }
}
