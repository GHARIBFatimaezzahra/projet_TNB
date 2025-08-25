import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements OnInit {
  @Input() appAutoFocus = true;
  @Input() delay = 0;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    if (!this.appAutoFocus) {
      return;
    }

    if (this.delay > 0) {
      setTimeout(() => {
        this.focus();
      }, this.delay);
    } else {
      // Utiliser requestAnimationFrame pour s'assurer que l'élément est rendu
      requestAnimationFrame(() => {
        this.focus();
      });
    }
  }

  private focus(): void {
    const element = this.elementRef.nativeElement;
    
    if (element && typeof element.focus === 'function') {
      element.focus();
      
      // Si c'est un input de type text, sélectionner tout le contenu
      if (element instanceof HTMLInputElement && (element.type === 'text' || element.type === 'email' || element.type === 'password')) {
        element.select();
      }
    }
  }
}