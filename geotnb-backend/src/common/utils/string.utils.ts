export class StringUtils {
    /**
     * Normalise un nom (supprime accents, met en forme)
     */
    static normalizeName(name: string): string {
      return name
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }
  
    /**
     * Génère un code unique pour les fiches fiscales
     */
    static generateFicheCode(parcelleId: number, proprietaireId: number, annee: number): string {
      const timestamp = Date.now().toString(36);
      return `TNB-${annee}-${parcelleId}-${proprietaireId}-${timestamp}`.toUpperCase();
    }
  
    /**
     * Nettoie une référence foncière
     */
    static cleanReferenceFonciere(ref: string): string {
      return ref
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .replace(/[\/\-]+/g, '/');
    }
  
    /**
     * Formate un nom complet
     */
    static formatFullName(nom: string, prenom?: string): string {
      if (!prenom) return nom.trim();
      return `${prenom.trim()} ${nom.trim()}`;
    }
  
    /**
     * Génère un slug à partir d'un texte
     */
    static slugify(text: string): string {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  
    /**
     * Masque partiellement un numéro sensible
     */
    static maskSensitiveNumber(number: string, visibleChars: number = 4): string {
      if (number.length <= visibleChars) return number;
      const masked = '*'.repeat(number.length - visibleChars);
      return number.slice(0, visibleChars) + masked;
    }
  }
  