// =====================================================
// SERVICE CALCUL FISCAL - CALCULS TNB ET TARIFS
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

// Configuration
import { getConfig } from '../../../core/config/app.config';
import { API_ENDPOINTS } from '../../../core/config/endpoints.config';
import { ConfigurationFiscale } from '../models/parcelle.models';

export interface FiscalCalculationRequest {
  surface_imposable: number;
  zonage: string;
  exonere_tnb: boolean;
  annee: number;
  date_permis?: string;
  duree_exoneration?: number;
}

export interface FiscalCalculationResult {
  tarif_unitaire: number;
  surface_imposable: number;
  montant_tnb: number;
  montant_exonere?: number;
  taux_exoneration?: number;
  date_fin_exoneration?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FiscalCalculationService {
  private apiUrl = `${getConfig().apiUrl}${API_ENDPOINTS.parcelles.base}`;

  constructor(private http: HttpClient) {}

  /**
   * Obtenir la configuration fiscale pour une zone et une année
   */
  getFiscalConfiguration(zonage: string, annee: number): Observable<ConfigurationFiscale | null> {
    // Simulation - en production, cela ferait un appel API
    const mockConfigs: ConfigurationFiscale[] = [
      { id: 1, zonage: 'U1', tarif_unitaire: 10, annee: 2024, actif: true, date_creation: new Date(), creer_par: 1 },
      { id: 2, zonage: 'U2', tarif_unitaire: 8, annee: 2024, actif: true, date_creation: new Date(), creer_par: 1 },
      { id: 3, zonage: 'R1', tarif_unitaire: 5, annee: 2024, actif: true, date_creation: new Date(), creer_par: 1 },
    ];

    const config = mockConfigs.find(c => c.zonage === zonage && c.annee === annee && c.actif);
    return of(config || null);
  }

  calculateTnb(request: FiscalCalculationRequest): Observable<FiscalCalculationResult> {
    // Simulation de calcul
    const tarifsZones: { [key: string]: number } = {
      'R+4': 12.50,
      'R+2': 10.00,
      'I1': 15.00,
      'I2': 18.00,
      'V': 8.00,
      'A': 6.00,
      'default': 10.00
    };

    const tarifUnitaire = tarifsZones[request.zonage] || tarifsZones['default'];
    let montantTnb = request.surface_imposable * tarifUnitaire;
    let montantExonere = 0;
    let tauxExoneration = 0;

    // Calcul d'exonération
    if (request.exonere_tnb && request.duree_exoneration && request.duree_exoneration > 0) {
      if (request.date_permis) {
        const datePermis = new Date(request.date_permis);
        const dateExpiration = new Date(datePermis);
        dateExpiration.setFullYear(dateExpiration.getFullYear() + request.duree_exoneration);
        
        if (new Date() < dateExpiration) {
          tauxExoneration = 1.0;
          montantExonere = montantTnb;
          montantTnb = 0;
        }
      }
    }

    const result: FiscalCalculationResult = {
      tarif_unitaire: tarifUnitaire,
      surface_imposable: request.surface_imposable,
      montant_tnb: montantTnb,
      montant_exonere: montantExonere,
      taux_exoneration: tauxExoneration
    };

    return of(result).pipe(delay(800));
  }

  formatMontant(montant: number): string {
    if (!montant) return '0 DH';
    return `${montant.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH`;
  }

  calculateSurfacePercentage(surfacePartielle: number, surfaceTotale: number): number {
    if (!surfaceTotale || surfaceTotale === 0) return 0;
    return Math.round((surfacePartielle / surfaceTotale) * 100);
  }
}