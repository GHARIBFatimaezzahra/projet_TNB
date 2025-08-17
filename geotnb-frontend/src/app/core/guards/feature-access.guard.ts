import { inject } from '@angular/core';
import { Router, type CanActivateFn, type ActivatedRouteSnapshot } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { NotificationService } from '../services/notification/notification.service';

// Configuration des accès par fonctionnalité
interface FeatureAccess {
  feature: string;
  requiredRoles: string[];
  isEnabled: boolean;
  maintenanceMessage?: string;
}

// Configuration des fonctionnalités (peut être externalisée)
const FEATURE_ACCESS_CONFIG: FeatureAccess[] = [
  {
    feature: 'dashboard',
    requiredRoles: ['Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur'],
    isEnabled: true
  },
  {
    feature: 'parcelles',
    requiredRoles: ['Admin', 'AgentFiscal', 'TechnicienSIG'],
    isEnabled: true
  },
  {
    feature: 'proprietaires',
    requiredRoles: ['Admin', 'AgentFiscal', 'TechnicienSIG'],
    isEnabled: true
  },
  {
    feature: 'fiches-fiscales',
    requiredRoles: ['Admin', 'AgentFiscal'],
    isEnabled: true
  },
  {
    feature: 'users',
    requiredRoles: ['Admin'],
    isEnabled: true
  },
  {
    feature: 'import-export',
    requiredRoles: ['Admin', 'TechnicienSIG'],
    isEnabled: true
  },
  {
    feature: 'audit',
    requiredRoles: ['Admin'],
    isEnabled: true
  },
  {
    feature: 'cartographie',
    requiredRoles: ['Admin', 'TechnicienSIG', 'AgentFiscal'],
    isEnabled: true
  }
];

export const featureAccessGuard = (featureName: string): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);

    const featureConfig = FEATURE_ACCESS_CONFIG.find(f => f.feature === featureName);
    
    if (!featureConfig) {
      console.warn(`Configuration non trouvée pour la fonctionnalité: ${featureName}`);
      return false;
    }

    // Vérifier si la fonctionnalité est activée
    if (!featureConfig.isEnabled) {
      notificationService.warning(
        featureConfig.maintenanceMessage || 'Cette fonctionnalité est temporairement indisponible.',
        'Fonctionnalité désactivée'
      );
      router.navigate(['/dashboard']);
      return false;
    }

    return authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          router.navigate(['/auth/login']);
          return false;
        }

        // Vérifier si l'utilisateur a le rôle requis
        if (featureConfig.requiredRoles.includes(user.profil)) {
          return true;
        } else {
          notificationService.error(
            `Accès non autorisé à la fonctionnalité "${featureName}".`,
            'Accès refusé'
          );
          router.navigate(['/unauthorized']);
          return false;
        }
      })
    );
  };
};

// Guards prédéfinis pour chaque fonctionnalité
export const dashboardAccessGuard: CanActivateFn = featureAccessGuard('dashboard');
export const parcellesAccessGuard: CanActivateFn = featureAccessGuard('parcelles');
export const proprietairesAccessGuard: CanActivateFn = featureAccessGuard('proprietaires');
export const fichesFiscalesAccessGuard: CanActivateFn = featureAccessGuard('fiches-fiscales');
export const usersAccessGuard: CanActivateFn = featureAccessGuard('users');
export const importExportAccessGuard: CanActivateFn = featureAccessGuard('import-export');
export const auditAccessGuard: CanActivateFn = featureAccessGuard('audit');
export const cartographieAccessGuard: CanActivateFn = featureAccessGuard('cartographie');

// Utilitaire pour vérifier l'accès à une fonctionnalité de façon programmatique
export const checkFeatureAccess = (featureName: string, userRole: string): boolean => {
  const featureConfig = FEATURE_ACCESS_CONFIG.find(f => f.feature === featureName);
  
  if (!featureConfig || !featureConfig.isEnabled) {
    return false;
  }
  
  return featureConfig.requiredRoles.includes(userRole);
};

// Fonction pour obtenir toutes les fonctionnalités accessibles par un rôle
export const getAccessibleFeatures = (userRole: string): string[] => {
  return FEATURE_ACCESS_CONFIG
    .filter(config => config.isEnabled && config.requiredRoles.includes(userRole))
    .map(config => config.feature);
};