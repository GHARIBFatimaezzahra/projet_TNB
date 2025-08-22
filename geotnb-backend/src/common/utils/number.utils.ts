export class NumberUtils {
    /**
     * Formate un nombre en dirhams marocains
     */
    static formatCurrency(amount: number): string {
      return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2
      }).format(amount);
    }
  
    /**
     * Formate une surface en m²
     */
    static formatSurface(surface: number): string {
      return `${surface.toLocaleString('fr-FR')} m²`;
    }
  
    /**
     * Formate un pourcentage
     */
    static formatPercentage(value: number, decimals: number = 1): string {
      return `${value.toFixed(decimals)}%`;
    }
  
    /**
     * Arrondit un nombre à N décimales
     */
    static roundTo(num: number, decimals: number): number {
      return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
  
    /**
     * Calcule un montant TNB
     */
    static calculateTNB(surface: number, tarifUnitaire: number, quotePart: number = 1): number {
      return this.roundTo(surface * tarifUnitaire * quotePart, 2);
    }
  
    /**
     * Vérifie si un nombre est dans une plage valide
     */
    static isInRange(value: number, min: number, max: number): boolean {
      return value >= min && value <= max;
    }
  }