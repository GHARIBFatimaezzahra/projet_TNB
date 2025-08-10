import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatSurface'
})
export class FormatSurfacePipe implements PipeTransform {
  transform(value: number, unit: string = 'm²'): string {
    if (!value && value !== 0) return '';
    
    return new Intl.NumberFormat('fr-MA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + ' ' + unit;
  }
}