import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { JournalActionService } from './journal-action.service';
  import { Reflector } from '@nestjs/core';
  
  export const AUDIT_LOG_KEY = 'auditLog';
  export const AuditLog = (tableCible: string, action?: string) => 
    (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      Reflect.defineMetadata(AUDIT_LOG_KEY, { tableCible, action }, descriptor.value);
    };
  
  @Injectable()
  export class JournalActionInterceptor implements NestInterceptor {
    constructor(
      private readonly journalService: JournalActionService,
      private readonly reflector: Reflector,
    ) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const auditConfig = this.reflector.get(AUDIT_LOG_KEY, context.getHandler());
      
      if (!auditConfig) {
        return next.handle();
      }
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const method = request.method;
      const { tableCible, action } = auditConfig;
  
      // Déterminer l'action basée sur la méthode HTTP si pas spécifiée
      const actionType = action || this.getActionFromMethod(method);
  
      return next.handle().pipe(
        tap(async (result) => {
          try {
            // Extraire l'ID de l'entité du résultat ou des paramètres
            const idCible = result?.id || request.params?.id || null;
            
            // Préparer les détails
            const details: any = {};
            if (request.body && Object.keys(request.body).length > 0) {
              details.payload = request.body;
            }
            if (request.params && Object.keys(request.params).length > 0) {
              details.params = request.params;
            }
  
            // Logger l'action
            await this.journalService.log(
              actionType,
              tableCible,
              idCible ? parseInt(idCible) : undefined,
              user?.id,
              Object.keys(details).length > 0 ? details : undefined,
              request.ip,
              request.get('User-Agent')
            );
          } catch (error) {
            // Ne pas faire échouer la requête si le logging échoue
            console.error('Erreur lors du logging:', error);
          }
        }),
      );
    }
  
    private getActionFromMethod(method: string): string {
      const methodMap = {
        'POST': 'CREATE',
        'PUT': 'UPDATE',
        'PATCH': 'UPDATE',
        'DELETE': 'DELETE',
        'GET': 'VIEW'
      };
      return methodMap[method] || 'UNKNOWN';
    }
  }