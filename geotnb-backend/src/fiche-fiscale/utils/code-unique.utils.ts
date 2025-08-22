export class CodeUniqueUtils {
  /**
   * Génère un code unique pour une fiche fiscale
   * Format: TNB-ANNÉE-PARCELLE_ID-PROPRIETAIRE_ID-SEQUENCE
   */
  static generateCodeUnique(
    annee: number, 
    parcelleId: number, 
    proprietaireId: number, 
    sequence: number
  ): string {
    const sequenceStr = sequence.toString().padStart(4, '0');
    return `TNB-${annee}-${parcelleId}-${proprietaireId}-${sequenceStr}`;
  }

  /**
   * Parse un code unique pour extraire les informations
   */
  static parseCodeUnique(codeUnique: string): {
    annee: number;
    parcelleId: number;
    proprietaireId: number;
    sequence: number;
  } | null {
    const regex = /^TNB-(\d{4})-(\d+)-(\d+)-(\d{4})$/;
    const match = codeUnique.match(regex);
    
    if (!match) return null;
    
    return {
      annee: parseInt(match[1]),
      parcelleId: parseInt(match[2]),
      proprietaireId: parseInt(match[3]),
      sequence: parseInt(match[4])
    };
  }

  /**
   * Valide le format d'un code unique
   */
  static validateCodeUnique(codeUnique: string): boolean {
    return /^TNB-\d{4}-\d+-\d+-\d{4}$/.test(codeUnique);
  }
}