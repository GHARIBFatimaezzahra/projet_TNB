import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ModalComponent, ModalConfig } from './modal.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../confirmation-dialog/confirmation-dialog.component';

export interface ModalData {
  title?: string;
  icon?: string;
  content?: any;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  
  constructor(private dialog: MatDialog) {}

  // Ouvrir une modale générique
  open<T = any>(component: any, config?: {
    data?: any;
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
    disableClose?: boolean;
    hasBackdrop?: boolean;
    panelClass?: string | string[];
  }): MatDialogRef<T> {
    const dialogConfig: MatDialogConfig = {
      width: config?.width || '600px',
      maxWidth: config?.maxWidth || '90vw',
      height: config?.height,
      maxHeight: config?.maxHeight || '90vh',
      disableClose: config?.disableClose || false,
      hasBackdrop: config?.hasBackdrop !== false,
      panelClass: config?.panelClass,
      data: config?.data
    };

    return this.dialog.open(component, dialogConfig);
  }

  // Ouvrir une modale avec le composant ModalComponent
  openModal(data: ModalData, config?: ModalConfig): MatDialogRef<ModalComponent> {
    const dialogConfig: MatDialogConfig = {
      width: config?.width || '600px',
      maxWidth: config?.maxWidth || '90vw',
      height: config?.height,
      maxHeight: config?.maxHeight || '90vh',
      disableClose: config?.disableClose || false,
      hasBackdrop: config?.hasBackdrop !== false,
      panelClass: config?.panelClass,
      data
    };

    return this.dialog.open(ModalComponent, dialogConfig);
  }

  // Ouvrir une modale de confirmation
  confirm(data: ConfirmationDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      maxWidth: '95vw',
      data,
      disableClose: false,
      panelClass: 'confirmation-dialog-panel'
    });

    return dialogRef.afterClosed();
  }

  // Ouvrir une confirmation simple
  confirmSimple(title: string, message: string, type: 'info' | 'warning' | 'danger' = 'info'): Observable<boolean> {
    return this.confirm({
      title,
      message,
      type,
      showIcon: true
    });
  }

  // Ouvrir une confirmation de suppression
  confirmDelete(itemName?: string): Observable<boolean> {
    return this.confirm({
      title: 'Confirmer la suppression',
      message: itemName 
        ? `Voulez-vous vraiment supprimer "${itemName}" ? Cette action est irréversible.`
        : 'Voulez-vous vraiment supprimer cet élément ? Cette action est irréversible.',
      type: 'danger',
      showIcon: true,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmColor: 'warn'
    });
  }

  // Ouvrir une confirmation de sauvegarde
  confirmUnsavedChanges(): Observable<boolean> {
    return this.confirm({
      title: 'Modifications non sauvegardées',
      message: 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter sans sauvegarder ?',
      type: 'warning',
      showIcon: true,
      confirmText: 'Quitter sans sauvegarder',
      cancelText: 'Rester sur la page',
      confirmColor: 'warn'
    });
  }

  // Ouvrir une modale plein écran
  openFullscreen<T = any>(component: any, data?: any): MatDialogRef<T> {
    return this.dialog.open(component, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog',
      data
    });
  }

  // Ouvrir une modale responsive
  openResponsive<T = any>(component: any, data?: any): MatDialogRef<T> {
    return this.dialog.open(component, {
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
      panelClass: 'responsive-dialog',
      data
    });
  }

  // Fermer toutes les modales
  closeAll(): void {
    this.dialog.closeAll();
  }

  // Obtenir les modales ouvertes
  getOpenDialogs(): MatDialogRef<any>[] {
    return this.dialog.openDialogs;
  }
}