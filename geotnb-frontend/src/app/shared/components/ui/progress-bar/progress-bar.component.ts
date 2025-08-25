// src/app/shared/components/ui/progress-bar/progress-bar.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { interval, Subject, takeUntil } from 'rxjs';

export interface ProgressStep {
  label: string;
  completed: boolean;
  active?: boolean;
  error?: boolean;
  description?: string;
  icon?: string;
}

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatIconModule],
  template: `
    <!-- Progress bar linéaire -->
    <div *ngIf="type === 'linear'" class="linear-progress" [ngClass]="progressClass">
      <div class="progress-header" *ngIf="showLabel || showPercent">
        <span *ngIf="showLabel" class="progress-label">{{ label }}</span>
        <span *ngIf="showPercent" class="progress-percent">{{ getPercentText() }}</span>
      </div>
      
      <mat-progress-bar 
        [mode]="mode"
        [value]="value" 
        [bufferValue]="bufferValue"
        [color]="color"
        class="progress-bar">
      </mat-progress-bar>
      
      <div class="progress-footer" *ngIf="showDetails">
        <span class="progress-details">{{ details }}</span>
        <span *ngIf="showTime && estimatedTime" class="estimated-time">
          Temps restant: {{ formatTime(estimatedTime) }}
        </span>
      </div>
    </div>

    <!-- Progress bar circulaire -->
    <div *ngIf="type === 'circular'" class="circular-progress" [ngClass]="progressClass">
      <div class="circular-container">
        <svg class="circular-svg" [attr.width]="size" [attr.height]="size">
          <!-- Background circle -->
          <circle 
            [attr.cx]="size / 2"
            [attr.cy]="size / 2" 
            [attr.r]="radius"
            class="background-circle"
            [style.stroke-width]="strokeWidth">
          </circle>
          
          <!-- Progress circle -->
          <circle 
            [attr.cx]="size / 2"
            [attr.cy]="size / 2"
            [attr.r]="radius"
            class="progress-circle"
            [style.stroke-width]="strokeWidth"
            [style.stroke-dasharray]="circumference"
            [style.stroke-dashoffset]="strokeDashoffset"
            [style.stroke]="getStrokeColor()">
          </circle>
        </svg>
        
        <div class="circular-content">
          <mat-icon *ngIf="icon" class="progress-icon">{{ icon }}</mat-icon>
          <span *ngIf="showPercent && !icon" class="circular-percent">{{ roundValue(value) }}%</span>
          <span *ngIf="showLabel" class="circular-label">{{ label }}</span>
        </div>
      </div>
      
      <div class="circular-details" *ngIf="showDetails">
        <span>{{ details }}</span>
      </div>
    </div>

    <!-- Progress par étapes -->
    <div *ngIf="type === 'steps'" class="steps-progress" [ngClass]="progressClass">
      <div class="steps-container">
        <div *ngFor="let step of steps; let i = index" 
             class="step-item"
             [class.completed]="step.completed"
             [class.active]="step.active"
             [class.error]="step.error">
          
          <div class="step-indicator">
            <div class="step-circle">
              <mat-icon *ngIf="step.completed && !step.error">check</mat-icon>
              <mat-icon *ngIf="step.error">close</mat-icon>
              <mat-icon *ngIf="step.icon && !step.completed && !step.error">{{ step.icon }}</mat-icon>
              <span *ngIf="!step.icon && !step.completed && !step.error">{{ i + 1 }}</span>
            </div>
            
            <div *ngIf="i < steps.length - 1" 
                 class="step-connector"
                 [class.completed]="step.completed">
            </div>
          </div>
          
          <div class="step-content">
            <div class="step-title">{{ step.label }}</div>
            <div *ngIf="step.description" class="step-description">{{ step.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress indéterminé avec animation -->
    <div *ngIf="type === 'animated'" class="animated-progress" [ngClass]="progressClass">
      <div class="animated-container">
        <div class="loading-dots">
          <div class="dot" [style.animation-delay]="'0ms'"></div>
          <div class="dot" [style.animation-delay]="'150ms'"></div>
          <div class="dot" [style.animation-delay]="'300ms'"></div>
        </div>
        
        <div class="animated-label" *ngIf="showLabel">
          {{ animatedText }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Progress linéaire */
    .linear-progress {
      width: 100%;
      
      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .progress-label {
          font-weight: 500;
          color: #333;
        }
        
        .progress-percent {
          font-weight: 600;
          color: var(--mat-primary-500);
          font-size: 14px;
        }
      }
      
      .progress-bar {
        border-radius: 8px;
        height: 8px;
        
        ::ng-deep .mat-progress-bar-fill::after {
          border-radius: 8px;
        }
        
        ::ng-deep .mat-progress-bar-buffer {
          border-radius: 8px;
        }
      }
      
      .progress-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
        font-size: 12px;
        color: #666;
        
        .estimated-time {
          color: #999;
        }
      }
    }

    /* Progress circulaire */
    .circular-progress {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .circular-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .circular-svg {
          transform: rotate(-90deg);
          
          .background-circle {
            fill: none;
            stroke: #e0e0e0;
          }
          
          .progress-circle {
            fill: none;
            transition: stroke-dashoffset 0.3s ease;
          }
        }
        
        .circular-content {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          
          .progress-icon {
            font-size: 24px;
            color: var(--mat-primary-500);
          }
          
          .circular-percent {
            font-size: 18px;
            font-weight: 600;
            color: #333;
          }
          
          .circular-label {
            font-size: 12px;
            color: #666;
            text-align: center;
            margin-top: 4px;
          }
        }
      }
      
      .circular-details {
        margin-top: 12px;
        font-size: 12px;
        color: #666;
        text-align: center;
      }
    }

    /* Progress par étapes */
    .steps-progress {
      width: 100%;
      
      .steps-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          
          &.completed {
            .step-circle {
              background-color: var(--mat-primary-500);
              color: white;
              border-color: var(--mat-primary-500);
            }
            
            .step-connector.completed {
              background-color: var(--mat-primary-500);
            }
          }
          
          &.active {
            .step-circle {
              border-color: var(--mat-primary-500);
              background-color: var(--mat-primary-50);
              color: var(--mat-primary-500);
              animation: pulse 2s infinite;
            }
          }
          
          &.error {
            .step-circle {
              background-color: var(--mat-warn-500);
              color: white;
              border-color: var(--mat-warn-500);
            }
          }
          
          .step-indicator {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            
            .step-circle {
              width: 32px;
              height: 32px;
              border: 2px solid #e0e0e0;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
              font-size: 14px;
              font-weight: 500;
              color: #666;
              z-index: 2;
              
              mat-icon {
                font-size: 16px;
                width: 16px;
                height: 16px;
              }
            }
            
            .step-connector {
              position: absolute;
              top: 32px;
              width: 2px;
              height: 40px;
              background-color: #e0e0e0;
              transition: background-color 0.3s ease;
            }
          }
          
          .step-content {
            flex: 1;
            padding-top: 4px;
            
            .step-title {
              font-weight: 500;
              color: #333;
              margin-bottom: 4px;
            }
            
            .step-description {
              font-size: 12px;
              color: #666;
              line-height: 1.4;
            }
          }
        }
      }
    }

    /* Progress animé */
    .animated-progress {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      
      .animated-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        
        .loading-dots {
          display: flex;
          gap: 8px;
          
          .dot {
            width: 8px;
            height: 8px;
            background-color: var(--mat-primary-500);
            border-radius: 50%;
            animation: bounce 1.4s ease-in-out infinite both;
          }
        }
        
        .animated-label {
          font-size: 14px;
          color: #666;
          text-align: center;
        }
      }
    }

    /* Animations */
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(63, 81, 181, 0.4);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(63, 81, 181, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(63, 81, 181, 0);
      }
    }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }

    /* Classes de style */
    .progress-small {
      .progress-bar {
        height: 4px;
      }
      
      .circular-svg {
        width: 48px !important;
        height: 48px !important;
      }
    }

    .progress-large {
      .progress-bar {
        height: 12px;
      }
      
      .circular-svg {
        width: 120px !important;
        height: 120px !important;
      }
    }

    .progress-success {
      .progress-bar {
        ::ng-deep .mat-progress-bar-fill::after {
          background-color: #4caf50;
        }
      }
    }

    .progress-warning {
      .progress-bar {
        ::ng-deep .mat-progress-bar-fill::after {
          background-color: #ff9800;
        }
      }
    }

    .progress-error {
      .progress-bar {
        ::ng-deep .mat-progress-bar-fill::after {
          background-color: #f44336;
        }
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .steps-progress .steps-container {
        gap: 16px;
        
        .step-item {
          gap: 12px;
          
          .step-indicator .step-circle {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }
          
          .step-content {
            .step-title {
              font-size: 14px;
            }
            
            .step-description {
              font-size: 11px;
            }
          }
        }
      }
    }
  `]
})
export class ProgressBarComponent implements OnInit, OnDestroy {
  @Input() type: 'linear' | 'circular' | 'steps' | 'animated' = 'linear';
  @Input() mode: 'determinate' | 'indeterminate' | 'buffer' | 'query' = 'determinate';
  @Input() value = 0;
  @Input() bufferValue = 0;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() label?: string;
  @Input() details?: string;
  @Input() showLabel = true;
  @Input() showPercent = true;
  @Input() showDetails = false;
  @Input() showTime = false;
  @Input() estimatedTime?: number; // en secondes
  @Input() size = 80; // pour le mode circulaire
  @Input() strokeWidth = 4;
  @Input() icon?: string;
  @Input() steps: ProgressStep[] = [];
  @Input() animated = false;
  @Input() theme: 'default' | 'success' | 'warning' | 'error' = 'default';
  @Input() sizeClass: 'small' | 'default' | 'large' = 'default';

