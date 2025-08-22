export interface KpiData {
    label: string;
    value: number;
    previousValue?: number;
    change?: number;
    changePercent?: number;
    trend: 'up' | 'down' | 'stable';
    format: 'number' | 'currency' | 'percentage' | 'surface';
  }
  
  export interface ChartData {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
    }[];
  }
  
  export interface DashboardWidget {
    id: string;
    title: string;
    type: 'kpi' | 'chart' | 'table' | 'map';
    data: any;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }