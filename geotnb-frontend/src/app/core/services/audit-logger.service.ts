import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { JournalAction, ActionType } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class AuditLoggerService {
  private auditEvents = new BehaviorSubject<JournalAction[]>([]);
  public auditEvents$ = this.auditEvents.asObservable();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  // Logger une action utilisateur
  logAction(
    action: ActionType,
    tableCible: string,
    idCible?: number,
    details?: any
  ): Observable<JournalAction> {
    const user = this.authService.currentUser;
    
    const logEntry = {
      utilisateur_id: user?.id,
      action,
      table_cible: tableCible,
      id_cible: idCible,
      details,
      date_heure: new Date().toISOString(),
      ip_address: this.getClientIP(),
      user_agent: navigator.userAgent
    };

    return this.apiService.post<JournalAction>('/journal-actions', logEntry);
  }

  // Logger une création
  logCreate(tableCible: string, idCible: number, details?: any): Observable<JournalAction> {
    return this.logAction(ActionType.CREATE, tableCible, idCible, details);
  }

  // Logger une modification
  logUpdate(tableCible: string, idCible: number, oldValue?: any, newValue?: any): Observable<JournalAction> {
    const details = { oldValue, newValue };
    return this.logAction(ActionType.UPDATE, tableCible, idCible, details);
  }

  // Logger une suppression
  logDelete(tableCible: string, idCible: number, deletedData?: any): Observable<JournalAction> {
    return this.logAction(ActionType.DELETE, tableCible, idCible, { deletedData });
  }

  // Logger une connexion
  logLogin(): Observable<JournalAction> {
    return this.logAction(ActionType.LOGIN, 'users', this.authService.currentUser?.id);
  }

  // Logger une déconnexion
  logLogout(): Observable<JournalAction> {
    return this.logAction(ActionType.LOGOUT, 'users', this.authService.currentUser?.id);
  }

  // Logger une consultation
  logView(tableCible: string, idCible: number): Observable<JournalAction> {
    return this.logAction(ActionType.VIEW, tableCible, idCible);
  }

  // Logger un export
  logExport(tableCible: string, exportType: string, filters?: any): Observable<JournalAction> {
    const details = { exportType, filters };
    return this.logAction(ActionType.EXPORT, tableCible, undefined, details);
  }

  // Logger un import
  logImport(tableCible: string, importResult: any): Observable<JournalAction> {
    return this.logAction(ActionType.IMPORT, tableCible, undefined, importResult);
  }

  // Récupérer l'historique d'audit
  getAuditHistory(filters: {
    table_cible?: string;
    utilisateur_id?: number;
    action?: ActionType;
    date_debut?: string;
    date_fin?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    return this.apiService.get(`/journal-actions?${params.toString()}`);
  }

  // Récupérer l'historique pour un enregistrement spécifique
  getEntityHistory(tableCible: string, idCible: number): Observable<JournalAction[]> {
    return this.apiService.get(`/journal-actions/entity-history?table_cible=${tableCible}&id_cible=${idCible}`);
  }

  // Obtenir les statistiques d'audit
  getAuditStats(): Observable<any> {
    return this.apiService.get('/journal-actions/stats');
  }

  // Obtenir l'IP client (approximative)
  private getClientIP(): string {
    // Dans un environnement de production, l'IP serait obtenue côté serveur
    return 'client-ip';
  }

  // Nettoyer les anciens logs (selon politique de rétention)
  cleanOldLogs(retentionDays: number): Observable<any> {
    return this.apiService.delete(`/journal-actions/cleanup/${retentionDays}`);
  }
}