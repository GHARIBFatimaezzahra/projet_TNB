import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-print-layout',
  standalone: true, // ✅ AJOUTEZ
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="print-layout">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .print-layout {
      padding: 1rem;
      background: white;
    }
    @media print {
      .print-layout {
        padding: 0;
      }
    }
  `]
})
export class PrintLayoutComponent { }
