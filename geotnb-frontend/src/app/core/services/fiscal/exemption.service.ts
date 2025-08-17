import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ExemptionRule {
  id: string;
  name: string;
  description: string;
  duration: number; // en années
  conditions: ExemptionCondition[];
  isActive: boolean;
}

export interface ExemptionCondition {
  field: string;
  operator: 'equals' | 'lte' | 'gte' | 'in' | 'range';
  value: any;
  value2?: any; // pour range
}

export interface ExemptionEligibility {
  isEligible: boolean;
  applicableRules: ExemptionRule[];
  recommendedDuration: number;
  reasons: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ExemptionService {
  
  // Règles d'exemption prédéfinies (peuvent être externalisées)
  private readonly exemptionRules: ExemptionRule[] = [
    {
      id: 'small-parcel',
      name: 'Petite parcelle',
      description: 'Exemption pour les parcelles de moins de 100 m²',
      duration: 3,
      conditions: [
        { field: 'surfaceImposable', operator: 'lte', value: 100 }
      ],
      isActive: true
    },
    {
      id: 'medium-parcel',
      name: 'Parcelle moyenne',
      description: 'Exemption pour les parcelles de 100 à 500 m²',
      duration: 5,
      conditions: [
        { field: 'surfaceImposable', operator: 'range', value: 100, value2: 500 }
      ],
      isActive: true
    },
    {
      id: 'large-parcel',
      name: 'Grande parcelle',
      description: 'Exemption pour les parcelles de plus de 500 m²',
      duration: 7,
      conditions: [
        { field: 'surfaceImposable', operator: 'gte', value: 500 }
      ],
      isActive: true
    },
    {
      id: 'public-utility',
      name: 'Utilité publique',
      description: 'Exemption pour les terrains d\'utilité publique',
      duration: 99, // Exemption permanente
      conditions: [
        { field: 'statutFoncier', operator: 'equals', value: 'Domanial' }
      ],
      isActive: true
    },
    {
      id: 'agricultural-zone',
      name: 'Zone agricole',
      description: 'Exemption pour les terrains en zone agricole',
      duration: 10,
      conditions: [
        { field: 'zonage', operator: 'equals', value: 'Zone E' }
      ],
      isActive: true
    }
  ];

  /**
   * Vérifier l'éligibilité à une exemption
   */
  checkExemptionEligibility(parcelleData: any): Observable<ExemptionEligibility> {
    const eligibility = this.evaluateEligibility(parcelleData);
    return of(eligibility);
  }

  /**
   * Obtenir toutes les règles d'exemption
   */
  getAllExemptionRules(): Observable<ExemptionRule[]> {
    return of(this.exemptionRules.filter(rule => rule.isActive));
  }

  /**
   * Obtenir une règle d'exemption par ID
   */
  getExemptionRule(id: string): Observable<ExemptionRule | undefined> {
    const rule = this.exemptionRules.find(r => r.id === id);
    return of(rule);
  }

  /**
   * Calculer la durée d'exemption recommandée
   */
  getRecommendedExemptionDuration(surfaceImposable: number): number {
    if (surfaceImposable <= 100) return 3;
    if (surfaceImposable <= 500) return 5;
    return 7;
  }

  /**
   * Valider une demande d'exemption
   */
  validateExemptionRequest(
    parcelleData: any,
    requestedDuration: number,
    justification: string
  ): Observable<{ isValid: boolean; message: string }> {
    const eligibility = this.evaluateEligibility(parcelleData);
    
    if (!eligibility.isEligible) {
      return of({
        isValid: false,
        message: 'Cette parcelle n\'est pas éligible à une exemption selon les règles en vigueur.'
      });
    }

    if (requestedDuration > eligibility.recommendedDuration) {
      return of({
        isValid: false,
        message: `La durée demandée (${requestedDuration} ans) dépasse la durée maximale autorisée (${eligibility.recommendedDuration} ans).`
      });
    }

    if (!justification || justification.trim().length < 10) {
      return of({
        isValid: false,
        message: 'Une justification détaillée est requise pour la demande d\'exemption.'
      });
    }

    return of({
      isValid: true,
      message: 'Demande d\'exemption validée avec succès.'
    });
  }

  /**
   * Générer un rapport d'exemptions
   */
  generateExemptionReport(filters: any = {}): Observable<any[]> {
    // Cette méthode devrait normalement faire appel à l'API
    // Ici, nous retournons des données fictives pour l'exemple
    const mockData = [
      {
        parcelle: 'TF-001',
        proprietaire: 'Ahmed Benali',
        superficie: 150,
        duration: 5,
        dateDebut: new Date('2024-01-01'),
        dateFin: new Date('2029-01-01'),
        statut: 'Active'
      }
    ];
    
    return of(mockData);
  }

  private evaluateEligibility(parcelleData: any): ExemptionEligibility {
    const applicableRules: ExemptionRule[] = [];
    const reasons: string[] = [];

    for (const rule of this.exemptionRules) {
      if (!rule.isActive) continue;

      const meetsConditions = rule.conditions.every(condition => 
        this.evaluateCondition(parcelleData, condition)
      );

      if (meetsConditions) {
        applicableRules.push(rule);
        reasons.push(rule.description);
      }
    }

    const isEligible = applicableRules.length > 0;
    const recommendedDuration = isEligible 
      ? Math.max(...applicableRules.map(rule => rule.duration))
      : 0;

    return {
      isEligible,
      applicableRules,
      recommendedDuration,
      reasons
    };
  }

  private evaluateCondition(data: any, condition: ExemptionCondition): boolean {
    const fieldValue = this.getNestedValue(data, condition.field);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'lte':
        return typeof fieldValue === 'number' && fieldValue <= condition.value;
      case 'gte':
        return typeof fieldValue === 'number' && fieldValue >= condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'range':
        return typeof fieldValue === 'number' && 
               fieldValue >= condition.value && 
               fieldValue <= (condition.value2 || condition.value);
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
