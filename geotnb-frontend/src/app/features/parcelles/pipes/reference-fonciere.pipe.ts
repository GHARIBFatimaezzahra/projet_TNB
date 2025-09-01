// =====================================================
// PIPE FORMATAGE RÉFÉRENCE FONCIÈRE - TF/R/NI
// =====================================================

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'referenceFonciere',
  standalone: true
})
export class ReferenceFoncierePipe implements PipeTransform {

  /**
   * Formate une référence foncière selon les standards marocains
   * @param value - Référence foncière brute
   * @param format - Format de sortie ('standard', 'short', 'full')
   * @param separator - Séparateur (défaut: '-')
   */
  transform(
    value: string | null | undefined,
    format: 'standard' | 'short' | 'full' = 'standard',
    separator: string = '-'
  ): string {
    
    if (!value || typeof value !== 'string') {
      return '';
    }

    const cleanValue = value.trim().toUpperCase();
    
    // Parser la référence
    const parsed = this.parseReference(cleanValue);
    if (!parsed) {
      return value; // Retourner tel quel si non reconnu
    }

    switch (format) {
      case 'short':
        return `${parsed.type}${parsed.number}`;
        
      case 'full':
        return `${this.getTypeFullName(parsed.type)}${separator}${parsed.number}`;
        
      case 'standard':
      default:
        return `${parsed.type}${separator}${parsed.number}`;
    }
  }

  /**
   * Parse une référence foncière
   */
  private parseReference(reference: string): { type: string; number: string } | null {
    // Patterns possibles:
    // TF-123456, TF123456, R-123456, NI-123456, etc.
    const patterns = [
      /^(TF|R|NI|DOMANIAL|COLLECTIF)[-\s]*([0-9]+)$/i,
      /^([A-Z]{1,2})[-\s]*([0-9]+)$/,
    ];

    for (const pattern of patterns) {
      const match = reference.match(pattern);
      if (match) {
        return {
          type: match[1].toUpperCase(),
          number: match[2]
        };
      }
    }

    return null;
  }

  /**
   * Obtient le nom complet du type de référence
   */
  private getTypeFullName(type: string): string {
    const typeNames: { [key: string]: string } = {
      'TF': 'Titre Foncier',
      'R': 'Réquisition',
      'NI': 'Non Immatriculé',
      'DOMANIAL': 'Domaine de l\'État',
      'COLLECTIF': 'Terres Collectives'
    };

    return typeNames[type] || type;
  }
}

// Utilitaires pour références foncières
export class ReferenceFonciereUtils {
  
  /**
   * Valide le format d'une référence foncière
   */
  static isValid(reference: string): boolean {
    if (!reference || typeof reference !== 'string') {
      return false;
    }

    const cleanRef = reference.trim().toUpperCase();
    const patterns = [
      /^(TF|R|NI)[-\s]*[0-9]{6,8}$/,
      /^DOMANIAL[-\s]*[0-9]{4,6}$/,
      /^COLLECTIF[-\s]*[0-9]{4,6}$/,
    ];

    return patterns.some(pattern => pattern.test(cleanRef));
  }
  
  /**
   * Normalise une référence foncière
   */
  static normalize(reference: string, separator: string = '-'): string {
    if (!reference) return '';
    
    const pipe = new ReferenceFoncierePipe();
    return pipe.transform(reference, 'standard', separator);
  }
  
  /**
   * Extrait le type de référence
   */
  static getType(reference: string): string | null {
    if (!reference) return null;
    
    const cleanRef = reference.trim().toUpperCase();
    const match = cleanRef.match(/^([A-Z]+)/);
    
    return match ? match[1] : null;
  }
  
  /**
   * Extrait le numéro de référence
   */
  static getNumber(reference: string): string | null {
    if (!reference) return null;
    
    const cleanRef = reference.trim().toUpperCase();
    const match = cleanRef.match(/([0-9]+)$/);
    
    return match ? match[1] : null;
  }
  
  /**
   * Génère une référence foncière
   */
  static generate(type: 'TF' | 'R' | 'NI' | 'DOMANIAL' | 'COLLECTIF', number: number | string): string {
    const numStr = typeof number === 'string' ? number : number.toString().padStart(6, '0');
    return `${type}-${numStr}`;
  }
  
  /**
   * Compare deux références foncières
   */
  static compare(ref1: string, ref2: string): number {
    const normalized1 = ReferenceFonciereUtils.normalize(ref1);
    const normalized2 = ReferenceFonciereUtils.normalize(ref2);
    
    return normalized1.localeCompare(normalized2);
  }
  
  /**
   * Obtient la description du type de référence
   */
  static getTypeDescription(reference: string): string {
    const type = ReferenceFonciereUtils.getType(reference);
    if (!type) return '';
    
    const descriptions: { [key: string]: string } = {
      'TF': 'Propriété titrée définitive avec garanties juridiques complètes',
      'R': 'Procédure d\'immatriculation en cours, droits provisoires',
      'NI': 'Propriété non immatriculée, droits coutumiers ou traditionnels',
      'DOMANIAL': 'Propriété du domaine de l\'État, usage réglementé',
      'COLLECTIF': 'Terres collectives, gestion communautaire'
    };
    
    return descriptions[type] || '';
  }
  
  /**
   * Vérifie si une référence est unique dans une liste
   */
  static isUnique(reference: string, existingReferences: string[]): boolean {
    if (!reference) return false;
    
    const normalized = ReferenceFonciereUtils.normalize(reference);
    const normalizedExisting = existingReferences.map(ref => ReferenceFonciereUtils.normalize(ref));
    
    return !normalizedExisting.includes(normalized);
  }
  
  /**
   * Suggère une référence similaire en cas de conflit
   */
  static suggestAlternative(reference: string, existingReferences: string[]): string {
    const type = ReferenceFonciereUtils.getType(reference);
    const number = ReferenceFonciereUtils.getNumber(reference);
    
    if (!type || !number) return reference;
    
    let counter = 1;
    let suggestion: string;
    
    do {
      const newNumber = (parseInt(number) + counter).toString().padStart(number.length, '0');
      suggestion = ReferenceFonciereUtils.generate(type as any, newNumber);
      counter++;
    } while (!ReferenceFonciereUtils.isUnique(suggestion, existingReferences) && counter < 100);
    
    return suggestion;
  }
  
  /**
   * Formate pour l'affichage dans une liste
   */
  static formatForList(reference: string, maxLength: number = 15): string {
    const normalized = ReferenceFonciereUtils.normalize(reference);
    
    if (normalized.length <= maxLength) {
      return normalized;
    }
    
    return normalized.substring(0, maxLength - 3) + '...';
  }
  
  /**
   * Valide et nettoie une référence saisie par l'utilisateur
   */
  static sanitize(input: string): string {
    if (!input) return '';
    
    // Supprimer caractères non autorisés
    const cleaned = input.replace(/[^A-Za-z0-9\-\s]/g, '');
    
    // Normaliser
    return ReferenceFonciereUtils.normalize(cleaned);
  }
}