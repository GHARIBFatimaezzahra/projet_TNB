import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showError(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Fermer', {
      duration,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  // Méthodes compatibles avec votre ancien code
  success(message: string, title?: string): void {
    this.showSuccess(message);
  }

  error(message: string, title?: string): void {
    this.showError(message);
  }

  warning(message: string, title?: string): void {
    this.showWarning(message);
  }

  info(message: string, title?: string): void {
    this.showInfo(message);
  }

  clear(): void {
    // MatSnackBar n'a pas de clear global, mais chaque snackbar se ferme automatiquement
  }
}