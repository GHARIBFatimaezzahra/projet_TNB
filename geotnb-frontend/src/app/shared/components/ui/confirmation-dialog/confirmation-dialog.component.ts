import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  showIcon?: boolean;
  icon?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
  details?: string;
  showDetails?: boolean;
  allowHtml?: boolean;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {
    // Valeurs par défaut
    this.data = {
      type: 'info',
      showIcon: true,
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      confirmColor: 'primary',
      showDetails: false,
      allowHtml: false,
      ...this.data
    };
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  getDialogIcon(): string {
    if (this.data.icon) {
      return this.data.icon;
    }

    switch (this.data.type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'success':
        return 'check_circle';
      default:
        return 'help';
    }
  }

  getDialogClass(): string {
    return `dialog-${this.data.type}`;
  }

  getIconClass(): string {
    return `icon-${this.data.type}`;
  }

  getConfirmButtonColor(): 'primary' | 'accent' | 'warn' {
    if (this.data.confirmColor) {
      return this.data.confirmColor;
    }
    
    return this.data.type === 'danger' ? 'warn' : 'primary';
  }
}