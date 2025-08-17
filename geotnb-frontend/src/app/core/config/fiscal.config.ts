export interface FiscalConfig {
    zones: ZoneConfig[];
    exemptions: ExemptionConfig[];
    tarifs: TarifConfig[];
    calculations: CalculationConfig;
  }
  
  export interface ZoneConfig {
    id: string;
    code: string;
    name: string;
    description: string;
    tarifBase: number; // DH/m²
    couleur: string;
    isActive: boolean;
  }
  
  export interface ExemptionConfig {
    id: string;
    type: string;
    name: string;
    description: string;
    dureeAnnees: number;
    conditions: ExemptionCondition[];
    isActive: boolean;
  }
  
  export interface ExemptionCondition {
    field: string;
    operator: 'eq' | 'lt' | 'lte' | 'gt' | 'gte' | 'between';
    value: any;
    value2?: any;
  }
  
  export interface TarifConfig {
    id: string;
    zone: string;
    annee: number;
    tarifParM2: number;
    dateApplication: Date;
    isActive: boolean;
  }
  
  export interface CalculationConfig {
    arrondi: {
      enabled: boolean;
      decimales: number;
      methode: 'round' | 'floor' | 'ceil';
    };
    seuils: {
      surfaceMinimale: number;
      montantMinimal: number;
    };
    quotePart: {
      precision: number;
      toleranceErreur: number;
    };
  }
  
  export const FISCAL_CONFIG: FiscalConfig = {
    zones: [
      {
        id: 'zone-a',
        code: 'A',
        name: 'Zone A',
        description: 'Zone urbaine dense - Centre ville',
        tarifBase: 20,
        couleur: '#e74c3c',
        isActive: true
      },
      {
        id: 'zone-b',
        code: 'B',
        name: 'Zone B',
        description: 'Zone urbaine moyenne - Quartiers résidentiels',
        tarifBase: 15,
        couleur: '#f39c12',
        isActive: true
      },
      {
        id: 'zone-c',
        code: 'C',
        name: 'Zone C',
        description: 'Zone urbaine périphérique',
        tarifBase: 10,
        couleur: '#f1c40f',
        isActive: true
      },
      {
        id: 'zone-d',
        code: 'D',
        name: 'Zone D',
        description: 'Zone rurale urbanisable',
        tarifBase: 5,
        couleur: '#2ecc71',
        isActive: true
      },
      {
        id: 'zone-e',
        code: 'E',
        name: 'Zone E',
        description: 'Zone agricole',
        tarifBase: 2,
        couleur: '#27ae60',
        isActive: true
      }
    ],
    exemptions: [
      {
        id: 'exemption-petite',
        type: 'surface',
        name: 'Petite parcelle',
        description: 'Exemption 3 ans pour parcelles ≤ 100 m²',
        dureeAnnees: 3,
        conditions: [
          { field: 'surfaceImposable', operator: 'lte', value: 100 }
        ],
        isActive: true
      },
      {
        id: 'exemption-moyenne',
        type: 'surface',
        name: 'Parcelle moyenne',
        description: 'Exemption 5 ans pour parcelles 100-500 m²',
        dureeAnnees: 5,
        conditions: [
          { field: 'surfaceImposable', operator: 'between', value: 100, value2: 500 }
        ],
        isActive: true
      },
      {
        id: 'exemption-grande',
        type: 'surface',
        name: 'Grande parcelle',
        description: 'Exemption 7 ans pour parcelles > 500 m²',
        dureeAnnees: 7,
        conditions: [
          { field: 'surfaceImposable', operator: 'gt', value: 500 }
        ],
        isActive: true
      },
      {
        id: 'exemption-domanial',
        type: 'statut',
        name: 'Domaine public',
        description: 'Exemption permanente pour le domaine public',
        dureeAnnees: 999,
        conditions: [
          { field: 'statutFoncier', operator: 'eq', value: 'Domanial' }
        ],
        isActive: true
      }
    ],
    tarifs: [
      { id: 't1', zone: 'A', annee: 2025, tarifParM2: 20, dateApplication: new Date('2025-01-01'), isActive: true },
      { id: 't2', zone: 'B', annee: 2025, tarifParM2: 15, dateApplication: new Date('2025-01-01'), isActive: true },
      { id: 't3', zone: 'C', annee: 2025, tarifParM2: 10, dateApplication: new Date('2025-01-01'), isActive: true },
      { id: 't4', zone: 'D', annee: 2025, tarifParM2: 5, dateApplication: new Date('2025-01-01'), isActive: true },
      { id: 't5', zone: 'E', annee: 2025, tarifParM2: 2, dateApplication: new Date('2025-01-01'), isActive: true }
    ],
    calculations: {
      arrondi: {
        enabled: true,
        decimales: 2,
        methode: 'round'
      },
      seuils: {
        surfaceMinimale: 1, // m²
        montantMinimal: 0.1 // DH
      },
      quotePart: {
        precision: 4, // 4 décimales
        toleranceErreur: 0.0001 // Tolérance pour la somme des quote-parts
      }
    }
  };