import { Directive, HostListener, Input } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Directive({
  selector: '[appCopyToClipboard]',
  standalone: true
})
export class CopyToClipboardDirective {
  @Input() appCopyToClipboard: string = '';
  @Input() successMessage = 'Copié dans le presse-papiers';
  @Input() errorMessage = 'Erreur lors de la copie';

  constructor(private notificationService: NotificationService) {}

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.preventDefault();
    
    if (!this.appCopyToClipboard) {
      this.notificationService.showWarning('Aucun texte à copier');
      return;
    }

    this.copyToClipboard(this.appCopyToClipboard);
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Utiliser l'API Clipboard moderne
        await navigator.clipboard.writeText(text);
        this.notificationService.showSuccess(this.successMessage);
      } else {
        // Fallback pour les navigateurs plus anciens
        this.fallbackCopyToClipboard(text);
      }
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      this.notificationService.showError(this.errorMessage);
    }
  }

  private fallbackCopyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.notificationService.showSuccess(this.successMessage);
      } else {
        this.notificationService.showError(this.errorMessage);
      }
    } catch (error) {
      console.error('Fallback copy failed:', error);
      this.notificationService.showError(this.errorMessage);
    }
    
    document.body.removeChild(textArea);
  }
}