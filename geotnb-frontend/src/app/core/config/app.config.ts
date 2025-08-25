import { Environment } from '../models/enums';

// Configuration principale de l'application
export const AppConfig = {
  // Informations générales de l'application
  app: {
    name: 'GeoTNB',
    fullName: 'Géoportail SIG pour la gestion de la TNB',
    version: '1.0.0',
    description: 'Plateforme cartographique interactive pour la gestion de la Taxe sur les Terrains Non Bâtis',
    author: 'Commune d\'Oujda',
    environment: Environment.DEVELOPMENT // À changer selon l'environnement
  },

  // Configuration des URLs API
  api: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 30000, // 30 secondes
    retryAttempts: 3,
    retryDelay: 1000, // 1 seconde
    endpoints: {
      auth: '/auth',
      parcelles: '/parcelles',
      proprietaires: '/proprietaires',
      fiches: '/fiches-fiscales',
      documents: '/documents-joints',
      configurations: '/config',
      dashboard: '/dashboard',
      import: '/import',
      export: '/export'
    }
  },

  // Configuration authentification JWT
  auth: {
    tokenKey: 'sig_tnb_token',
    userKey: 'sig_tnb_user',
    refreshTokenKey: 'sig_tnb_refresh_token',
    tokenExpirationBuffer: 300000, // 5 minutes en millisecondes
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes
    rememberMeExpiration: 2592000000, // 30 jours
    sessionTimeout: 3600000, // 1 heure d'inactivité
    autoRefreshEnabled: true,
    autoRefreshThreshold: 600000 // 10 minutes avant expiration
  },

  // Configuration géospatiale
  spatial: {
    // Projections
    defaultProjection: 'EPSG:26191', // Lambert Nord Maroc
    displayProjection: 'EPSG:4326',  // WGS84 pour affichage
    webProjection: 'EPSG:3857',      // Web Mercator
    
    // Coordonnées par défaut (Oujda)
    defaultCenter: [-1.9, 34.05],
    defaultZoom: 12,
    maxZoom: 20,
    minZoom: 8,
    
    // Contraintes géographiques (région d'Oujda)
    bounds: {
      minX: -2.5,
      minY: 33.5,
      maxX: -1.3,
      maxY: 34.6
    },
    
    // Configuration des mesures
    measurement: {
      precision: 2,
      areaUnit: 'm²',
      lengthUnit: 'm',
      showTooltips: true
    }
  },

  // Configuration pagination
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100, 200],
    maxPageSize: 500,
    showFirstLastButtons: true,
    showPageSizeSelector: true
  },

  // Configuration upload fichiers
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10,
    allowedTypes: [
      // Images
      'image/jpeg',
      'image/png', 
      'image/tiff',
      'image/gif',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Tableurs
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Fichiers SIG
      'application/octet-stream', // Pour shapefiles
      'application/json', // Pour GeoJSON
      'application/zip'
    ],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif', 
                        '.doc', '.docx', '.xls', '.xlsx', '.shp', '.geojson', '.zip'],
    uploadDirectory: '/uploads',
    thumbnailSize: { width: 200, height: 200 }
  },

  // Messages de l'application
  messages: {
    errors: {
      generic: 'Une erreur est survenue. Veuillez réessayer.',
      network: 'Erreur de connexion au serveur. Vérifiez votre connexion internet.',
      unauthorized: 'Accès non autorisé. Veuillez vous reconnecter.',
      forbidden: 'Vous n\'avez pas les permissions nécessaires.',
      notFound: 'Ressource non trouvée.',
      validation: 'Les données saisies sont invalides.',
      timeout: 'La requête a pris trop de temps. Veuillez réessayer.',
      fileSize: 'Le fichier est trop volumineux.',
      fileType: 'Type de fichier non autorisé.',
      geometryInvalid: 'La géométrie de la parcelle est invalide.',
      quotePartInvalid: 'La somme des quotes-parts doit être égale à 100%.',
      surfaceInvalid: 'La surface imposable ne peut pas être supérieure à la surface totale.'
    },
    success: {
      saved: 'Données sauvegardées avec succès',
      deleted: 'Élément supprimé avec succès',
      updated: 'Mise à jour effectuée avec succès',
      imported: 'Importation terminée avec succès',
      exported: 'Export généré avec succès',
      emailSent: 'Email envoyé avec succès',
      ficheGenerated: 'Fiche fiscale générée avec succès'
    },
    info: {
      loading: 'Chargement en cours...',
      processing: 'Traitement en cours...',
      noData: 'Aucune donnée trouvée',
      selectParcelle: 'Sélectionnez une parcelle sur la carte',
      drawGeometry: 'Dessinez la géométrie de la parcelle',
      uploadFile: 'Glissez-déposez vos fichiers ici ou cliquez pour sélectionner'
    }
  },

  // Configuration couleurs par statut
  statusColors: {
    validation: {
      'Brouillon': '#ff9800',
      'Valide': '#2196f3', 
      'Publie': '#4caf50',
      'Archive': '#757575'
    },
    occupation: {
      'Nu': '#ffeb3b',
      'Construit': '#f44336',
      'En_Construction': '#ff9800',
      'Partiellement_Construit': '#ff5722'
    },
    payment: {
      'EnAttente': '#ff9800',
      'Paye': '#4caf50',
      'Retard': '#f44336', 
      'Annule': '#757575'
    },
    zones: {
      'Zone_Centrale': '#e91e63',
      'Zone_Peripherique': '#9c27b0',
      'Zone_Industrielle': '#673ab7',
      'Zone_Agricole': '#4caf50',
      'Zone_Touristique': '#00bcd4',
      'Zone_Residentielle': '#ff9800'
    }
  },

  // Configuration des thèmes
  theme: {
    primary: '#1976d2',
    accent: '#ff4081',
    warn: '#f44336',
    background: '#fafafa',
    surface: '#ffffff',
    darkMode: false,
    allowThemeToggle: true
  },

  // Configuration date/heure
  dateTime: {
    locale: 'fr-FR',
    timezone: 'Africa/Casablanca',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'dd/MM/yyyy HH:mm',
    firstDayOfWeek: 1 // Lundi
  },

  // Configuration notifications
  notifications: {
    defaultDuration: 5000,
    position: {
      horizontal: 'right',
      vertical: 'top'
    },
    enableSound: false,
    enableBrowserNotifications: true,
    maxVisible: 5,
    enableHistory: true,
    historySize: 100
  },

  // Configuration cache
  cache: {
    defaultDuration: 1800000, // 30 minutes
    maxSize: 50 * 1024 * 1024, // 50MB
    cleanupInterval: 300000, // 5 minutes
    strategies: {
      parcelles: 900000, // 15 minutes
      proprietaires: 1800000, // 30 minutes
      configurations: 3600000, // 1 heure
      statistiques: 300000 // 5 minutes
    }
  },

  // Configuration logging
  logging: {
    level: Environment.DEVELOPMENT ? 'DEBUG' : 'INFO',
    enableConsole: true,
    enableStorage: true,
    enableRemote: false,
    maxEntries: 1000,
    categories: ['Auth', 'API', 'SIG', 'Workflow', 'UI', 'Performance'],
    remoteEndpoint: 'http://localhost:3000/api/logs'
  },

  // Configuration des fonctionnalités
  features: {
    enableOfflineMode: false,
    enableAdvancedSearch: true,
    enableBulkOperations: true,
    enableDataExport: true,
    enableDataImport: true,
    enableReports: true,
    enableNotifications: true,
    enableAuditLog: true,
    enableBackup: true,
    enableAdvancedWorkflow: true,
    enableSpatialAnalysis: true,
    enableMobileView: true
  },

  // Configuration sécurité
  security: {
    enableCSRFProtection: true,
    enableXSSProtection: true,
    enableClickjacking: true,
    sessionStorage: 'localStorage', // 'localStorage' ou 'sessionStorage'
    encryptSensitiveData: true,
    logSecurityEvents: true,
    maxFileUploads: 10,
    allowedOrigins: ['http://localhost:4200', 'http://localhost:3000']
  },

  // Configuration performance
  performance: {
    enableLazyLoading: true,
    enableVirtualScrolling: true,
    enableChangeDetectionOptimization: true,
    debounceTime: 300, // millisecondes
    throttleTime: 100, // millisecondes
    maxConcurrentRequests: 6,
    requestTimeout: 30000 // 30 secondes
  },

  // Configuration des rapports
  reports: {
    formats: ['PDF', 'Excel', 'CSV'],
    defaultFormat: 'PDF',
    maxRecords: 10000,
    enableScheduledReports: true,
    enableEmailDelivery: true,
    retention: {
      days: 90, // Garder les rapports 90 jours
      maxSize: 100 * 1024 * 1024 // 100MB max
    }
  },

  // Configuration système
  system: {
    enableHealthCheck: true,
    healthCheckInterval: 300000, // 5 minutes
    enableMetrics: true,
    metricsInterval: 60000, // 1 minute
    enableMaintenanceMode: false,
    maintenanceMessage: 'Système en maintenance. Retour prévu dans 30 minutes.',
    supportContact: {
      email: 'support.tnb@oujda.ma',
      phone: '+212 536 123 456',
      url: 'https://support.oujda.ma'
    }
  }
};

// Configuration spécifique à l'environnement
export const getEnvironmentConfig = () => {
  const baseConfig = { ...AppConfig };
  
  switch (baseConfig.app.environment) {
    case Environment.PRODUCTION:
      return {
        ...baseConfig,
        api: {
          ...baseConfig.api,
          baseUrl: 'https://api.tnb.oujda.ma/api'
        },
        logging: {
          ...baseConfig.logging,
          level: 'WARN',
          enableConsole: false,
          enableRemote: true
        },
        features: {
          ...baseConfig.features,
          enableOfflineMode: true
        }
      };
      
    case Environment.STAGING:
      return {
        ...baseConfig,
        api: {
          ...baseConfig.api,
          baseUrl: 'https://staging-api.tnb.oujda.ma/api'
        },
        logging: {
          ...baseConfig.logging,
          level: 'INFO',
          enableRemote: true
        }
      };
      
    default: // DEVELOPMENT
      return baseConfig;
  }
};