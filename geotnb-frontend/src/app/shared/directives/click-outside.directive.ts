import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Output() appClickOutside = new EventEmitter<MouseEvent>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    if (!target || !this.elementRef.nativeElement) {
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(target);
    
    if (!clickedInside) {
      this.appClickOutside.emit(event);
    }
  }

  @HostListener('document:touchstart', ['$event'])
  onDocumentTouchStart(event: TouchEvent): void {
    const target = event.target as HTMLElement;
    
    if (!target || !this.elementRef.nativeElement) {
      return;
    }

    const touchedInside = this.elementRef.nativeElement.contains(target);
    
    if (!touchedInside) {
      // Créer un événement MouseEvent à partir du TouchEvent
      const mouseEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: event.touches[0]?.clientX,
        clientY: event.touches[0]?.clientY
      });
      
      this.appClickOutside.emit(mouseEvent);
    }
  }
}
