import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
  action?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  success(message: string, title?: string, duration = 5000): void {
    this.show({ type: 'success', message, title, duration, action: true });
  }

  error(message: string, title?: string, duration = 8000): void {
    this.show({ type: 'error', message, title, duration, action: true });
  }

  warning(message: string, title?: string, duration = 6000): void {
    this.show({ type: 'warning', message, title, duration, action: true });
  }

  info(message: string, title?: string, duration = 5000): void {
    this.show({ type: 'info', message, title, duration, action: true });
  }

  private show(notification: Omit<Notification, 'id'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    // Auto-remove si duration est définie
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.remove(newNotification.id);
      }, notification.duration);
    }
  }

  remove(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }

  // Alias pour compatibilité
  removeNotification(id: string): void {
    this.remove(id);
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }
}