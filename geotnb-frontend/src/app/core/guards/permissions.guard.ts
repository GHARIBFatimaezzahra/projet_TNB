import { inject } from '@angular/core';
import { Router, type CanActivateFn, type ActivatedRouteSnapshot } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { PermissionService } from '../services/auth/permission.service';
import { NotificationService } from '../services/notification/notification.service';

export const permissionsGuard = (requiredPermissions: string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);

    return permissionService.hasAllPermissions(requiredPermissions).pipe(
      take(1),
      map(hasPermissions => {
        if (hasPermissions) {
          return true;
        } else {
          notificationService.error(
            'Vous n\'avez pas les permissions nécessaires pour cette action.',
            'Permissions insuffisantes'
          );
          router.navigate(['/unauthorized']);
          return false;
        }
      })
    );
  };
};

// Guard pour vérifier qu'au moins une permission est présente
export const anyPermissionGuard = (permissions: string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);

    return permissionService.hasAnyPermission(permissions).pipe(
      take(1),
      map(hasAnyPermission => {
        if (hasAnyPermission) {
          return true;
        } else {
          notificationService.error(
            'Vous n\'avez pas les permissions nécessaires.',
            'Accès refusé'
          );
          router.navigate(['/unauthorized']);
          return false;
        }
      })
    );
  };
};

// Guard pour vérifier une permission spécifique avec message personnalisé
export const specificPermissionGuard = (
  permission: string,
  customMessage?: string,
  redirectUrl?: string
): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);

    return permissionService.hasPermission(permission).pipe(
      take(1),
      map(hasPermission => {
        if (hasPermission) {
          return true;
        } else {
          const message = customMessage || 
            `Permission "${permission}" requise pour accéder à cette fonctionnalité.`;
          
          notificationService.warning(message, 'Accès refusé');
          router.navigate([redirectUrl || '/unauthorized']);
          return false;
        }
      })
    );
  };
};

// Guards prédéfinis pour les permissions communes
export const canManageUsersGuard: CanActivateFn = permissionsGuard([
  'users.create', 'users.update', 'users.delete'
]);

export const canValidateParcellesGuard: CanActivateFn = specificPermissionGuard(
  'parcelles.validate',
  'Seuls les utilisateurs autorisés peuvent valider les parcelles.',
  '/parcelles'
);

export const canGenerateReportsGuard: CanActivateFn = specificPermissionGuard(
  'reports.generate',
  'Vous n\'avez pas l\'autorisation de générer des rapports.',
  '/dashboard'
);

export const canImportExportGuard: CanActivateFn = anyPermissionGuard([
  'import.execute', 'export.execute'
]);

export const canCreateParcellesGuard: CanActivateFn = specificPermissionGuard(
  'parcelles.create',
  'Vous n\'avez pas l\'autorisation de créer des parcelles.'
);

export const canUpdateParcellesGuard: CanActivateFn = specificPermissionGuard(
  'parcelles.update',
  'Vous n\'avez pas l\'autorisation de modifier les parcelles.'
);

export const canDeleteParcellesGuard: CanActivateFn = specificPermissionGuard(
  'parcelles.delete',
  'Vous n\'avez pas l\'autorisation de supprimer les parcelles.'
);

export const canGenerateFichesGuard: CanActivateFn = specificPermissionGuard(
  'fiches.generate',
  'Vous n\'avez pas l\'autorisation de générer des fiches fiscales.'
);

export const canManageDocumentsGuard: CanActivateFn = anyPermissionGuard([
  'documents.create', 'documents.update', 'documents.delete'
]);

export const canViewAuditGuard: CanActivateFn = specificPermissionGuard(
  'audit.read',
  'Vous n\'avez pas l\'autorisation de consulter les journaux d\'audit.'
);

export const canConfigureSystemGuard: CanActivateFn = specificPermissionGuard(
  'system.configure',
  'Seuls les administrateurs peuvent configurer le système.'
);

// Guard dynamique basé sur les paramètres de route
export const dynamicPermissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  // Récupérer la permission depuis les données de route
  const requiredPermission = route.data['permission'] as string;
  const customMessage = route.data['permissionMessage'] as string;
  const redirectUrl = route.data['permissionRedirect'] as string;

  if (!requiredPermission) {
    console.warn('Aucune permission spécifiée dans les données de route');
    return true;
  }

  return permissionService.hasPermission(requiredPermission).pipe(
    take(1),
    map(hasPermission => {
      if (hasPermission) {
        return true;
      } else {
        const message = customMessage || 
          `Permission "${requiredPermission}" requise.`;
        
        notificationService.warning(message, 'Accès refusé');
        router.navigate([redirectUrl || '/unauthorized']);
        return false;
      }
    })
  );
};

// Guard pour les permissions contextuelles (ex: propriétaire d'une ressource)
export const contextualPermissionGuard = (
  basePermission: string,
  ownershipCheck?: (route: ActivatedRouteSnapshot) => boolean
): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);

    return permissionService.hasPermission(basePermission).pipe(
      take(1),
      map(hasBasePermission => {
        // Vérifier la permission de base
        if (!hasBasePermission) {
          notificationService.error(
            'Vous n\'avez pas les permissions nécessaires.',
            'Accès refusé'
          );
          router.navigate(['/unauthorized']);
          return false;
        }

        // Vérifier la propriété contextuelle si fournie
        if (ownershipCheck && !ownershipCheck(route)) {
          notificationService.error(
            'Vous ne pouvez accéder qu\'à vos propres ressources.',
            'Accès refusé'
          );
          router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  };
};

// Utilitaire pour créer des guards avec logging
export const createPermissionGuardWithLogging = (
  permissions: string[],
  actionDescription: string
): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);

    return permissionService.hasAllPermissions(permissions).pipe(
      take(1),
      map(hasPermissions => {
        console.log(`Permission check for ${actionDescription}:`, {
          requiredPermissions: permissions,
          hasPermissions,
          route: route.url,
          timestamp: new Date().toISOString()
        });

        if (hasPermissions) {
          return true;
        } else {
          notificationService.error(
            `Permissions insuffisantes pour ${actionDescription.toLowerCase()}.`,
            'Accès refusé'
          );
          router.navigate(['/unauthorized']);
          return false;
        }
      })
    );
  };
};