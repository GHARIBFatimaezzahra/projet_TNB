export class ValidationUtils {
    /**
     * Valide un CIN marocain
     */
    static validateCIN(cin: string): boolean {
      if (!cin) return false;
      // Format: 1-2 lettres + 6-8 chiffres
      return /^[A-Z]{1,2}[0-9]{6,8}$/.test(cin.toUpperCase());
    }
  
    /**
     * Valide un numéro RC (Registre de Commerce)
     */
    static validateRC(rc: string): boolean {
      if (!rc) return false;
      // Format: chiffres uniquement
      return /^[0-9]+$/.test(rc);
    }
  
    /**
     * Valide un numéro de téléphone marocain
     */
    static validateMoroccanPhone(phone: string): boolean {
      if (!phone) return false;
      // Formats acceptés: +212XXXXXXXXX, 0XXXXXXXXX
      return /^(\+212|0)[5-7][0-9]{8}$/.test(phone);
    }
  
    /**
     * Valide une référence foncière marocaine
     */
    static validateReferenceFonciere(ref: string): boolean {
      if (!ref) return false;
      // Format: TF/R/NI + numéros + éventuellement secteur
      return /^(TF|R|NI)\s*\d+[\/\-]?\d*[A-Z]*$/i.test(ref);
    }
  
    /**
     * Valide un email
     */
    static validateEmail(email: string): boolean {
      if (!email) return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  
    /**
     * Valide qu'une somme de quotes-parts égale 1
     */
    static validateQuotePartsSum(quoteParts: number[], tolerance: number = 0.01): boolean {
      const sum = quoteParts.reduce((acc, val) => acc + val, 0);
      return Math.abs(sum - 1.0) <= tolerance;
    }
  }