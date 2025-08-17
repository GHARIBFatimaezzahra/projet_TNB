import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export interface NotificationConfig {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  closable?: boolean;
  progressBar?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly defaultConfig: NotificationConfig = {
    duration: 5000,
    position: 'top-right',
    closable: true,
    progressBar: true
  };

  constructor(private toastr: ToastrService) {}

  /**
   * Notification de succès
   */
  success(message: string, title = 'Succès', config?: NotificationConfig): void {
    const options = this.mergeConfig(config);
    this.toastr.success(message, title, {
      timeOut: options.duration,
      positionClass: `toast-${options.position}`,
      closeButton: options.closable,
      progressBar: options.progressBar
    });
  }

  /**
   * Notification d'erreur
   */
  error(message: string, title = 'Erreur', config?: NotificationConfig): void {
    const options = this.mergeConfig(config);
    this.toastr.error(message, title, {
      timeOut: options.duration,
      positionClass: `toast-${options.position}`,
      closeButton: options.closable,
      progressBar: options.progressBar
    });
  }

  /**
   * Notification d'avertissement
   */
  warning(message: string, title = 'Attention', config?: NotificationConfig): void {
    const options = this.mergeConfig(config);
    this.toastr.warning(message, title, {
      timeOut: options.duration,
      positionClass: `toast-${options.position}`,
      closeButton: options.closable,
      progressBar: options.progressBar
    });
  }

  /**
   * Notification d'information
   */
  info(message: string, title = 'Information', config?: NotificationConfig): void {
    const options = this.mergeConfig(config);
    this.toastr.info(message, title, {
      timeOut: options.duration,
      positionClass: `toast-${options.position}`,
      closeButton: options.closable,
      progressBar: options.progressBar
    });
  }

  /**
   * Notification personnalisée
   */
  show(
    message: string, 
    title: string, 
    type: 'success' | 'error' | 'warning' | 'info',
    config?: NotificationConfig
  ): void {
    switch (type) {
      case 'success':
        this.success(message, title, config);
        break;
      case 'error':
        this.error(message, title, config);
        break;
      case 'warning':
        this.warning(message, title, config);
        break;
      case 'info':
        this.info(message, title, config);
        break;
    }
  }

  /**
   * Fermer toutes les notifications
   */
  clear(): void {
    this.toastr.clear();
  }

  private mergeConfig(config?: NotificationConfig): NotificationConfig {
    return { ...this.defaultConfig, ...config };
  }
}