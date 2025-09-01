// =====================================================
// SERVICE PARCELLES - GESTION COMPLÈTE AVEC API
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Modèles
import { Parcelle, CreateParcelleDto, UpdateParcelleDto, SearchParcelleDto, PaginatedResult } from '../models/parcelle.models';

@Injectable({
  providedIn: 'root'
})
export class ParcelleService {
  private apiUrl = `${environment.apiUrl}/v1/parcelles`;

  constructor(private http: HttpClient) {}

  /**
   * Créer les headers d'authentification
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('geotnb_token') || sessionStorage.getItem('geotnb_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Créer une nouvelle parcelle
   */
  createParcelle(createParcelleDto: CreateParcelleDto): Observable<Parcelle> {
    return this.http.post<Parcelle>(this.apiUrl, createParcelleDto, { headers: this.getAuthHeaders() });
  }

  /**
   * Mettre à jour une parcelle existante
   */
  updateParcelle(id: number, updateParcelleDto: UpdateParcelleDto): Observable<Parcelle> {
    return this.http.patch<Parcelle>(`${this.apiUrl}/${id}`, updateParcelleDto, { headers: this.getAuthHeaders() });
  }

  /**
   * Récupérer une parcelle par ID
   */
  getParcelle(id: number): Observable<Parcelle> {
    return this.http.get<Parcelle>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer toutes les parcelles avec pagination et recherche
   */
  getParcelles(searchDto?: SearchParcelleDto): Observable<PaginatedResult<Parcelle>> {
    const params = searchDto ? this.buildSearchParams(searchDto) : {};
    return this.http.get<PaginatedResult<Parcelle>>(this.apiUrl, { params });
  }

  /**
   * Supprimer une parcelle
   */
  deleteParcelle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les statistiques des parcelles
   */
  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`);
  }

  /**
   * Recherche spatiale par distance
   */
  findByDistance(longitude: number, latitude: number, distance: number): Observable<Parcelle[]> {
    return this.http.get<Parcelle[]>(`${this.apiUrl}/spatial/distance`, {
      params: { longitude: longitude.toString(), latitude: latitude.toString(), distance: distance.toString() }
    });
  }

  /**
   * Recherche spatiale par bounding box
   */
  findByBoundingBox(bbox: [number, number, number, number]): Observable<Parcelle[]> {
    const [minX, minY, maxX, maxY] = bbox;
    return this.http.get<Parcelle[]>(`${this.apiUrl}/spatial/bbox`, {
      params: { minX: minX.toString(), minY: minY.toString(), maxX: maxX.toString(), maxY: maxY.toString() }
    });
  }

  /**
   * Vérifier si une référence foncière existe déjà
   */
  checkReferenceExists(reference: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-reference/${reference}`);
  }

  /**
   * Recherche avancée de parcelles
   */
  searchParcelles(criteria: SearchParcelleDto): Observable<PaginatedResult<Parcelle>> {
    return this.getParcelles(criteria);
  }

  /**
   * Valider une parcelle (changer l'état vers 'Valide')
   */
  validateParcelle(id: number): Observable<Parcelle> {
    return this.updateParcelle(id, { 
      id, 
      etat_validation: 'Valide' as any,
      derniere_mise_a_jour: new Date()
    });
  }

  /**
   * Publier une parcelle (changer l'état vers 'Publie')
   */
  publishParcelle(id: number): Observable<Parcelle> {
    return this.updateParcelle(id, { 
      id, 
      etat_validation: 'Publie' as any,
      derniere_mise_a_jour: new Date()
    });
  }

  /**
   * Archiver une parcelle (changer l'état vers 'Archive')
   */
  archiveParcelle(id: number): Observable<Parcelle> {
    return this.updateParcelle(id, { 
      id, 
      etat_validation: 'Archive' as any,
      derniere_mise_a_jour: new Date()
    });
  }

  /**
   * Exécuter une action de workflow
   */
  executeWorkflowAction(id: number, action: string, comment?: string): Observable<Parcelle> {
    return this.http.post<Parcelle>(`${this.apiUrl}/${id}/workflow`, { action, comment });
  }

  /**
   * Construire les paramètres de recherche
   */
  private buildSearchParams(searchDto: SearchParcelleDto): any {
    const params: any = {};
    
    if (searchDto.reference_fonciere) params.reference_fonciere = searchDto.reference_fonciere;
    if (searchDto.proprietaire) params.proprietaire = searchDto.proprietaire;
    if (searchDto.zonage) params.zonage = searchDto.zonage;
    if (searchDto.statut_foncier) params.statut_foncier = searchDto.statut_foncier;
    if (searchDto.statut_occupation) params.statut_occupation = searchDto.statut_occupation;
    if (searchDto.etat_validation) params.etat_validation = searchDto.etat_validation;
    if (searchDto.surface_min) params.surface_min = searchDto.surface_min.toString();
    if (searchDto.surface_max) params.surface_max = searchDto.surface_max.toString();
    if (searchDto.montant_min) params.montant_min = searchDto.montant_min.toString();
    if (searchDto.montant_max) params.montant_max = searchDto.montant_max.toString();
    if (searchDto.exonere_tnb !== undefined) params.exonere_tnb = searchDto.exonere_tnb.toString();
    if (searchDto.page) params.page = searchDto.page.toString();
    if (searchDto.limit) params.limit = searchDto.limit.toString();
    if (searchDto.sortBy) params.sortBy = searchDto.sortBy;
    if (searchDto.sortOrder) params.sortOrder = searchDto.sortOrder;
    
    return params;
  }
}