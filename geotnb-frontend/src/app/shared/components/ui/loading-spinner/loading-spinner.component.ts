import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatProgressBarModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent {
  @Input() type: 'spinner' | 'bar' | 'dots' = 'spinner';
  @Input() mode: 'determinate' | 'indeterminate' | 'buffer' | 'query' = 'indeterminate';
  @Input() message?: string;
  @Input() progress?: number;
  @Input() bufferValue?: number;
  @Input() size = 50;
  @Input() strokeWidth = 4;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() overlay = false;
  @Input() fullscreen = false;
  @Input() showPercent = false;


  getSpinnerMode(): 'determinate' | 'indeterminate' {
    // Convertir les modes de progress-bar en modes de progress-spinner
    if (this.mode === 'buffer' || this.mode === 'query') {
      return 'indeterminate';
    }
    return this.mode as 'determinate' | 'indeterminate';
  }

  get containerClass(): string {
    return [
      this.overlay ? 'overlay' : '',
      this.fullscreen ? 'fullscreen' : ''
    ].filter(cls => cls).join(' ');
  }
}