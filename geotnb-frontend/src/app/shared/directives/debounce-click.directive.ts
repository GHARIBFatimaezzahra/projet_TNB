import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appDebounceClick]',
  standalone: true
})
export class DebounceClickDirective {
  @Input() debounceTime = 500; // millisecondes
  @Output() debounceClick = new EventEmitter<MouseEvent>();

  private lastClickTime = 0;

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const currentTime = Date.now();
    
    if (currentTime - this.lastClickTime >= this.debounceTime) {
      this.lastClickTime = currentTime;
      this.debounceClick.emit(event);
    } else {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}