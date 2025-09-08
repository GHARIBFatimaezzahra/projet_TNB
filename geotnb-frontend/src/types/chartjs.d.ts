/* =====================================================
   CHART.JS TYPES - DÉCLARATIONS TYPESCRIPT
   ===================================================== */

declare module 'chart.js' {
  export interface ChartConfiguration {
    type: string;
    data: ChartData;
    options?: ChartOptions;
  }

  export interface ChartData {
    labels?: string[];
    datasets: ChartDataset[];
  }

  export interface ChartDataset {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    tension?: number;
    fill?: boolean;
  }

  export interface ChartOptions {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      legend?: {
        position?: string;
        labels?: {
          padding?: number;
          usePointStyle?: boolean;
        };
      };
    };
    scales?: {
      y?: {
        beginAtZero?: boolean;
        title?: {
          display?: boolean;
          text?: string;
        };
      };
    };
  }

  export class Chart {
    constructor(ctx: CanvasRenderingContext2D, config: ChartConfiguration);
    destroy(): void;
    update(): void;
  }
}

declare global {
  interface Window {
    Chart: typeof import('chart.js').Chart;
  }
}

