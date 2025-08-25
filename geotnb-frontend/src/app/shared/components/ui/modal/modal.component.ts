import { Component, Input, Output, EventEmitter, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ModalConfig {
  width?: string;
  maxWidth?: string;
  height?: string;
  maxHeight?: string;
  disableClose?: boolean;
  hasBackdrop?: boolean;
  backdropClass?: string;
  panelClass?: string;
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="modal-container" [ngClass]="modalClass">
      <!-- Header -->
      <div class="modal-header" *ngIf="title || config.showCloseButton">
        <div class="modal-title">
          <mat-icon *ngIf="icon" class="title-icon">{{ icon }}</mat-icon>
          <h2 *ngIf="title">{{ title }}</h2>
        </div>
        
        <button *ngIf="config.showCloseButton" 
                mat-icon-button 
                class="close-button"
                (click)="onClose()"
                [disabled]="loading">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="modal-content" [class.loading]="loading">
        <div *ngIf="loading" class="loading-overlay">
          <mat-progress-spinner diameter="40" mode="indeterminate"></mat-progress-spinner>
          <span *ngIf="loadingMessage">{{ loadingMessage }}</span>
        </div>
        
        <ng-content></ng-content>
      </div>

      <!-- Footer -->
      <div class="modal-footer" *ngIf="showFooter">
        <ng-content select="[slot=footer]"></ng-content>
        
        <div class="default-buttons" *ngIf="showDefaultButtons">
          <button mat-button 
                  (click)="onCancel()" 
                  [disabled]="loading">
            {{ cancelText }}
          </button>
          <button mat-raised-button 
                  [color]="confirmColor"
                  (click)="onConfirm()" 
                  [disabled]="loading || confirmDisabled">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-container {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      min-width: 320px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #fafafa;
      min-height: 64px;
    }

    .modal-title {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      
      .title-icon {
        color: var(--mat-primary-500);
      }
      
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
        color: #333;
      }
    }

    .close-button {
      margin-right: -12px;
    }

    .modal-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      position: relative;
      
      &.loading {
        pointer-events: none;
      }
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.8);
      z-index: 10;
      gap: 16px;
      
      span {
        color: #666;
        font-size: 14px;
      }
    }

    .modal-footer {
      padding: 16px 24px 24px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .default-buttons {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .modal-large {
      width: 90vw;
      max-width: 1200px;
    }

    .modal-medium {
      width: 70vw;
      max-width: 800px;
    }

    .modal-small {
      width: 50vw;
      max-width: 400px;
    }

    .modal-fullscreen {
      width: 100vw;
      height: 100vh;
      max-width: 100vw;
      max-height: 100vh;
      border-radius: 0;
    }

    @media (max-width: 768px) {
      .modal-container {
        width: 100vw;
        max-width: 100vw;
        max-height: 100vh;
        border-radius: 0;
      }
      
      .modal-header,
      .modal-content,
      .modal-footer {
        padding: 16px;
      }
    }
  `]
})
export class ModalComponent {
  @Input() title?: string;
  @Input() icon?: string;
  @Input() loading = false;
  @Input() loadingMessage?: string;
  @Input() config: ModalConfig = {};
  @Input() showFooter = true;
  @Input() showDefaultButtons = true;
  @Input() confirmText = 'Confirmer';
  @Input() cancelText = 'Annuler';
  @Input() confirmColor: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() confirmDisabled = false;
  @Input() size: 'small' | 'medium' | 'large' | 'fullscreen' = 'medium';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>
  ) {
    this.config = {
      showCloseButton: true,
      disableClose: false,
      hasBackdrop: true,
      closeOnEscape: true,
      ...this.config
    };
  }

  get modalClass(): string {
    return `modal-${this.size}`;
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
    this.dialogRef.close(false);
  }

  onClose(): void {
    this.close.emit();
    this.dialogRef.close();
  }
}