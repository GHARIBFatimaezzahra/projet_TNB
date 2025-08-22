import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseQuotePartPipe implements PipeTransform {
  transform(value: any): number {
    if (value === null || value === undefined) {
      throw new BadRequestException('Quote-part requise');
    }

    const parsed = parseFloat(value.toString());
    
    if (isNaN(parsed)) {
      throw new BadRequestException('Quote-part doit être un nombre');
    }

    // Valider que la quote-part est entre 0 et 1
    if (parsed <= 0 || parsed > 1) {
      throw new BadRequestException('Quote-part doit être comprise entre 0 et 1');
    }

    // Limiter à 6 décimales pour éviter les problèmes de précision
    return Math.round(parsed * 1000000) / 1000000;
  }
}