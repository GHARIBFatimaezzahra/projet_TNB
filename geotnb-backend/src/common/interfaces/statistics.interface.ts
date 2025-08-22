export interface StatisticsBase {
    total: number;
    actifs?: number;
    inactifs?: number;
  }
  
  export interface ParcelleStatistics extends StatisticsBase {
    totalSurface: number;
    totalRevenue: number;
    byStatus: Array<{ status: string; count: number }>;
    byZone: Array<{
      zone: string;
      count: number;
      totalSurface: number;
      totalRevenue: number;
    }>;
  }
  
  export interface ProprietaireStatistics extends StatisticsBase {
    withContact: number;
    withoutCin: number;
    contactRate: number;
    missingCinRate: number;
    byNature: Array<{
      nature: string;
      count: number;
      percentage: number;
    }>;
  }