import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { Request } from 'express';
  import { DataSource } from 'typeorm';
  
  interface AuditableRequest extends Request {
    user?: {
      id: number;
      username: string;
    };
  }
  
  @Injectable()
  export class AuditInterceptor implements NestInterceptor {
    constructor(private dataSource: DataSource) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest<AuditableRequest>();
      const { method, url, body, params } = request;
      const user = request.user;
  
      // Ne tracer que les opérations importantes
      const shouldAudit = this.shouldAuditRequest(method, url);
      
      if (!shouldAudit || !user) {
        return next.handle();
      }
  
      return next.handle().pipe(
        tap({
          next: async (data) => {
            try {
              await this.createAuditLog({
                utilisateurId: user.id,
                action: this.getActionType(method),
                dateHeure: new Date(),
                tableCible: this.extractTableFromUrl(url),
                idCible: this.extractIdFromParams(params),
                details: {
                  method,
                  url,
                  body: this.sanitizeBody(body),
                  userAgent: request.get('User-Agent'),
                  ip: request.ip,
                },
              });
            } catch (error) {
              console.error('Erreur lors de la création du log d\'audit:', error);
            }
          },
          error: async (error) => {
            try {
              await this.createAuditLog({
                utilisateurId: user.id,
                action: 'ERROR',
                dateHeure: new Date(),
                tableCible: this.extractTableFromUrl(url),
                idCible: this.extractIdFromParams(params),
                details: {
                  method,
                  url,
                  error: error.message,
                  userAgent: request.get('User-Agent'),
                  ip: request.ip,
                },
              });
            } catch (auditError) {
              console.error('Erreur lors de la création du log d\'audit pour erreur:', auditError);
            }
          },
        }),
      );
    }
  
    private shouldAuditRequest(method: string, url: string): boolean {
      // Auditer uniquement les opérations critiques
      const auditableMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
      const auditablePaths = [
        '/users',
        '/parcelles', 
        '/proprietaires',
        '/parcelle-proprietaires',
        '/fiches-fiscales',
        '/auth'
      ];
  
      return auditableMethods.includes(method) && 
             auditablePaths.some(path => url.includes(path));
    }
  
    private getActionType(method: string): string {
      const actionMap = {
        'POST': 'CREATE',
        'PUT': 'UPDATE',
        'PATCH': 'UPDATE', 
        'DELETE': 'DELETE',
      };
      return actionMap[method] || 'UNKNOWN';
    }
  
    private extractTableFromUrl(url: string): string {
      const pathSegments = url.split('/').filter(segment => segment);
      if (pathSegments.length > 0) {
        return pathSegments[0];
      }
      return 'unknown';
    }
  
    private extractIdFromParams(params: any): number | null {
      return params?.id ? parseInt(params.id) : null;
    }
  
    private sanitizeBody(body: any): any {
      if (!body) return null;
      
      const sanitized = { ...body };
      // Supprimer les champs sensibles
      delete sanitized.password;
      delete sanitized.currentPassword;
      delete sanitized.newPassword;
      
      return sanitized;
    }
  
    private async createAuditLog(auditData: any): Promise<void> {
      await this.dataSource.query(
        `INSERT INTO journal_actions (utilisateur_id, action, date_heure, table_cible, id_cible, details, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          auditData.utilisateurId,
          auditData.action,
          auditData.dateHeure,
          auditData.tableCible,
          auditData.idCible,
          JSON.stringify(auditData.details),
          auditData.details.ip,
          auditData.details.userAgent,
        ]
      );
    }
  }