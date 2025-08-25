import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';

export interface BackupConfig {
  include_data: boolean;
  include_documents: boolean;
  include_spatial_data: boolean;
  tables?: string[];
  compression: 'none' | 'zip' | 'gzip';
}

export interface BackupInfo {
  id: string;
  name: string;
  size: number;
  date_created: string;
  status: 'pending' | 'completed' | 'failed';
  config: BackupConfig;
  error_message?: string;
}

export interface RestoreProgress {
  step: string;
  progress: number;
  total: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private backupProgress = new BehaviorSubject<number>(0);
  private restoreProgress = new BehaviorSubject<RestoreProgress | null>(null);
  
  public backupProgress$ = this.backupProgress.asObservable();
  public restoreProgress$ = this.restoreProgress.asObservable();

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  // Créer une sauvegarde
  createBackup(config: BackupConfig, name?: string): Observable<any> {
    const backupRequest = {
      name: name || `Sauvegarde_${new Date().toISOString().split('T')[0]}`,
      config
    };

    this.backupProgress.next(0);
    
    return new Observable(observer => {
      this.apiService.post('/backup/create', backupRequest).subscribe({
        next: (response) => {
          // Démarrer le suivi de progression
          this.trackBackupProgress((response as any).backup_id).subscribe({
            next: (progress) => {
              this.backupProgress.next(progress.progress);
              if (progress.completed) {
                this.notificationService.showSuccess('Sauvegarde créée avec succès');
                observer.next(response);
                observer.complete();
              }
            },
            error: (error) => {
              this.notificationService.showError('Erreur lors de la sauvegarde');
              observer.error(error);
            }
          });
        },
        error: (error) => {
          this.notificationService.showError('Impossible de démarrer la sauvegarde');
          observer.error(error);
        }
      });
    });
  }

  // Lister les sauvegardes disponibles
  listBackups(): Observable<BackupInfo[]> {
    return this.apiService.get<BackupInfo[]>('/backup/list');
  }

  // Télécharger une sauvegarde
  downloadBackup(backupId: string): Observable<Blob> {
    return this.apiService.downloadFile(`/backup/download/${backupId}`);
  }

  // Supprimer une sauvegarde
  deleteBackup(backupId: string): Observable<any> {
    return new Observable(observer => {
      this.notificationService.confirm({
        title: 'Supprimer la sauvegarde',
        message: 'Cette action est irréversible. Voulez-vous vraiment supprimer cette sauvegarde ?',
        type: 'danger'
      }).subscribe(confirmed => {
        if (confirmed) {
          this.apiService.delete(`/backup/${backupId}`).subscribe({
            next: (response) => {
              this.notificationService.showSuccess('Sauvegarde supprimée');
              observer.next(response);
              observer.complete();
            },
            error: (error) => {
              this.notificationService.showError('Erreur lors de la suppression');
              observer.error(error);
            }
          });
        } else {
          observer.complete();
        }
      });
    });
  }

  // Restaurer depuis une sauvegarde
  restoreBackup(backupId: string, options?: {
    overwrite_existing?: boolean;
    restore_data?: boolean;
    restore_documents?: boolean;
    restore_users?: boolean;
  }): Observable<any> {
    return new Observable(observer => {
      this.notificationService.confirm({
        title: 'Restaurer la sauvegarde',
        message: 'ATTENTION: Cette opération remplacera les données existantes. Voulez-vous continuer ?',
        type: 'warning'
      }).subscribe(confirmed => {
        if (confirmed) {
          const restoreRequest = { backup_id: backupId, ...options };
          
          this.apiService.post('/backup/restore', restoreRequest).subscribe({
            next: (response) => {
              // Démarrer le suivi de progression de restauration
              this.trackRestoreProgress((response as any).restore_id).subscribe({
                next: (progress) => {
                  this.restoreProgress.next(progress as any);
                  if ((progress as any).progress >= (progress as any).total) {
                    this.notificationService.showSuccess('Restauration terminée avec succès');
                    observer.next(response);
                    observer.complete();
                  }
                },
                error: (error) => {
                  this.notificationService.showError('Erreur lors de la restauration');
                  observer.error(error);
                }
              });
            },
            error: (error) => {
              this.notificationService.showError('Impossible de démarrer la restauration');
              observer.error(error);
            }
          });
        } else {
          observer.complete();
        }
      });
    });
  }

  // Uploader une sauvegarde externe
  uploadBackup(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('backup', file);
    
    return this.apiService.uploadFile('/backup/upload', formData as any);
  }

  // Programmer une sauvegarde automatique
  scheduleBackup(config: BackupConfig, schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // Format HH:mm
    day_of_week?: number; // Pour weekly (0=dimanche)
    day_of_month?: number; // Pour monthly
    retention_days: number;
  }): Observable<any> {
    const scheduleRequest = { config, schedule };
    return this.apiService.post('/backup/schedule', scheduleRequest);
  }

  // Obtenir les tâches de sauvegarde programmées
  getScheduledBackups(): Observable<any[]> {
    return this.apiService.get('/backup/scheduled');
  }

  // Annuler une tâche programmée
  cancelScheduledBackup(scheduleId: string): Observable<any> {
    return this.apiService.delete(`/backup/scheduled/${scheduleId}`);
  }

  // Vérifier l'intégrité d'une sauvegarde
  verifyBackup(backupId: string): Observable<any> {
    return this.apiService.post(`/backup/verify/${backupId}`, {});
  }

  // Suivre la progression de sauvegarde
  private trackBackupProgress(backupId: string): Observable<any> {
    return new Observable(observer => {
      const interval = setInterval(() => {
        this.apiService.get(`/backup/progress/${backupId}`).subscribe({
          next: (progress) => {
            observer.next(progress);
            if ((progress as any).completed || (progress as any).failed) {
              clearInterval(interval);
              if ((progress as any).failed) {
                observer.error(new Error((progress as any).error_message));
              }
            }
          },
          error: (error) => {
            clearInterval(interval);
            observer.error(error);
          }
        });
      }, 2000); // Vérifier toutes les 2 secondes
      
      // Timeout après 30 minutes
      setTimeout(() => {
        clearInterval(interval);
        observer.error(new Error('Timeout de sauvegarde'));
      }, 30 * 60 * 1000);
    });
  }

  // Suivre la progression de restauration
  private trackRestoreProgress(restoreId: string): Observable<RestoreProgress> {
    return new Observable(observer => {
      const interval = setInterval(() => {
        this.apiService.get(`/backup/restore/progress/${restoreId}`).subscribe({
          next: (progress) => {
            observer.next(progress as any);
            if ((progress as any).progress >= (progress as any).total) {
              clearInterval(interval);
              observer.complete();
            }
          },
          error: (error) => {
            clearInterval(interval);
            observer.error(error);
          }
        });
      }, 1000);
      
      // Timeout après 60 minutes pour restauration
      setTimeout(() => {
        clearInterval(interval);
        observer.error(new Error('Timeout de restauration'));
      }, 60 * 60 * 1000);
    });
  }

  // Obtenir l'espace disque disponible
  getDiskSpace(): Observable<{ total: number; used: number; available: number }> {
    return this.apiService.get('/backup/disk-space');
  }

  // Nettoyer les anciennes sauvegardes
  cleanupOldBackups(retentionDays: number): Observable<any> {
    return this.apiService.post('/backup/cleanup', { retention_days: retentionDays });
  }
}