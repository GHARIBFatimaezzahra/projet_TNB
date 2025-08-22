import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseCinPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return null;
    }

    // Nettoyer et normaliser le CIN
    const cleaned = value.trim().toUpperCase();
    
    // Valider le format CIN marocaine
    if (!this.isValidCin(cleaned)) {
      throw new BadRequestException(
        'Format CIN invalide. Format attendu: 1-2 lettres + 6-8 chiffres (ex: AB123456)'
      );
    }

    return cleaned;
  }

  private isValidCin(cin: string): boolean {
    // Format CIN marocaine: 1-2 lettres + 6-8 chiffres
    return /^[A-Z]{1,2}[0-9]{6,8}$/.test(cin);
  }
}