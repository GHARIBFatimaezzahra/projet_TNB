import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, BehaviorSubject } from 'rxjs';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  showIcon?: boolean;
}

export interface NotificationOptions extends MatSnackBarConfig {
  showAction?: boolean;
  actionText?: string;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationHistory = new BehaviorSubject<NotificationItem[]>([]);
  public notificationHistory$ = this.notificationHistory.asObservable();
  
  private defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'top'
  };

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  // Notification de succès
  success(message: string, options?: NotificationOptions): void {
    this.showSuccess(message, options);
  }

  showSuccess(message: string, options?: NotificationOptions): void {
    const config = this.buildConfig('success', options);
    const snackBarRef = this.snackBar.open(message, options?.actionText || 'Fermer', config);
    
    this.addToHistory('success', message);
    
    if (options?.showAction && options.actionText) {
      snackBarRef.onAction().subscribe(() => {
        // Action personnalisée si nécessaire
      });
    }
  }

  // Notification d'erreur
  error(message: string, options?: NotificationOptions): void {
    this.showError(message, options);
  }

  showError(message: string, options?: NotificationOptions): void {
    const config = this.buildConfig('error', options);
    config.duration = options?.persistent ? 0 : (options?.duration || 10000);
    
    const snackBarRef = this.snackBar.open(message, options?.actionText || 'Fermer', config);
    this.addToHistory('error', message);
  }

  // Notification d'information
  info(message: string, options?: NotificationOptions): void {
    this.showInfo(message, options);
  }

  showInfo(message: string, options?: NotificationOptions): void {
    const config = this.buildConfig('info', options);
    const snackBarRef = this.snackBar.open(message, options?.actionText || 'Fermer', config);
    this.addToHistory('info', message);
  }

  // Notification d'avertissement
  warning(message: string, options?: NotificationOptions): void {
    this.showWarning(message, options);
  }

  showWarning(message: string, options?: NotificationOptions): void {
    const config = this.buildConfig('warning', options);
    const snackBarRef = this.snackBar.open(message, options?.actionText || 'Fermer', config);
    this.addToHistory('warning', message);
  }

  // Notification de chargement
  showLoading(message: string = 'Chargement...'): MatSnackBarRef<any> {
    const config = {
      ...this.defaultConfig,
      duration: 0, // Persistent jusqu'à dismissal manuel
      panelClass: ['notification-loading']
    };
    
    return this.snackBar.open(message, '', config);
  }

  // Notification de progression
  showProgress(message: string, progress: number): MatSnackBarRef<any> {
    const progressMessage = `${message} (${Math.round(progress)}%)`;
    const config = {
      ...this.defaultConfig,
      duration: 0,
      panelClass: ['notification-progress']
    };
    
    return this.snackBar.open(progressMessage, '', config);
  }

  // Dialogue de confirmation
  confirm(data: ConfirmationDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      maxWidth: '90vw',
      data: {
        title: data.title,
        message: data.message,
        confirmText: data.confirmText || 'Confirmer',
        cancelText: data.cancelText || 'Annuler',
        type: data.type || 'info',
        showIcon: data.showIcon !== false
      },
      disableClose: true,
      autoFocus: false
    });

    return dialogRef.afterClosed();
  }

  // Dialogue d'alerte simple
  alert(title: string, message: string, type: 'info' | 'warning' | 'danger' = 'info'): Observable<void> {
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      width: '350px',
      maxWidth: '90vw',
      data: { title, message, type },
      autoFocus: false
    });

    return dialogRef.afterClosed();
  }

  // Notification avec action personnalisée
  showWithAction(
    message: string, 
    actionText: string, 
    actionCallback: () => void,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ): void {
    const config = this.buildConfig(type);
    const snackBarRef = this.snackBar.open(message, actionText, config);
    
    snackBarRef.onAction().subscribe(() => {
      actionCallback();
    });
    
    this.addToHistory(type, message);
  }

  // Fermer toutes les notifications
  dismissAll(): void {
    this.snackBar.dismiss();
  }

  // Toast notifications (aliases pour compatibilité)
  toast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    switch (type) {
      case 'success': this.success(message); break;
      case 'error': this.error(message); break;
      case 'warning': this.warning(message); break;
      default: this.info(message); break;
    }
  }

  // Construire la configuration
  private buildConfig(type: string, options?: NotificationOptions): MatSnackBarConfig {
    return {
      ...this.defaultConfig,
      ...options,
      panelClass: [`notification-${type}`, ...(options?.panelClass || [])]
    };
  }

  // Ajouter à l'historique
  private addToHistory(type: string, message: string): void {
    const currentHistory = this.notificationHistory.value;
    const newItem: NotificationItem = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      read: false
    };
    
    const updatedHistory = [newItem, ...currentHistory].slice(0, 50); // Garder seulement 50 notifications
    this.notificationHistory.next(updatedHistory);
  }

  // Marquer comme lu
  markAsRead(notificationId: string): void {
    const currentHistory = this.notificationHistory.value;
    const updatedHistory = currentHistory.map(item => 
      item.id === notificationId ? { ...item, read: true } : item
    );
    this.notificationHistory.next(updatedHistory);
  }

  // Marquer tout comme lu
  markAllAsRead(): void {
    const currentHistory = this.notificationHistory.value;
    const updatedHistory = currentHistory.map(item => ({ ...item, read: true }));
    this.notificationHistory.next(updatedHistory);
  }

  // Effacer l'historique
  clearHistory(): void {
    this.notificationHistory.next([]);
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount(): number {
    return this.notificationHistory.value.filter(item => !item.read).length;
  }
}

// Interface pour l'historique des notifications
interface NotificationItem {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Composant de dialogue de confirmation
@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirmation-dialog" [ngClass]="'dialog-' + data.type">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      
      <mat-dialog-content>
        <div class="dialog-content">
          <div *ngIf="data.showIcon" class="dialog-icon" [ngClass]="'icon-' + data.type">
            <mat-icon *ngIf="data.type === 'info'">info</mat-icon>
            <mat-icon *ngIf="data.type === 'warning'">warning</mat-icon>
            <mat-icon *ngIf="data.type === 'danger'">error</mat-icon>
          </div>
          <p class="dialog-message">{{ data.message }}</p>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText }}
        </button>
        <button 
          mat-raised-button 
          [color]="getButtonColor()"
          (click)="onConfirm()">
          {{ data.confirmText }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      max-width: 500px;
    }
    
    .dialog-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    
    .dialog-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .dialog-icon mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
    }
    
    .icon-info mat-icon { color: #2196f3; }
    .icon-warning mat-icon { color: #ff9800; }
    .icon-danger mat-icon { color: #f44336; }
    
    .dialog-message {
      margin: 0;
      flex: 1;
    }
    
    mat-dialog-actions {
      gap: 8px;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData & { type: string; showIcon: boolean }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'danger': return 'warn';
      case 'warning': return 'accent';
      default: return 'primary';
    }
  }
}

// Composant de dialogue d'alerte
@Component({
  selector: 'app-alert-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <div class="alert-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-raised-button color="primary" (click)="close()">OK</button>
      </mat-dialog-actions>
    </div>
  `
})
export class AlertDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; type: string }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}