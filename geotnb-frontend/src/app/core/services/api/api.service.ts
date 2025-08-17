import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse, SearchCriteria } from '../../models/common/api-response.model';
import { PaginationParams } from '../../models/common/pagination.model'; // CORRIGÉ: Import depuis pagination.model

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly defaultTimeout = 30000; // 30 secondes

  constructor() {}

  /**
   * GET Request générique
   */
  get<T>(endpoint: string, params?: any, options?: { timeout?: number }): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * POST Request générique
   */
  post<T>(endpoint: string, data: any, options?: { timeout?: number }): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * PUT Request générique
   */
  put<T>(endpoint: string, data: any, options?: { timeout?: number }): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH Request générique
   */
  patch<T>(endpoint: string, data: any, options?: { timeout?: number }): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE Request générique
   */
  delete<T>(endpoint: string, options?: { timeout?: number }): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * Upload de fichier
   */
  uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const headers = new HttpHeaders();
    // Ne pas définir Content-Type, laissez le navigateur le faire pour FormData

    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData, {
      headers
    }).pipe(
      timeout(60000), // Timeout plus long pour upload
      catchError(this.handleError)
    );
  }

  /**
   * Téléchargement de fichier
   */
  downloadFile(endpoint: string, filename?: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${endpoint}`, {
      responseType: 'blob',
      headers: this.getHeaders()
    }).pipe(
      timeout(60000), // Timeout plus long pour download
      map(blob => {
        if (filename) {
          // Trigger download
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(url);
        }
        return blob;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Request avec pagination
   */
  getPaginated<T>(
    endpoint: string, 
    paginationParams: PaginationParams, 
    searchCriteria?: SearchCriteria
  ): Observable<ApiResponse<T[]>> {
    let params: any = {
      page: paginationParams.page,
      size: paginationParams.size
    };

    if (paginationParams.sortBy) {
      params.sortBy = paginationParams.sortBy;
      params.sortDirection = paginationParams.sortDirection || 'asc';
    }

    if (searchCriteria) {
      params = { ...params, ...searchCriteria };
    }

    return this.get<ApiResponse<T[]>>(endpoint, params);
  }

  /**
   * Headers par défaut
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  /**
   * Gestion globale des erreurs
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('API Error:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de se connecter au serveur';
          break;
        case 400:
          errorMessage = error.error?.message || 'Requête invalide';
          break;
        case 401:
          errorMessage = 'Non autorisé - Veuillez vous reconnecter';
          break;
        case 403:
          errorMessage = 'Accès interdit';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 422:
          errorMessage = error.error?.message || 'Données invalides';
          break;
        case 500:
          errorMessage = 'Erreur interne du serveur';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.error?.message || error.message}`;
      }
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  };
}