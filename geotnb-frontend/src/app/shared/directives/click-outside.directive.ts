// shared/directives/click-outside.directive.ts
import { Directive, ElementRef, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[clickOutside]'
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
  @Output() clickOutside = new EventEmitter<void>();
  
  private documentClickListener?: (event: Event) => void;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.documentClickListener = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!this.elementRef.nativeElement.contains(target)) {
        this.clickOutside.emit();
      }
    };

    setTimeout(() => {
      document.addEventListener('click', this.documentClickListener!);
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
    }
  }
}