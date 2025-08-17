import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface TnbCalculationParams {
  surfaceImposable: number;
  zonage: string;
  statutFoncier: string;
  quotePart?: number;
  hasExemption?: boolean;
  exemptionDuration?: number;
  exemptionStartDate?: Date;
}

export interface TnbCalculationResult {
  surfaceImposable: number;
  tarifUnitaire: number;
  montantBrut: number;
  exemptionAppliquee: boolean;
  montantExemption: number;
  montantNet: number;
  quotePart: number;
  montantIndividuel: number;
  details: string;
}

export interface TarifConfig {
  zonage: string;
  tarifParM2: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class TnbCalculatorService {
  
  // Configuration des tarifs TNB par zone (peut être externalisée)
  private readonly tarifsConfig: TarifConfig[] = [
    { zonage: 'Zone A', tarifParM2: 20, description: 'Zone urbaine dense' },
    { zonage: 'Zone B', tarifParM2: 15, description: 'Zone urbaine moyenne' },
    { zonage: 'Zone C', tarifParM2: 10, description: 'Zone urbaine périphérique' },
    { zonage: 'Zone D', tarifParM2: 5, description: 'Zone rurale urbanisable' },
    { zonage: 'Zone E', tarifParM2: 2, description: 'Zone agricole' }
  ];

  /**
   * Calculer le montant TNB
   */
  calculateTnb(params: TnbCalculationParams): Observable<TnbCalculationResult> {
    const result = this.performCalculation(params);
    return of(result);
  }

  /**
   * Calculer pour plusieurs parcelles
   */
  calculateBulkTnb(paramsArray: TnbCalculationParams[]): Observable<TnbCalculationResult[]> {
    const results = paramsArray.map(params => this.performCalculation(params));
    return of(results);
  }

  /**
   * Obtenir le tarif pour une zone
   */
  getTarifForZone(zonage: string): number {
    const config = this.tarifsConfig.find(t => t.zonage === zonage);
    return config?.tarifParM2 || 0;
  }

  /**
   * Obtenir toutes les configurations de tarifs
   */
  getAllTarifs(): TarifConfig[] {
    return [...this.tarifsConfig];
  }

  /**
   * Vérifier si une exemption est encore valide
   */
  isExemptionValid(startDate: Date, duration: number): boolean {
    const currentDate = new Date();
    const expirationDate = new Date(startDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + duration);
    
    return currentDate <= expirationDate;
  }

  /**
   * Calculer les jours restants d'exemption
   */
  getRemainingExemptionDays(startDate: Date, duration: number): number {
    const currentDate = new Date();
    const expirationDate = new Date(startDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + duration);
    
    if (currentDate > expirationDate) {
      return 0;
    }
    
    const diffTime = expirationDate.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Simuler différents scénarios de calcul
   */
  simulateScenarios(
    baseParams: TnbCalculationParams,
    scenarios: Partial<TnbCalculationParams>[]
  ): Observable<Array<{ scenario: string; result: TnbCalculationResult }>> {
    const results = scenarios.map((scenario, index) => {
      const params = { ...baseParams, ...scenario };
      const result = this.performCalculation(params);
      return {
        scenario: `Scénario ${index + 1}`,
        result
      };
    });
    
    return of(results);
  }

  private performCalculation(params: TnbCalculationParams): TnbCalculationResult {
    const {
      surfaceImposable,
      zonage,
      quotePart = 1,
      hasExemption = false,
      exemptionDuration = 0,
      exemptionStartDate
    } = params;

    // 1. Obtenir le tarif unitaire
    const tarifUnitaire = this.getTarifForZone(zonage);

    // 2. Calculer le montant brut
    const montantBrut = surfaceImposable * tarifUnitaire;

    // 3. Vérifier l'exemption
    let exemptionAppliquee = false;
    let montantExemption = 0;

    if (hasExemption && exemptionStartDate) {
      exemptionAppliquee = this.isExemptionValid(exemptionStartDate, exemptionDuration);
      if (exemptionAppliquee) {
        montantExemption = montantBrut; // Exemption totale
      }
    }

    // 4. Calculer le montant net
    const montantNet = montantBrut - montantExemption;

    // 5. Appliquer la quote-part
    const montantIndividuel = montantNet * quotePart;

    // 6. Générer les détails
    const details = this.generateCalculationDetails({
      surfaceImposable,
      tarifUnitaire,
      montantBrut,
      exemptionAppliquee,
      montantExemption,
      montantNet,
      quotePart,
      montantIndividuel,
      zonage,
      exemptionDuration
    });

    return {
      surfaceImposable,
      tarifUnitaire,
      montantBrut,
      exemptionAppliquee,
      montantExemption,
      montantNet,
      quotePart,
      montantIndividuel,
      details
    };
  }

  private generateCalculationDetails(calculation: any): string {
    let details = `Calcul TNB:\n`;
    details += `- Surface imposable: ${calculation.surfaceImposable.toLocaleString('fr-FR')} m²\n`;
    details += `- Zone: ${calculation.zonage}\n`;
    details += `- Tarif unitaire: ${calculation.tarifUnitaire} DH/m²\n`;
    details += `- Montant brut: ${calculation.montantBrut.toLocaleString('fr-FR')} DH\n`;
    
    if (calculation.exemptionAppliquee) {
      details += `- Exemption appliquée (${calculation.exemptionDuration} ans): -${calculation.montantExemption.toLocaleString('fr-FR')} DH\n`;
      details += `- Montant net: ${calculation.montantNet.toLocaleString('fr-FR')} DH\n`;
    }
    
    if (calculation.quotePart < 1) {
      details += `- Quote-part: ${(calculation.quotePart * 100).toFixed(2)}%\n`;
      details += `- Montant individuel: ${calculation.montantIndividuel.toLocaleString('fr-FR')} DH\n`;
    }
    
    return details;
  }
}