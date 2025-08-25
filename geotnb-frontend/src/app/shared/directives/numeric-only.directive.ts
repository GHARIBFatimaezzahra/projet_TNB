import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appNumericOnly]',
  standalone: true
})
export class NumericOnlyDirective {
  @Input() appNumericOnly: 'integer' | 'decimal' = 'decimal';
  @Input() allowNegative = false;
  @Input() maxDecimals = 2;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const input = this.el.nativeElement;
    const key = event.key;
    
    // Autoriser les touches de contrôle
    if (this.isControlKey(key)) {
      return;
    }

    // Autoriser les chiffres
    if (this.isDigit(key)) {
      // Vérifier la limite de décimales si applicable
      if (this.appNumericOnly === 'decimal' && this.hasDecimalPart(input.value) && this.getDecimalLength(input.value) >= this.maxDecimals) {
        const cursorPos = input.selectionStart || 0;
        const decimalPos = input.value.indexOf('.');
        if (cursorPos > decimalPos) {
          event.preventDefault();
          return;
        }
      }
      return;
    }

    // Autoriser le point décimal si mode décimal
    if (key === '.' && this.appNumericOnly === 'decimal' && !this.hasDecimalPart(input.value)) {
      return;
    }

    // Autoriser le signe négatif si autorisé
    if (key === '-' && this.allowNegative && input.selectionStart === 0 && !input.value.includes('-')) {
      return;
    }

    // Bloquer tous les autres caractères
    event.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const pasteData = event.clipboardData?.getData('text/plain');
    if (!pasteData) return;

    if (!this.isValidNumber(pasteData)) {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Nettoyer la valeur si nécessaire
    const cleanedValue = this.cleanValue(value);
    if (cleanedValue !== value) {
      input.value = cleanedValue;
    }
  }

  private isControlKey(key: string): boolean {
    const controlKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Copy', 'Paste', 'Cut', 'Undo', 'Redo'
    ];
    
    return controlKeys.includes(key) || key.startsWith('F');
  }

  private isDigit(key: string): boolean {
    return /^\d$/.test(key);
  }

  private hasDecimalPart(value: string): boolean {
    return value.includes('.');
  }

  private getDecimalLength(value: string): number {
    const parts = value.split('.');
    return parts.length > 1 ? parts[1].length : 0;
  }

  private isValidNumber(value: string): boolean {
    const regex = this.appNumericOnly === 'integer' 
      ? (this.allowNegative ? /^-?\d+$/ : /^\d+$/)
      : (this.allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/);
    
    return regex.test(value);
  }

  private cleanValue(value: string): string {
    // Supprimer les caractères non autorisés
    let cleaned = value.replace(/[^\d.-]/g, '');
    
    // Gérer les signes négatifs multiples
    if (this.allowNegative) {
      const negativeSigns = cleaned.match(/-/g);
      if (negativeSigns && negativeSigns.length > 1) {
        cleaned = cleaned.charAt(0) === '-' ? '-' + cleaned.replace(/-/g, '') : cleaned.replace(/-/g, '');
      }
    } else {
      cleaned = cleaned.replace(/-/g, '');
    }

    // Gérer les points décimaux multiples
    if (this.appNumericOnly === 'decimal') {
      const decimalPoints = cleaned.match(/\./g);
      if (decimalPoints && decimalPoints.length > 1) {
        const firstDotIndex = cleaned.indexOf('.');
        cleaned = cleaned.substring(0, firstDotIndex + 1) + cleaned.substring(firstDotIndex + 1).replace(/\./g, '');
      }
      
      // Limiter les décimales
      const parts = cleaned.split('.');
      if (parts.length === 2 && parts[1].length > this.maxDecimals) {
        parts[1] = parts[1].substring(0, this.maxDecimals);
        cleaned = parts.join('.');
      }
    } else {
      cleaned = cleaned.replace(/\./g, '');
    }

    return cleaned;
  }
}