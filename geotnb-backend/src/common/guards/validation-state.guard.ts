import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const VALIDATION_STATE_KEY = 'validationState';

/**
 * Guard pour contrôler les actions selon l'état de validation
 * Spécifique au workflow TNB (Brouillon -> Validé -> Publié)
 */
@Injectable()
export class ValidationStateGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredStates = this.reflector.getAllAndOverride<string[]>(
      VALIDATION_STATE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredStates || requiredStates.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Cette logique sera adaptée selon l'entité (parcelle, fiche fiscale, etc.)
    // Pour l'instant, on récupère l'état depuis le body ou les paramètres
    const currentState = request.body?.etatValidation || 
                        request.query?.etatValidation ||
                        'Brouillon';

    // Vérifier si l'état actuel permet l'action
    if (!requiredStates.includes(currentState)) {
      throw new ForbiddenException(
        `Action non autorisée : l'état "${currentState}" ne permet pas cette opération`
      );
    }

    // Vérifier les permissions selon l'état et le profil
    const canPerformAction = this.checkStatePermission(user.profil, currentState, request.method);
    
    if (!canPerformAction) {
      throw new ForbiddenException(
        `Votre profil (${user.profil}) ne permet pas cette action sur un élément en état "${currentState}"`
      );
    }

    return true;
  }

  private checkStatePermission(userProfile: string, state: string, method: string): boolean {
    // Règles métier pour les états de validation TNB
    const rules = {
      'Brouillon': {
        'GET': ['Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur'],
        'POST': ['Admin', 'TechnicienSIG'],
        'PATCH': ['Admin', 'TechnicienSIG'],
        'DELETE': ['Admin', 'TechnicienSIG']
      },
      'Valide': {
        'GET': ['Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur'],
        'POST': ['Admin'],
        'PATCH': ['Admin'],
        'DELETE': ['Admin']
      },
      'Publie': {
        'GET': ['Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur'],
        'POST': [],
        'PATCH': [],
        'DELETE': []
      },
      'Archive': {
        'GET': ['Admin'],
        'POST': [],
        'PATCH': [],
        'DELETE': []
      }
    };

    const allowedProfiles = rules[state]?.[method] || [];
    return allowedProfiles.includes(userProfile);
  }
}