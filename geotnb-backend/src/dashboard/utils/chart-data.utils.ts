import { StatisticsUtils } from './statistics.utils';

export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }
  
  export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
  }
  
  export class ChartDataUtils {
    /**
     * Prépare les données pour un graphique en barres
     */
    static prepareBarChart(data: any[], labelField: string, valueField: string, label: string): ChartData {
      return {
        labels: data.map(item => item[labelField]),
        datasets: [{
          label,
          data: data.map(item => parseFloat(item[valueField]) || 0),
          backgroundColor: StatisticsUtils.generateColors(data.length)
        }]
      };
    }
  
    /**
     * Prépare les données pour un graphique en secteurs
     */
    static preparePieChart(data: any[], labelField: string, valueField: string): ChartData {
      return {
        labels: data.map(item => item[labelField]),
        datasets: [{
          label: 'Répartition',
          data: data.map(item => parseFloat(item[valueField]) || 0),
          backgroundColor: StatisticsUtils.generateColors(data.length)
        }]
      };
    }
  
    /**
     * Prépare les données pour un graphique linéaire
     */
    static prepareLineChart(data: any[], labelField: string, valueField: string, label: string): ChartData {
      return {
        labels: data.map(item => item[labelField]),
        datasets: [{
          label,
          data: data.map(item => parseFloat(item[valueField]) || 0),
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          fill: true
        }]
      };
    }
  
    /**
     * Prépare les données pour un graphique multi-séries
     */
    static prepareMultiSeriesChart(
      data: any[], 
      labelField: string, 
      series: { field: string; label: string; color?: string }[]
    ): ChartData {
      return {
        labels: data.map(item => item[labelField]),
        datasets: series.map((serie, index) => ({
          label: serie.label,
          data: data.map(item => parseFloat(item[serie.field]) || 0),
          borderColor: serie.color || StatisticsUtils.generateColors(series.length)[index],
          backgroundColor: serie.color || StatisticsUtils.generateColors(series.length)[index],
          fill: false
        }))
      };
    }
  }