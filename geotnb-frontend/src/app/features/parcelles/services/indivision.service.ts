// =====================================================
// SERVICE INDIVISION - GESTION PROPRIÉTAIRES MULTIPLES
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

// Configuration
import { getConfig } from '../../../core/config/app.config';
import { API_ENDPOINTS } from '../../../core/config/endpoints.config';

// Models
import { Proprietaire, ParcelleProprietaire } from '../models/parcelle.models';

export interface QuotePartValidation {
  valid: boolean;
  total: number;
  errors: string[];
  warnings: string[];
}

export interface IndivisionAnalysis {
  parcelle_id: number;
  proprietaires_count: number;
  quote_parts_valid: boolean;
  total_quote_part: number;
  montant_total: number;
  proprietaires: ParcelleProprietaire[];
  conflicts: {
    type: 'duplicate_cin' | 'invalid_quote' | 'missing_data';
    message: string;
    proprietaire_index?: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class IndivisionService {
  private apiUrl = `${getConfig().apiUrl}${API_ENDPOINTS.parcelles.base}/indivision`;

  constructor(private http: HttpClient) {}

  // =====================================================
  // GESTION PROPRIÉTAIRES EXISTANTS
  // =====================================================

  /**
   * Récupère tous les propriétaires existants pour autocomplete
   */
  getProprietairesExistants(): Observable<Proprietaire[]> {
    // Simulation - à remplacer par vraie API
    return this.simulateProprietairesExistants();
    
    /* Vraie implémentation:
    return this.http.get<Proprietaire[]>(`${this.apiUrl}/proprietaires-existants`);
    */
  }

  /**
   * Recherche propriétaires par terme
   */
  searchProprietaires(term: string): Observable<Proprietaire[]> {
    return this.http.get<Proprietaire[]>(`${this.apiUrl}/search-proprietaires`, {
      params: { q: term }
    });
  }

  /**
   * Récupère un propriétaire par CIN/RC
   */
  getProprietaireByCinRc(cinRc: string): Observable<Proprietaire | null> {
    return this.http.get<Proprietaire | null>(`${this.apiUrl}/proprietaire-by-cin/${cinRc}`);
  }

  // =====================================================
  // VALIDATION QUOTE-PARTS
  // =====================================================

  /**
   * Valide les quote-parts d'une indivision
   */
  validateQuoteParts(quoteParts: number[]): QuotePartValidation {
    const total = quoteParts.reduce((sum, qp) => sum + qp, 0);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vérifications
    if (Math.abs(total - 1.0) > 0.001) {
      errors.push(`La somme des quote-parts (${total.toFixed(4)}) doit être égale à 1.0`);
    }

    quoteParts.forEach((qp, index) => {
      if (qp <= 0) {
        errors.push(`Quote-part ${index + 1} doit être supérieure à 0`);
      }
      if (qp > 1) {
        errors.push(`Quote-part ${index + 1} ne peut pas dépasser 1.0`);
      }
      if (qp < 0.01) {
        warnings.push(`Quote-part ${index + 1} très faible (${(qp * 100).toFixed(2)}%)`);
      }
    });

    return {
      valid: errors.length === 0,
      total,
      errors,
      warnings
    };
  }

  /**
   * Normalise les quote-parts pour qu'elles totalisent 1.0
   */
  normalizeQuoteParts(quoteParts: number[]): number[] {
    const total = quoteParts.reduce((sum, qp) => sum + qp, 0);
    if (total === 0) return quoteParts;
    
    return quoteParts.map(qp => qp / total);
  }

  /**
   * Redistribue équitablement les quote-parts
   */
  redistributeEqually(count: number): number[] {
    const equalPart = 1.0 / count;
    return Array(count).fill(equalPart);
  }

  // =====================================================
  // CALCULS FISCAUX
  // =====================================================

  /**
   * Calcule les montants individuels TNB
   */
  calculateMontantsIndividuels(
    quoteParts: number[], 
    montantTotal: number
  ): number[] {
    return quoteParts.map(qp => montantTotal * qp);
  }

  /**
   * Analyse complète d'une indivision
   */
  analyzeIndivision(
    parcelleId: number,
    proprietaires: ParcelleProprietaire[]
  ): Observable<IndivisionAnalysis> {
    return this.http.post<IndivisionAnalysis>(`${this.apiUrl}/analyze`, {
      parcelle_id: parcelleId,
      proprietaires
    });
  }

  // =====================================================
  // GESTION HISTORIQUE
  // =====================================================

  /**
   * Récupère l'historique des propriétaires d'une parcelle
   */
  getHistoriqueProprietaires(parcelleId: number): Observable<ParcelleProprietaire[]> {
    return this.http.get<ParcelleProprietaire[]>(`${this.apiUrl}/historique/${parcelleId}`);
  }

  /**
   * Archive une relation propriétaire-parcelle
   */
  archiverProprietaire(
    parcelleId: number, 
    proprietaireId: number,
    dateFin: Date
  ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/archiver`, {
      parcelle_id: parcelleId,
      proprietaire_id: proprietaireId,
      date_fin: dateFin
    });
  }

  // =====================================================
  // IMPORT/EXPORT
  // =====================================================

  /**
   * Importe propriétaires depuis une autre parcelle
   */
  importFromParcelle(
    sourceParcelleId: number,
    targetParcelleId: number
  ): Observable<ParcelleProprietaire[]> {
    return this.http.post<ParcelleProprietaire[]>(`${this.apiUrl}/import-from-parcelle`, {
      source_parcelle_id: sourceParcelleId,
      target_parcelle_id: targetParcelleId
    });
  }

  /**
   * Importe propriétaires depuis un fichier Excel
   */
  importFromExcel(
    parcelleId: number,
    file: File
  ): Observable<{
    imported: number;
    errors: string[];
    proprietaires: ParcelleProprietaire[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parcelle_id', parcelleId.toString());

    return this.http.post<any>(`${this.apiUrl}/import-excel`, formData);
  }

  /**
   * Exporte propriétaires vers Excel
   */
  exportToExcel(parcelleId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-excel/${parcelleId}`, {
      responseType: 'blob'
    });
  }

  // =====================================================
  // DÉTECTION DE CONFLITS
  // =====================================================

  /**
   * Détecte les conflits dans une indivision
   */
  detectConflicts(proprietaires: ParcelleProprietaire[]): {
    type: 'duplicate_cin' | 'invalid_quote' | 'missing_data' | 'date_conflict';
    message: string;
    proprietaire_index?: number;
    severity: 'error' | 'warning';
  }[] {
    const conflicts: any[] = [];

    // Vérifier doublons CIN/RC
    const cinsRcs = proprietaires.map(p => p.proprietaire?.cin_ou_rc).filter(cin => cin);
    const duplicateCins = cinsRcs.filter((cin, index) => cinsRcs.indexOf(cin) !== index);
    
    duplicateCins.forEach(cin => {
      conflicts.push({
        type: 'duplicate_cin',
        message: `CIN/RC en doublon: ${cin}`,
        severity: 'error'
      });
    });

    // Vérifier quote-parts
    const quoteParts = proprietaires.map(p => p.quote_part || 0);
    const validation = this.validateQuoteParts(quoteParts);
    
    validation.errors.forEach(error => {
      conflicts.push({
        type: 'invalid_quote',
        message: error,
        severity: 'error'
      });
    });

    validation.warnings.forEach(warning => {
      conflicts.push({
        type: 'invalid_quote',
        message: warning,
        severity: 'warning'
      });
    });

    // Vérifier données manquantes
    proprietaires.forEach((p, index) => {
      if (!p.proprietaire?.nom || p.proprietaire.nom.trim() === '') {
        conflicts.push({
          type: 'missing_data',
          message: `Nom manquant pour le propriétaire ${index + 1}`,
          proprietaire_index: index,
          severity: 'error'
        });
      }
      
      if (!p.proprietaire?.cin_ou_rc || p.proprietaire.cin_ou_rc.trim() === '') {
        conflicts.push({
          type: 'missing_data',
          message: `CIN/RC manquant pour le propriétaire ${index + 1}`,
          proprietaire_index: index,
          severity: 'error'
        });
      }
    });

    // Vérifier conflits de dates
    proprietaires.forEach((p, index) => {
      if (p.date_fin && p.date_debut && p.date_fin <= p.date_debut) {
        conflicts.push({
          type: 'date_conflict',
          message: `Date de fin antérieure à la date de début pour le propriétaire ${index + 1}`,
          proprietaire_index: index,
          severity: 'error'
        });
      }
    });

    return conflicts;
  }

  // =====================================================
  // STATISTIQUES
  // =====================================================

  /**
   * Statistiques d'indivision pour une parcelle
   */
  getStatistiquesIndivision(parcelleId: number): Observable<{
    proprietaires_count: number;
    quote_part_moyenne: number;
    quote_part_min: number;
    quote_part_max: number;
    montant_moyen: number;
    nature_repartition: {
      physique: number;
      morale: number;
    };
  }> {
    return this.http.get<any>(`${this.apiUrl}/statistiques/${parcelleId}`);
  }

  // =====================================================
  // SIMULATIONS (À REMPLACER)
  // =====================================================

  private simulateProprietairesExistants(): Observable<Proprietaire[]> {
    const mockProprietaires: Proprietaire[] = [
      {
        id: 1,
        nom: 'ALAMI',
        prenom: 'Mohamed',
        nature: 'Physique',
        cin_ou_rc: 'AB123456',
        adresse: 'Rue 1, Casablanca',
        telephone: '0661234567',
        email: 'mohamed.alami@email.com',
        est_actif: true,
        date_creation: new Date(),
        date_modification: new Date()
      },
      {
        id: 2,
        nom: 'BENNANI',
        prenom: 'Fatima',
        nature: 'Physique',
        cin_ou_rc: 'CD789012',
        adresse: 'Avenue 2, Rabat',
        telephone: '0662345678',
        email: 'fatima.bennani@email.com',
        est_actif: true,
        date_creation: new Date(),
        date_modification: new Date()
      },
      {
        id: 3,
        nom: 'SOCIÉTÉ IMMOBILIÈRE DU MAROC',
        prenom: undefined,
        nature: 'Morale',
        cin_ou_rc: '12345678',
        adresse: 'Boulevard 3, Casablanca',
        telephone: '0522123456',
        email: 'contact@sim.ma',
        est_actif: true,
        date_creation: new Date(),
        date_modification: new Date()
      },
      {
        id: 4,
        nom: 'TAZI',
        prenom: 'Ahmed',
        nature: 'Physique',
        cin_ou_rc: 'EF345678',
        adresse: 'Rue 4, Fès',
        telephone: '0663456789',
        email: 'ahmed.tazi@email.com',
        est_actif: true,
        date_creation: new Date(),
        date_modification: new Date()
      },
      {
        id: 5,
        nom: 'IDRISSI',
        prenom: 'Aicha',
        nature: 'Physique',
        cin_ou_rc: 'GH567890',
        adresse: 'Avenue 5, Marrakech',
        telephone: '0664567890',
        email: 'aicha.idrissi@email.com',
        est_actif: true,
        date_creation: new Date(),
        date_modification: new Date()
      }
    ];

    return of(mockProprietaires).pipe(delay(500));
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  /**
   * Formate un nom complet
   */
  formatNomComplet(proprietaire: Proprietaire): string {
    if (proprietaire.nature === 'Morale') {
      return proprietaire.nom;
    }
    return proprietaire.prenom ? 
      `${proprietaire.nom} ${proprietaire.prenom}` : 
      proprietaire.nom;
  }

  /**
   * Génère un code unique pour une relation parcelle-propriétaire
   */
  generateRelationCode(parcelleId: number, proprietaireId: number): string {
    return `PP-${parcelleId}-${proprietaireId}-${Date.now()}`;
  }

  /**
   * Valide un CIN/RC selon la nature
   */
  validateCinRc(cinRc: string, nature: string): boolean {
    if (nature === 'Physique') {
      // CIN marocaine: 1-2 lettres + 6-8 chiffres
      return /^[A-Z]{1,2}[0-9]{6,8}$/i.test(cinRc);
    } else {
      // RC: chiffres uniquement
      return /^[0-9]+$/.test(cinRc);
    }
  }
}
