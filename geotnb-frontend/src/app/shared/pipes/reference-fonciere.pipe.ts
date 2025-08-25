import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'referenceFonciere',
  standalone: true
})
export class ReferenceFoncierePipe implements PipeTransform {
  transform(value: string | null | undefined, format: 'full' | 'short' = 'full'): string {
    if (!value) return '';

    // Nettoyer la référence
    const cleaned = value.toString().trim().replace(/\s+/g, ' ');
    
    if (format === 'short' && cleaned.length > 15) {
      return cleaned.substring(0, 12) + '...';
    }

    // Formatage spécial selon le type
    if (cleaned.startsWith('TF')) {
      return this.formatTitreFoncier(cleaned);
    } else if (cleaned.startsWith('R')) {
      return this.formatRequisition(cleaned);
    } else if (cleaned.startsWith('NI')) {
      return this.formatNonImmatricule(cleaned);
    }

    return cleaned;
  }

  private formatTitreFoncier(value: string): string {
    // Format: TF 123456/78
    const matches = value.match(/TF\s*(\d+)\/(\d+)/i);
    if (matches) {
      return `TF ${matches[1]}/${matches[2]}`;
    }
    return value;
  }

  private formatRequisition(value: string): string {
    // Format: R 1234/56
    const matches = value.match(/R\s*(\d+)\/(\d+)/i);
    if (matches) {
      return `R ${matches[1]}/${matches[2]}`;
    }
    return value;
  }

  private formatNonImmatricule(value: string): string {
    // Format: NI-Zone-Numéro
    return value.toUpperCase();
  }
}