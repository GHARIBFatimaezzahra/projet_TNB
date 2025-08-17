import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  icon?: string;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<NotificationData>();
  private notifications = signal<NotificationData[]>([]);

  // Observable pour les composants qui écoutent les notifications
  public notification$ = this.notificationSubject.asObservable();

  // Signal pour l'état des notifications
  public notifications$ = this.notifications.asReadonly();

  // =================== MÉTHODES PUBLIQUES ===================
  showSuccess(title: string, message: string, duration: number = 5000): void {
    this.show({
      type: 'success',
      title,
      message,
      duration,
      icon: '✅'
    });
  }

  showError(title: string, message: string, duration: number = 8000): void {
    this.show({
      type: 'error',
      title,
      message,
      duration,
      icon: '❌'
    });
  }

  showWarning(title: string, message: string, duration: number = 6000): void {
    this.show({
      type: 'warning',
      title,
      message,
      duration,
      icon: '⚠️'
    });
  }

  showInfo(title: string, message: string, duration: number = 5000): void {
    this.show({
      type: 'info',
      title,
      message,
      duration,
      icon: 'ℹ️'
    });
  }

  showCustom(notification: Partial<NotificationData>): void {
    this.show({
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      ...notification
    });
  }

  // =================== GESTION DES NOTIFICATIONS ===================
  private show(notification: Omit<NotificationData, 'id'>): void {
    const id = this.generateId();
    const fullNotification: NotificationData = {
      ...notification,
      id
    };

    // Ajouter à la liste des notifications
    this.notifications.update(notifications => [...notifications, fullNotification]);

    // Émettre la notification
    this.notificationSubject.next(fullNotification);

    // Auto-suppression après la durée spécifiée
    if (fullNotification.duration && fullNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, fullNotification.duration);
    }
  }

  remove(id: string): void {
    this.notifications.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }

  clear(): void {
    this.notifications.set([]);
  }

  getNotifications(): NotificationData[] {
    return this.notifications();
  }

  getUnreadCount(): number {
    return this.notifications().length;
  }

  // =================== UTILITAIRES ===================
  private generateId(): string {
    return 'notification_' + Math.random().toString(36).substr(2, 9) + Date.now();
  }
}