import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UserRole } from '../../models/auth/user.model';

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
  resource: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly authService = inject(AuthService);
  
  // Permissions prédéfinies pour chaque rôle
  private readonly rolePermissions: RolePermissions[] = [
    {
      role: UserRole.ADMIN,
      permissions: [
        // Toutes les permissions
        'users.create', 'users.read', 'users.update', 'users.delete',
        'parcelles.create', 'parcelles.read', 'parcelles.update', 'parcelles.delete',
        'parcelles.validate', 'parcelles.publish',
        'proprietaires.create', 'proprietaires.read', 'proprietaires.update', 'proprietaires.delete',
        'fiches.create', 'fiches.read', 'fiches.update', 'fiches.delete', 'fiches.generate',
        'documents.create', 'documents.read', 'documents.update', 'documents.delete',
        'import.execute', 'export.execute',
        'dashboard.read', 'reports.generate',
        'audit.read', 'system.configure'
      ]
    },
    {
      role: UserRole.AGENT_FISCAL,
      permissions: [
        'parcelles.read', 'parcelles.update',
        'proprietaires.read', 'proprietaires.update',
        'fiches.create', 'fiches.read', 'fiches.update', 'fiches.generate',
        'documents.read', 'documents.create',
        'export.execute', 'dashboard.read', 'reports.generate'
      ]
    },
    {
      role: UserRole.TECHNICIEN_SIG,
      permissions: [
        'parcelles.create', 'parcelles.read', 'parcelles.update', 'parcelles.delete',
        'proprietaires.create', 'proprietaires.read', 'proprietaires.update',
        'documents.create', 'documents.read', 'documents.update',
        'import.execute', 'export.execute',
        'dashboard.read', 'reports.generate'
      ]
    },
    {
      role: UserRole.LECTEUR,
      permissions: [
        'parcelles.read', 'proprietaires.read', 
        'fiches.read', 'documents.read',
        'dashboard.read'
      ]
    }
  ];

  // Cache des permissions de l'utilisateur actuel
  private userPermissionsSubject = new BehaviorSubject<string[]>([]);
  public userPermissions$ = this.userPermissionsSubject.asObservable();

  constructor() {
    // Écouter les changements d'utilisateur pour mettre à jour les permissions
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const permissions = this.getPermissionsForRole(user.profil);
        this.userPermissionsSubject.next(permissions);
      } else {
        this.userPermissionsSubject.next([]);
      }
    });
  }

  /**
   * Vérifier si l'utilisateur a une permission spécifique
   */
  hasPermission(permission: string): Observable<boolean> {
    return this.userPermissions$.pipe(
      map(permissions => permissions.includes(permission))
    );
  }

  /**
   * Vérifier si l'utilisateur a toutes les permissions spécifiées
   */
  hasAllPermissions(permissions: string[]): Observable<boolean> {
    return this.userPermissions$.pipe(
      map(userPermissions => 
        permissions.every(permission => userPermissions.includes(permission))
      )
    );
  }

  /**
   * Vérifier si l'utilisateur a au moins une des permissions spécifiées
   */
  hasAnyPermission(permissions: string[]): Observable<boolean> {
    return this.userPermissions$.pipe(
      map(userPermissions => 
        permissions.some(permission => userPermissions.includes(permission))
      )
    );
  }

  /**
   * Obtenir toutes les permissions de l'utilisateur actuel
   */
  getCurrentUserPermissions(): Observable<string[]> {
    return this.userPermissions$;
  }

  /**
   * Vérifier la permission de façon synchrone
   */
  hasPermissionSync(permission: string): boolean {
    const currentPermissions = this.userPermissionsSubject.value;
    return currentPermissions.includes(permission);
  }

  /**
   * Obtenir les permissions pour un rôle spécifique
   */
  getPermissionsForRole(role: UserRole): string[] {
    const rolePermission = this.rolePermissions.find(rp => rp.role === role);
    return rolePermission?.permissions || [];
  }

  /**
   * Vérifier les permissions pour une ressource spécifique
   */
  canAccess(resource: string, action: string): Observable<boolean> {
    const permission = `${resource}.${action}`;
    return this.hasPermission(permission);
  }

  /**
   * Obtenir toutes les permissions disponibles par module
   */
  getPermissionsByModule(): Observable<{ [module: string]: string[] }> {
    const allPermissions = this.getAllAvailablePermissions();
    const groupedPermissions: { [module: string]: string[] } = {};

    allPermissions.forEach(permission => {
      const [module] = permission.split('.');
      if (!groupedPermissions[module]) {
        groupedPermissions[module] = [];
      }
      groupedPermissions[module].push(permission);
    });

    return of(groupedPermissions);
  }

  /**
   * Vérifier si l'utilisateur peut gérer les utilisateurs
   */
  canManageUsers(): Observable<boolean> {
    return this.hasAnyPermission(['users.create', 'users.update', 'users.delete']);
  }

  /**
   * Vérifier si l'utilisateur peut valider les parcelles
   */
  canValidateParcelles(): Observable<boolean> {
    return this.hasPermission('parcelles.validate');
  }

  /**
   * Vérifier si l'utilisateur peut générer des rapports
   */
  canGenerateReports(): Observable<boolean> {
    return this.hasPermission('reports.generate');
  }

  /**
   * Vérifier si l'utilisateur peut faire des imports/exports
   */
  canImportExport(): Observable<boolean> {
    return this.hasAnyPermission(['import.execute', 'export.execute']);
  }

  /**
   * Filtrer les éléments de menu selon les permissions
   */
  filterMenuItems<T extends { requiredPermission?: string }>(items: T[]): Observable<T[]> {
    return this.userPermissions$.pipe(
      map(permissions => 
        items.filter(item => 
          !item.requiredPermission || permissions.includes(item.requiredPermission)
        )
      )
    );
  }

  private getAllAvailablePermissions(): string[] {
    const allPermissions = new Set<string>();
    this.rolePermissions.forEach(rolePermission => {
      rolePermission.permissions.forEach(permission => {
        allPermissions.add(permission);
      });
    });
    return Array.from(allPermissions).sort();
  }
}