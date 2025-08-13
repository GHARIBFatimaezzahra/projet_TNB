import { StatutFoncier } from './enums/statut-foncier.enum';

export interface DashboardStats {
  totalParcelles: number;
  parcellesImposables: number;
  parcellesExonerees: number;
  surfaceTotale: number;
  surfaceImposable: number;
  montantTotalTNB: number;
  montantCollecte: number;
  repartitionParZone: ZoneStats[];
  repartitionParStatut: StatutStats[];
  evolutionMensuelle: EvolutionMensuelle[];
}

export interface ZoneStats {
  zone: string;
  nombreParcelles: number;
  surfaceTotal: number;
  montantTNB: number;
}

export interface StatutStats {
  statut: StatutFoncier;
  nombreParcelles: number;
  pourcentage: number;
}

export interface EvolutionMensuelle {
  mois: string;
  nouvelles: number;
  modifiees: number;
  montantTNB: number;
}