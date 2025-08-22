export class StatisticsUtils {
    /**
     * Calcule le pourcentage de variation entre deux valeurs
     */
    static calculateVariation(current: number, previous: number): number {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    }
  
    /**
     * Calcule la moyenne d'un tableau de nombres
     */
    static calculateAverage(values: number[]): number {
      if (values.length === 0) return 0;
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    }
  
    /**
     * Formate un nombre en monnaie (DH)
     */
    static formatCurrency(amount: number): string {
      return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2
      }).format(amount);
    }
  
    /**
     * Formate une surface en m² ou hectares
     */
    static formatSurface(surface: number): string {
      if (surface >= 10000) {
        return `${(surface / 10000).toFixed(2)} ha`;
      }
      return `${surface.toFixed(2)} m²`;
    }
  
    /**
     * Calcule le taux de croissance annuel
     */
    static calculateGrowthRate(values: number[]): number {
      if (values.length < 2) return 0;
      const first = values[0];
      const last = values[values.length - 1];
      const years = values.length - 1;
      return Math.round((Math.pow(last / first, 1 / years) - 1) * 100);
    }
  
    /**
     * Génère des couleurs pour les graphiques
     */
    static generateColors(count: number): string[] {
      const baseColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
      ];
      
      const colors = [];
      for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
      }
      return colors;
    }
  }