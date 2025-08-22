export class DateUtils {
    /**
     * Formate une date en format français
     */
    static formatFrench(date: Date): string {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    }
  
    /**
     * Formate une date avec heure
     */
    static formatDateTime(date: Date): string {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
  
    /**
     * Calcule la différence en jours entre deux dates
     */
    static daysBetween(date1: Date, date2: Date): number {
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  
    /**
     * Vérifie si une date d'exonération est encore valide
     */
    static isExonerationValid(datePermis: Date, dureeAnnees: number): boolean {
      const dateExpiration = new Date(datePermis);
      dateExpiration.setFullYear(dateExpiration.getFullYear() + dureeAnnees);
      return new Date() < dateExpiration;
    }
  
    /**
     * Calcule la date d'expiration d'une exonération
     */
    static calculateExonerationExpiry(datePermis: Date, dureeAnnees: number): Date {
      const dateExpiration = new Date(datePermis);
      dateExpiration.setFullYear(dateExpiration.getFullYear() + dureeAnnees);
      return dateExpiration;
    }
  
    /**
     * Retourne l'année fiscale courante
     */
    static getCurrentFiscalYear(): number {
      return new Date().getFullYear();
    }
  }