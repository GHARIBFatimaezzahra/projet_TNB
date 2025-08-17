export class ValidationUtils {
    // Expressions régulières pour les validations
    static readonly CIN_PATTERN = /^[A-Z]{1,2}[0-9]{1,6}$/;
    static readonly RC_PATTERN = /^[0-9]{1,10}$/;
    static readonly PHONE_PATTERN = /^(\+212|0)[5-7][0-9]{8}$/;
    static readonly EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    static readonly REFERENCE_FONCIERE_PATTERN = /^(TF|R|NI)[0-9]+\/[0-9]+$/;
  
    /**
     * Valide un numéro CIN marocain
     */
    static validateCIN(cin: string): boolean {
      if (!cin) return false;
      return ValidationUtils.CIN_PATTERN.test(cin.toUpperCase().trim());
    }
  
    /**
     * Valide un numéro de registre de commerce
     */
    static validateRC(rc: string): boolean {
      if (!rc) return false;
      return ValidationUtils.RC_PATTERN.test(rc.trim());
    }
  
    /**
     * Valide un numéro de téléphone marocain
     */
    static validatePhone(phone: string): boolean {
      if (!phone) return false;
      const cleaned = phone.replace(/[\s\-\.]/g, '');
      return ValidationUtils.PHONE_PATTERN.test(cleaned);
    }
  
    /**
     * Valide une adresse email
     */
    static validateEmail(email: string): boolean {
      if (!email) return false;
      return ValidationUtils.EMAIL_PATTERN.test(email.trim().toLowerCase());
    }
  
    /**
     * Valide une référence foncière
     */
    static validateReferenceFonciere(reference: string): boolean {
      if (!reference) return false;
      return ValidationUtils.REFERENCE_FONCIERE_PATTERN.test(reference.toUpperCase().trim());
    }
  
    /**
     * Valide une surface (doit être positive)
     */
    static validateSurface(surface: number): boolean {
      return surface > 0 && Number.isFinite(surface);
    }
  
    /**
     * Valide un montant (doit être positif ou nul)
     */
    static validateMontant(montant: number): boolean {
      return montant >= 0 && Number.isFinite(montant);
    }
  
    /**
     * Valide une quote-part (entre 0 et 1)
     */
    static validateQuotePart(quotePart: number): boolean {
      return quotePart > 0 && quotePart <= 1 && Number.isFinite(quotePart);
    }
  
    /**
     * Valide des coordonnées géographiques
     */
    static validateCoordinates(x: number, y: number): boolean {
      // Pour le système Lambert Maroc Nord (EPSG:26191)
      // X: entre 100,000 et 1,000,000
      // Y: entre 100,000 et 1,000,000
      return (
        Number.isFinite(x) && Number.isFinite(y) &&
        x >= 100000 && x <= 1000000 &&
        y >= 100000 && y <= 1000000
      );
    }
  
    /**
     * Valide un mot de passe
     */
    static validatePassword(password: string): {
      isValid: boolean;
      errors: string[];
    } {
      const errors: string[] = [];
  
      if (!password) {
        errors.push('Le mot de passe est requis');
        return { isValid: false, errors };
      }
  
      if (password.length < 8) {
        errors.push('Le mot de passe doit contenir au moins 8 caractères');
      }
  
      if (!/[A-Z]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une majuscule');
      }
  
      if (!/[a-z]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une minuscule');
      }
  
      if (!/[0-9]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins un chiffre');
      }
  
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins un caractère spécial');
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    /**
     * Nettoie et formate une référence foncière
     */
    static formatReferenceFonciere(reference: string): string {
      if (!reference) return '';
      return reference.toUpperCase().trim().replace(/\s+/g, '');
    }
  
    /**
     * Nettoie et formate un numéro de téléphone
     */
    static formatPhoneNumber(phone: string): string {
      if (!phone) return '';
      let cleaned = phone.replace(/[\s\-\.]/g, '');
      
      // Ajouter +212 si nécessaire
      if (cleaned.startsWith('0')) {
        cleaned = '+212' + cleaned.substring(1);
      } else if (!cleaned.startsWith('+212')) {
        cleaned = '+212' + cleaned;
      }
      
      return cleaned;
    }
  
    /**
     * Valide une liste de quote-parts (la somme doit être égale à 1)
     */
    static validateQuotePartsSum(quoteParts: number[]): boolean {
      if (!quoteParts || quoteParts.length === 0) return false;
      
      const sum = quoteParts.reduce((total, part) => total + part, 0);
      return Math.abs(sum - 1) < 0.0001; // Tolérance pour les erreurs de précision
    }
  
    /**
     * Valide un fichier selon son type et sa taille
     */
    static validateFile(
      file: File,
      allowedTypes: string[],
      maxSizeMB: number
    ): { isValid: boolean; error?: string } {
      if (!file) {
        return { isValid: false, error: 'Aucun fichier sélectionné' };
      }
  
      // Vérifier l'extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !allowedTypes.includes(extension)) {
        return {
          isValid: false,
          error: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`
        };
      }
  
      // Vérifier la taille
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        return {
          isValid: false,
          error: `Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`
        };
      }
  
      return { isValid: true };
    }
  }