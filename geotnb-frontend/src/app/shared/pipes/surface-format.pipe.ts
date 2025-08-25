import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'surfaceFormat',
  standalone: true
})
export class SurfaceFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, unit: 'm2' | 'ha' = 'm2', precision: number = 2): string {
    if (value === null || value === undefined || isNaN(value)) {
      return unit === 'ha' ? '0,00 ha' : '0,00 m²';
    }

    if (value < 0) {
      return 'Surface invalide';
    }

    let displayValue = value;
    let displayUnit = 'm²';

    if (unit === 'ha') {
      displayValue = value / 10000; // Conversion m² vers hectares
      displayUnit = 'ha';
    } else if (value >= 10000) {
      // Auto-conversion vers hectares si > 1 ha
      displayValue = value / 10000;
      displayUnit = 'ha';
    }

    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(displayValue);

    return `${formatted} ${displayUnit}`;
  }
}
