/* =====================================================
   DASHBOARD CONFIGURATION - PARAMÈTRES GLOBAUX
   ===================================================== */

export const DASHBOARD_CONFIG = {
  // Configuration des mises à jour temps réel
  realTime: {
    enabled: true,
    refreshInterval: 300000, // 5 minutes en millisecondes
    retryAttempts: 3,
    retryDelay: 5000 // 5 secondes
  },

  // Configuration des graphiques
  charts: {
    animation: true,
    responsive: true,
    maintainAspectRatio: false,
    defaultColors: {
      primary: '#667eea',
      secondary: '#764ba2',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8'
    }
  },

  // Configuration des exports
  exports: {
    pdf: {
      format: 'A4',
      orientation: 'landscape',
      margin: '1cm'
    },
    excel: {
      sheetName: 'Dashboard TNB',
      dateFormat: 'DD/MM/YYYY'
    }
  },

  // Configuration de la carte
  map: {
    defaultTheme: 'densite'
  },

  // Configuration des couches de carte
  mapLayers: {
    defaultVisible: ['parcelles', 'limites'],
    availableThemes: [
      { id: 'densite', name: 'Densité TNB par secteur' },
      { id: 'tarif', name: 'Classification tarifaire' },
      { id: 'statut', name: 'Statut foncier' },
      { id: 'occupation', name: 'État d\'occupation' },
      { id: 'zonage', name: 'Zonage urbanistique' },
      { id: 'rendement', name: 'Rendement fiscal' }
    ]
  },

  // Configuration des animations
  animations: {
    kpiCards: {
      duration: 2000,
      easing: 'ease-out'
    },
    charts: {
      duration: 1000,
      easing: 'ease-in-out'
    }
  },

  // Configuration des notifications
  notifications: {
    success: {
      duration: 2000,
      position: 'top-right'
    },
    error: {
      duration: 3000,
      position: 'top-right'
    },
    info: {
      duration: 2000,
      position: 'top-right'
    }
  }
};

// Types pour la configuration
export type DashboardConfig = typeof DASHBOARD_CONFIG;
export type RealTimeConfig = typeof DASHBOARD_CONFIG.realTime;
export type ChartsConfig = typeof DASHBOARD_CONFIG.charts;
export type ExportsConfig = typeof DASHBOARD_CONFIG.exports;
export type MapLayersConfig = typeof DASHBOARD_CONFIG.mapLayers;
export type AnimationsConfig = typeof DASHBOARD_CONFIG.animations;
export type NotificationsConfig = typeof DASHBOARD_CONFIG.notifications;
