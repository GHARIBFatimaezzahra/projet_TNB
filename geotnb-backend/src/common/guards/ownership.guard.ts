import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const OWNERSHIP_KEY = 'ownership';

/**
 * Guard pour vérifier que l'utilisateur a le droit d'accéder à une ressource
 * Basé sur la propriété ou l'assignation d'une ressource
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ownershipConfig = this.reflector.getAllAndOverride<{
      field: string;
      param: string;
      adminBypass?: boolean;
    }>(OWNERSHIP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!ownershipConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params[ownershipConfig.param];

    if (!user) {
      return false;
    }

    // Les admins peuvent tout voir si adminBypass est activé
    if (ownershipConfig.adminBypass && user.profil === 'Admin') {
      return true;
    }

    // Vérifier si l'utilisateur est propriétaire de la ressource
    // Cette logique sera adaptée selon le contexte (parcelle, document, etc.)
    const userId = user.id;
    const resourceOwnerId = request.body?.[ownershipConfig.field] || 
                           request.query?.[ownershipConfig.field];

    if (resourceOwnerId && userId.toString() === resourceOwnerId.toString()) {
      return true;
    }

    throw new ForbiddenException('Accès refusé : vous n\'êtes pas autorisé à accéder à cette ressource');
  }
}