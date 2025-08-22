import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    if (!value) {
      throw new BadRequestException('Valeur requise');
    }

    const parsed = parseInt(value, 10);
    
    if (isNaN(parsed)) {
      throw new BadRequestException(`"${value}" n'est pas un nombre entier valide`);
    }

    return parsed;
  }
}