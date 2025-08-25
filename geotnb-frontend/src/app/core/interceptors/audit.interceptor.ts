import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuditLoggerService } from '../services/audit-logger.service';
import { ActionType } from '../models/database.models';

@Injectable()
export class AuditInterceptor implements HttpInterceptor {
  private readonly AUDITABLE_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];
  private readonly IGNORED_ENDPOINTS = ['auth', 'health', 'ping', 'journal-action'];

  constructor(private auditLogger: AuditLoggerService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Vérifier si la requête doit être auditée
    if (this.shouldAuditRequest(request)) {
      return next.handle(request).pipe(
        tap({
          next: (event) => {
            this.logSuccessfulRequest(request, event);
          },
          error: (error) => {
            this.logFailedRequest(request, error);
          }
        })
      );
    }

    return next.handle(request);
  }

  private shouldAuditRequest(request: HttpRequest<any>): boolean {
    // Ne pas auditer les méthodes GET et les endpoints ignorés
    if (!this.AUDITABLE_METHODS.includes(request.method)) {
      return false;
    }

    return !this.IGNORED_ENDPOINTS.some(endpoint => 
      request.url.includes(endpoint)
    );
  }

  private logSuccessfulRequest(request: HttpRequest<any>, event: any): void {
    try {
      const action = this.getActionFromMethod(request.method) as ActionType;
      const tableCible = this.getTableFromUrl(request.url);
      const idCible = this.getIdFromResponse(event, request);

      if (tableCible && idCible !== undefined) {
        this.auditLogger.logAction(action, tableCible, idCible, {
          url: request.url,
          method: request.method,
          body: request.body
        });
      }
    } catch (error) {
      console.warn('Failed to audit request:', error);
    }
  }

  private logFailedRequest(request: HttpRequest<any>, error: any): void {
    try {
      const action = `FAILED_${this.getActionFromMethod(request.method)}` as ActionType;
      const tableCible = this.getTableFromUrl(request.url);

      if (tableCible) {
        this.auditLogger.logAction(action, tableCible, 0, {
          url: request.url,
          method: request.method,
          error: error.message,
          status: error.status
        });
      }
    } catch (logError) {
      console.warn('Failed to audit failed request:', logError);
    }
  }

  private getActionFromMethod(method: string): string {
    const methodMap: { [key: string]: string } = {
      'POST': 'CREATE',
      'PUT': 'UPDATE',
      'PATCH': 'UPDATE',
      'DELETE': 'DELETE'
    };
    return methodMap[method] || method;
  }

  private getTableFromUrl(url: string): string {
    const parts = url.split('/');
    // Prendre le premier segment significatif après l'API
    const apiIndex = parts.findIndex(part => part === 'api');
    if (apiIndex !== -1 && parts.length > apiIndex + 1) {
      return parts[apiIndex + 1];
    }
    return '';
  }

  private getIdFromResponse(event: any, request: HttpRequest<any>): number | undefined {
    // Essayer de récupérer l'ID depuis la réponse
    if (event.body && event.body.id) {
      return event.body.id;
    }

    // Essayer de récupérer l'ID depuis l'URL pour les DELETE/PUT
    if (request.method === 'DELETE' || request.method === 'PUT') {
      const parts = request.url.split('/');
      const id = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(id)) {
        return id;
      }
    }

    return undefined;
  }
}