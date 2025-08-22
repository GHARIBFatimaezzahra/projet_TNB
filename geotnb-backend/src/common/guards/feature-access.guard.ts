import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const FEATURE_ACCESS_KEY = 'featureAccess';

/**
 * Guard pour contrôler l'accès aux fonctionnalités selon le profil utilisateur
 * Spécifique au contexte TNB
 */
@Injectable()
export class FeatureAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      FEATURE_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    // Vérifier l'accès selon le profil et la fonctionnalité
    const hasAccess = this.checkFeatureAccess(user.profil, requiredFeature);
    
    if (!hasAccess) {
      throw new ForbiddenException(
        `Accès refusé : votre profil (${user.profil}) ne permet pas d'utiliser cette fonctionnalité`
      );
    }

    return true;
  }

  private checkFeatureAccess(userProfile: string, feature: string): boolean {
    const featureMatrix = {
      // Gestion des parcelles
      'parcelle.create': ['Admin', 'TechnicienSIG'],
      'parcelle.edit': ['Admin', 'TechnicienSIG'],
      'parcelle.delete': ['Admin'],
      'parcelle.validate': ['Admin', 'TechnicienSIG'],
      
      // Gestion fiscale
      'fiscal.calculate': ['Admin', 'AgentFiscal'],
      'fiscal.generate': ['Admin', 'AgentFiscal'],
      'fiscal.modify': ['Admin'],
      
      // Gestion des propriétaires
      'proprietaire.create': ['Admin', 'AgentFiscal'],
      'proprietaire.edit': ['Admin', 'AgentFiscal'],
      'proprietaire.delete': ['Admin'],
      
      // Import/Export
      'import.data': ['Admin', 'TechnicienSIG'],
      'export.data': ['Admin', 'AgentFiscal', 'TechnicienSIG'],
      
      // Administration
      'admin.users': ['Admin'],
      'admin.config': ['Admin'],
      'admin.audit': ['Admin'],
      
      // Documents
      'document.upload': ['Admin', 'AgentFiscal', 'TechnicienSIG'],
      'document.delete': ['Admin'],
      
      // Rapports
      'report.generate': ['Admin', 'AgentFiscal'],
      'report.advanced': ['Admin']
    };

    const allowedProfiles = featureMatrix[feature];
    return allowedProfiles ? allowedProfiles.includes(userProfile) : false;
  }
}