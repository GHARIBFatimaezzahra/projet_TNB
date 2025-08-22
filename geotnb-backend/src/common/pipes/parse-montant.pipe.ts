import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseMontantPipe implements PipeTransform {
  transform(value: any): number {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = parseFloat(value.toString());
    
    if (isNaN(parsed)) {
      throw new BadRequestException('Montant doit être un nombre');
    }

    if (parsed < 0) {
      throw new BadRequestException('Montant ne peut pas être négatif');
    }

    // Limiter le montant maximum à 10,000,000 DH
    if (parsed > 10000000) {
      throw new BadRequestException('Montant trop important (max: 10,000,000 DH)');
    }

    // Arrondir à 2 décimales (centimes)
    return Math.round(parsed * 100) / 100;
  }
}