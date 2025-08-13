import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private addNotification(notification: Omit<Notification, 'id'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      duration: notification.duration || 5000
    };

    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, newNotification]);

    // Auto remove after duration (if not persistent)
    if (!notification.persistent && notification.duration !== 0) {
      setTimeout(() => {
        this.remove(newNotification.id);
      }, newNotification.duration);
    }
  }

  success(title: string, message: string, duration?: number): void {
    this.addNotification({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, persistent = false): void {
    this.addNotification({ 
      type: 'error', 
      title, 
      message, 
      persistent,
      duration: persistent ? 0 : 8000 
    });
  }

  warning(title: string, message: string, duration?: number): void {
    this.addNotification({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number): void {
    this.addNotification({ type: 'info', title, message, duration });
  }

  remove(id: string): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }
}