  animatedText = '';
  private animatedTexts = [
    'Chargement en cours...',
    'Traitement des données...',
    'Finalisation...'
  ];
  private animatedIndex = 0;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.type === 'animated') {
      this.startTextAnimation();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Méthode pour arrondir les valeurs - CORRECTION de l'erreur Math
  roundValue(value: number): number {
    return Math.round(value);
  }

  get radius(): number {
    return (this.size - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get strokeDashoffset(): number {
    const progress = Math.max(0, Math.min(100, this.value));
    return this.circumference - (progress / 100) * this.circumference;
  }

  get progressClass(): string {
    const classes = [];
    
    if (this.theme !== 'default') {
      classes.push(`progress-${this.theme}`);
    }
    
    if (this.sizeClass !== 'default') {
      classes.push(`progress-${this.sizeClass}`);
    }
    
    return classes.join(' ');
  }

  getPercentText(): string {
    return `${this.roundValue(this.value)}%`;
  }

  getStrokeColor(): string {
    const colors = {
      primary: '#1976d2',
      accent: '#ff4081',
      warn: '#f44336'
    };
    return colors[this.color] || colors.primary;
  }

  formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return `${minutes}min ${Math.round(remainingSeconds)}s`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }

  private startTextAnimation(): void {
    this.animatedText = this.animatedTexts[0];
    
    interval(2000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.animatedIndex = (this.animatedIndex + 1) % this.animatedTexts.length;
      this.animatedText = this.animatedTexts[this.animatedIndex];
    });
  }

  // Méthodes publiques pour contrôler les étapes
  setStepCompleted(index: number): void {
    if (this.steps[index]) {
      this.steps[index].completed = true;
      this.steps[index].active = false;
      this.steps[index].error = false;
      
      // Activer la prochaine étape
      if (this.steps[index + 1]) {
        this.steps[index + 1].active = true;
      }
    }
  }

  setStepError(index: number, error?: string): void {
    if (this.steps[index]) {
      this.steps[index].error = true;
      this.steps[index].active = false;
      this.steps[index].completed = false;
      if (error) {
        this.steps[index].description = error;
      }
    }
  }

  setStepActive(index: number): void {
    // Désactiver toutes les étapes
    this.steps.forEach(step => step.active = false);
    
    // Activer l'étape spécifiée
    if (this.steps[index]) {
      this.steps[index].active = true;
    }
  }

  resetSteps(): void {
    this.steps.forEach((step, index) => {
      step.completed = false;
      step.error = false;
      step.active = index === 0;
    });
  }

  getCompletedStepsCount(): number {
    return this.steps.filter(step => step.completed).length;
  }

  getStepsProgress(): number {
    return this.steps.length > 0 ? (this.getCompletedStepsCount() / this.steps.length) * 100 : 0;
  }
}