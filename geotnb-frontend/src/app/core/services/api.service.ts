import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse, HttpContext } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, forkJoin } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
  total?: number;
  page?: number;
  limit?: number;
}

export interface ApiRequestOptions {
  params?: any;
  headers?: HttpHeaders;
  reportProgress?: boolean;
  responseType?: 'json' | 'arraybuffer' | 'blob' | 'text';
  withCredentials?: boolean;
  context?: HttpContext;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private requestsCount = 0;
  
  public isLoading$ = this.loadingSubject.asObservable();
  
  constructor(private http: HttpClient) {}
  
  // === MÉTHODES HTTP PRINCIPALES ===

  get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('GET', endpoint, null, options);
  }

  post<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('POST', endpoint, body, options);
  }

  put<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('PUT', endpoint, body, options);
  }

  patch<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('PATCH', endpoint, body, options);
  }

  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('DELETE', endpoint, null, options);
  }

  // === MÉTHODE DE REQUÊTE GÉNÉRIQUE ===
  private request<T>(
    method: string,
    endpoint: string,
    body: any = null,
    options: ApiRequestOptions = {}
  ): Observable<T> {
    this.startLoading();

    const url = `${this.apiUrl}/${endpoint}`;
    const requestOptions = {
      body,
      params: this.createParams(options.params),
      headers: this.createHeaders(options.headers),
      reportProgress: options.reportProgress,
      responseType: options.responseType || 'json',
      withCredentials: options.withCredentials,
      context: options.context
    };

    return this.http.request(method, url, requestOptions).pipe(
      map((response: any) => {
        if (response.body && response.body.data) {
          return response.body.data;
        }
        return response.body || response;
      }),
      catchError(error => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  // === UPLOAD DE FICHIERS ===
  uploadFile(endpoint: string, file: File, fieldName: string = 'file', additionalData?: any): Observable<any> {
    this.startLoading();

    const formData = new FormData();
    formData.append(fieldName, file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        if (additionalData[key] !== null && additionalData[key] !== undefined) {
          formData.append(key, additionalData[key]);
        }
      });
    }
    
    return this.http.post(`${this.apiUrl}/${endpoint}`, formData, {
        reportProgress: true,
        observe: 'events'
      }).pipe(
      catchError(error => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  downloadFile(endpoint: string, options?: ApiRequestOptions): Observable<Blob> {
    return this.request<Blob>('GET', endpoint, null, {
      ...options,
      responseType: 'blob'
    });
  }

  // === GESTION DU LOADING ===
  private startLoading(): void {
    this.requestsCount++;
    if (this.requestsCount === 1) {
      this.loadingSubject.next(true);
    }
  }

  private stopLoading(): void {
    this.requestsCount--;
    if (this.requestsCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  // === MÉTHODES UTILITAIRES ===
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = error.error?.message || error.message || errorMessage;
    }

    console.error('API Error:', {
      message: errorMessage,
      status: error.status,
      url: error.url,
      details: error.error
    });

    return throwError(() => new Error(errorMessage));
  }

  private createParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }
    
    return httpParams;
  }

  private createHeaders(customHeaders?: HttpHeaders): HttpHeaders {
    let headers = customHeaders || new HttpHeaders();

    // Content-Type par défaut pour les requêtes non-FormData
    if (!headers.has('Content-Type') && !(customHeaders?.has('Content-Type'))) {
      headers = headers.set('Content-Type', 'application/json');
    }

    // Ajout du token JWT si disponible
    const token = localStorage.getItem('auth_token');
    if (token && !headers.has('Authorization')) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // === MÉTHODES SPÉCIFIQUES POUR LA PAGINATION ===
  getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 10,
    filters?: any,
    sort?: { field: string; order: 'ASC' | 'DESC' }
  ): Observable<{ data: T[]; total: number; page: number; limit: number }> {
    const params: any = {
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    };

    if (sort) {
      params.sortBy = sort.field;
      params.sortOrder = sort.order;
    }

    return this.get<{ data: T[]; total: number; page: number; limit: number }>(endpoint, { params });
  }

  // === MÉTHODES POUR LES REQUÊTES SIMULTANÉES ===
  parallelRequests<T>(requests: Observable<T>[]): Observable<T[]> {
    this.startLoading();
    return forkJoin(requests).pipe(
      finalize(() => this.stopLoading())
    );
  }
}