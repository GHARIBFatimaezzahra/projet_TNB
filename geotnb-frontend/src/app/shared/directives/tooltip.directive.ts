import { Directive, Input, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective {
  @Input('appTooltip') tooltipText = '';
  @Input() placement: 'top' | 'bottom' | 'left' | 'right' = 'top';

  private tooltipElement: HTMLElement | null = null;

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    if (this.tooltipText) {
      this.createTooltip();
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.removeTooltip();
  }

  private createTooltip(): void {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = `tooltip tooltip-${this.placement}`;
    this.tooltipElement.textContent = this.tooltipText;
    this.tooltipElement.style.position = 'absolute';
    this.tooltipElement.style.background = 'rgba(0, 0, 0, 0.8)';
    this.tooltipElement.style.color = 'white';
    this.tooltipElement.style.padding = '0.5rem';
    this.tooltipElement.style.borderRadius = '4px';
    this.tooltipElement.style.fontSize = '0.8rem';
    this.tooltipElement.style.zIndex = '9999';
    this.tooltipElement.style.pointerEvents = 'none';
    
    document.body.appendChild(this.tooltipElement);
    
    const elementRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    
    switch (this.placement) {
      case 'top':
        top = elementRect.top - tooltipRect.height - 8;
        left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = elementRect.bottom + 8;
        left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.right + 8;
        break;
    }
    
    this.tooltipElement.style.top = `${top}px`;
    this.tooltipElement.style.left = `${left}px`;
  }

  private removeTooltip(): void {
    if (this.tooltipElement) {
      document.body.removeChild(this.tooltipElement);
      this.tooltipElement = null;
    }
  }
}