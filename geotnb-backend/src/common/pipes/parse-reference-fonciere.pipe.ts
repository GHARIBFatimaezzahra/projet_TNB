import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseReferenceFoncierePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('Référence foncière requise');
    }

    // Nettoyer et normaliser la référence
    const cleaned = value.trim().toUpperCase();
    
    // Valider le format de référence foncière marocaine
    if (!this.isValidReferenceFonciere(cleaned)) {
      throw new BadRequestException(
        'Format de référence foncière invalide. ' +
        'Formats acceptés: TF123456/78, R456/12, NI789/34'
      );
    }

    return cleaned;
  }

  private isValidReferenceFonciere(ref: string): boolean {
    // Formats acceptés pour les références foncières marocaines:
    // TF123456/78 - Titre Foncier
    // R456/12 - Réquisition
    // NI789/34 - Non Immatriculé
    // DOMANIAL123 - Domaine public/privé de l'État
    
    const patterns = [
      /^TF\d{4,8}\/\d{1,4}$/,        // TF + 4-8 chiffres + / + 1-4 chiffres
      /^R\d{1,6}\/\d{1,4}$/,         // R + 1-6 chiffres + / + 1-4 chiffres  
      /^NI\d{1,6}\/\d{1,4}$/,        // NI + 1-6 chiffres + / + 1-4 chiffres
      /^DOMANIAL\d{1,8}$/,           // DOMANIAL + 1-8 chiffres
      /^COLLECTIF\d{1,8}$/,          // COLLECTIF + 1-8 chiffres
    ];

    return patterns.some(pattern => pattern.test(ref));
  }
}