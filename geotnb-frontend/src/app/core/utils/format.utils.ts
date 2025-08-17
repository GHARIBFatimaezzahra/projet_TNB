export class FormatUtils {
    /**
     * Formate un montant en dirhams
     */
    static formatCurrency(amount: number, locale = 'fr-FR'): string {
      if (!Number.isFinite(amount)) return '0,00 DH';
      
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'MAD',
        currencyDisplay: 'code'
      }).format(amount).replace('MAD', 'DH');
    }
  
    /**
     * Formate un nombre avec séparateurs de milliers
     */
    static formatNumber(value: number, locale = 'fr-FR', decimals = 0): string {
      if (!Number.isFinite(value)) return '0';
      
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value);
    }
  
    /**
     * Formate une surface
     */
    static formatSurface(surface: number, locale = 'fr-FR'): string {
      if (!Number.isFinite(surface)) return '0 m²';
      
      if (surface < 10000) {
        return `${FormatUtils.formatNumber(surface, locale)} m²`;
      } else {
        const ha = surface / 10000;
        return `${FormatUtils.formatNumber(ha, locale, 2)} ha`;
      }
    }
  
    /**
     * Formate un pourcentage
     */
    static formatPercentage(value: number, locale = 'fr-FR', decimals = 1): string {
      if (!Number.isFinite(value)) return '0%';
      
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value);
    }
  
    /**
     * Formate une quote-part
     */
    static formatQuotePart(quotePart: number, locale = 'fr-FR'): string {
      if (!Number.isFinite(quotePart)) return '0%';
      
      return FormatUtils.formatPercentage(quotePart, locale, 2);
    }
  
    /**
     * Formate une taille de fichier
     */
    static formatFileSize(bytes: number, locale = 'fr-FR'): string {
      if (!Number.isFinite(bytes) || bytes === 0) return '0 B';
      
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      const k = 1024;
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return `${FormatUtils.formatNumber(bytes / Math.pow(k, i), locale, 1)} ${units[i]}`;
    }
  
    /**
     * Tronque un texte avec ellipses
     */
    static truncate(text: string, maxLength: number, suffix = '...'): string {
      if (!text || text.length <= maxLength) return text || '';
      
      return text.substring(0, maxLength - suffix.length) + suffix;
    }
  
    /**
     * Capitalise la première lettre
     */
    static capitalize(text: string): string {
      if (!text) return '';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
  
    /**
     * Convertit en title case
     */
    static titleCase(text: string): string {
      if (!text) return '';
      
      return text
        .toLowerCase()
        .split(' ')
        .map(word => FormatUtils.capitalize(word))
        .join(' ');
    }
  
    /**
     * Nettoie un texte pour l'utilisation dans une URL
     */
    static slugify(text: string): string {
      if (!text) return '';
      
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
        .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères non alphanumériques
        .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début/fin
    }
  
    /**
     * Masque un texte (pour les numéros sensibles)
     */
    static mask(text: string, visibleChars = 4, maskChar = '*'): string {
      if (!text || text.length <= visibleChars) return text;
      
      const visible = text.slice(-visibleChars);
      const masked = maskChar.repeat(text.length - visibleChars);
      
      return masked + visible;
    }
  
    /**
     * Formate une référence foncière pour l'affichage
     */
    static formatReferenceFonciere(reference: string): string {
      if (!reference) return '';
      
      // Format: TF123456/2024 -> TF 123456/2024
      const match = reference.match(/^([A-Z]+)([0-9]+\/[0-9]+)$/);
      if (match) {
        return `${match[1]} ${match[2]}`;
      }
      
      return reference;
    }
  }