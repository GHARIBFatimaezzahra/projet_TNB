import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseSurfacePipe implements PipeTransform {
  transform(value: any): number {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = parseFloat(value.toString());
    
    if (isNaN(parsed)) {
      throw new BadRequestException('Surface doit être un nombre');
    }

    if (parsed < 0) {
      throw new BadRequestException('Surface ne peut pas être négative');
    }

    // Limiter la surface maximale à 1,000,000 m² (100 hectares)
    if (parsed > 1000000) {
      throw new BadRequestException('Surface trop importante (max: 1,000,000 m²)');
    }

    // Arrondir à 2 décimales
    return Math.round(parsed * 100) / 100;
  }
}