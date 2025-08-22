export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    data?: any;
  }
  
  export class DataValidationUtils {
    static validateParcelleData(data: any): ValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];
  
      // Validation référence foncière
      if (!data.reference_fonciere) {
        errors.push('Référence foncière manquante');
      } else if (!/^[A-Z0-9\/\-]+$/i.test(data.reference_fonciere)) {
        warnings.push('Format de référence foncière suspect');
      }
  
      // Validation surface
      if (data.surface_totale !== undefined) {
        const surface = parseFloat(data.surface_totale);
        if (isNaN(surface) || surface <= 0) {
          errors.push('Surface totale invalide');
        } else if (surface > 1000000) {
          warnings.push('Surface totale très élevée (>1M m²)');
        }
      }
  
      if (data.surface_imposable !== undefined) {
        const surfaceImp = parseFloat(data.surface_imposable);
        const surfaceTot = parseFloat(data.surface_totale);
        
        if (isNaN(surfaceImp) || surfaceImp < 0) {
          errors.push('Surface imposable invalide');
        } else if (!isNaN(surfaceTot) && surfaceImp > surfaceTot) {
          errors.push('Surface imposable supérieure à la surface totale');
        }
      }
  
      // Validation statut foncier
      if (data.statut_foncier && !['TF', 'R', 'NI', 'Domanial', 'Collectif'].includes(data.statut_foncier)) {
        warnings.push('Statut foncier non reconnu');
      }
  
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: errors.length === 0 ? data : undefined
      };
    }
  
    static validateProprietaireData(data: any): ValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];
  
      // Validation nom
      if (!data.nom || data.nom.trim().length < 2) {
        errors.push('Nom manquant ou trop court');
      }
  
      // Validation CIN/RC
      if (data.cin_ou_rc) {
        const nature = data.nature || 'Physique';
        if (nature === 'Physique' && !/^[A-Z]{1,2}[0-9]{6,8}$/i.test(data.cin_ou_rc)) {
          warnings.push('Format CIN suspect (attendu: 1-2 lettres + 6-8 chiffres)');
        } else if (nature === 'Morale' && !/^[0-9]+$/.test(data.cin_ou_rc)) {
          warnings.push('Format RC suspect (attendu: chiffres uniquement)');
        }
      }
  
      // Validation email
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        warnings.push('Format email invalide');
      }
  
      // Validation téléphone
      if (data.telephone && !/^(\+212|0)[5-7][0-9]{8}$/.test(data.telephone)) {
        warnings.push('Format téléphone marocain invalide');
      }
  
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: errors.length === 0 ? data : undefined
      };
    }
  }