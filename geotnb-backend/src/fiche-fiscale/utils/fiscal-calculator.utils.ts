export class FiscalCalculatorUtils {
  /**
   * Calcule le montant TNB selon la surface et le tarif
   */
  static calculateMontantTnb(surface: number, tarifUnitaire: number): number {
    if (surface <= 0 || tarifUnitaire < 0) return 0;
    return Math.round(surface * tarifUnitaire * 100) / 100; // Arrondi à 2 décimales
  }

  /**
   * Calcule le montant individuel selon la quote-part
   */
  static calculateMontantIndividuel(montantTotal: number, quotePart: number): number {
    if (montantTotal <= 0 || quotePart <= 0) return 0;
    return Math.round(montantTotal * quotePart * 100) / 100;
  }

  /**
   * Détermine si une parcelle est exonérée selon les règles TNB
   */
  static isExoneree(datePermis: Date, dureeExoneration: number): boolean {
    if (!datePermis || !dureeExoneration) return false;
    
    const dateExpiration = new Date(datePermis);
    dateExpiration.setFullYear(dateExpiration.getFullYear() + dureeExoneration);
    
    return new Date() < dateExpiration;
  }

  /**
   * Calcule la date limite de paiement (31 décembre de l'année)
   */
  static calculateDateLimitePayment(annee: number): Date {
    return new Date(annee, 11, 31); // 31 décembre
  }

  /**
   * Calcule les pénalités de retard
   */
  static calculatePenalitesRetard(montant: number, joursRetard: number, tauxPenalite: number = 0.02): number {
    if (joursRetard <= 0) return 0;
    const moisRetard = Math.ceil(joursRetard / 30);
    return Math.round(montant * tauxPenalite * moisRetard * 100) / 100;
  }
}