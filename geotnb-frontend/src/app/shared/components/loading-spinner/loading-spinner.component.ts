import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="loading-spinner" [class.overlay]="overlay">
      <div class="spinner-circle" [style.width.px]="size" [style.height.px]="size"></div>
      <p *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.8);
      z-index: 9999;
    }
    .spinner-circle {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 
      0% { transform: rotate(0deg); } 
      100% { transform: rotate(360deg); } 
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size = 40;
  @Input() overlay = false;
  @Input() message = '';
  @Input() text = ''; // Alias pour message
  
  ngOnInit() {
    if (this.text && !this.message) {
      this.message = this.text;
    }
  }
}
