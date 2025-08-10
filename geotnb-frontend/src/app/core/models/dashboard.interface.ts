export interface DashboardStats {
  totalParcelles: number;
  parcellesImposables: number;
  surfaceTotale: number;
  surfaceImposable: number;
  montantTotalTNB: number;
  tauxAssujettissement: number;
}

export interface ChartData {
  labels: string[];
  datasets: any[];
}