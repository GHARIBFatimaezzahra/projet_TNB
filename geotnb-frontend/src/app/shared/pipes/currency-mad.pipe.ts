import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyMad',
  standalone: true
})
export class CurrencyMadPipe implements PipeTransform {
  transform(value: number | null | undefined, showSymbol: boolean = true, decimals: number = 2): string {
    if (value === null || value === undefined || isNaN(value)) {
      return showSymbol ? '0,00 DH' : '0,00';
    }
    
    const formatted = new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
    
    return showSymbol ? `${formatted} DH` : formatted;
  }
}