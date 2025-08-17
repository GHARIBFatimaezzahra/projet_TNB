export const APP_CONSTANTS = {
    APP_NAME: 'GeoTNB',
    APP_VERSION: '1.0.0',
    
    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 1000,
    
    // Upload
    MAX_FILE_SIZE_MB: 50,
    ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif'],
    ALLOWED_DOCUMENT_TYPES: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    ALLOWED_GIS_TYPES: ['geojson', 'kml', 'gpx', 'shp'],
    
    // Validation
    MIN_PASSWORD_LENGTH: 8,
    MAX_USERNAME_LENGTH: 50,
    MAX_EMAIL_LENGTH: 100,
    
    // TNB
    TNB_CALCULATION: {
      MIN_SURFACE: 1, // m²
      MAX_SURFACE: 100000, // m²
      MIN_TARIF: 0.1, // DH/m²
      MAX_TARIF: 100, // DH/m²
      EXEMPTION_DURATIONS: [3, 5, 7, 99] // années
    },
    
    // Cache
    CACHE_DURATION: {
      SHORT: 5 * 60 * 1000, // 5 minutes
      MEDIUM: 30 * 60 * 1000, // 30 minutes
      LONG: 24 * 60 * 60 * 1000 // 24 heures
    },
    
    // API
    REQUEST_TIMEOUT: 30000, // 30 secondes
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000, // 2 secondes
    
    // Map
    MAP_CONFIG: {
      DEFAULT_ZOOM: 12,
      MIN_ZOOM: 8,
      MAX_ZOOM: 20,
      DEFAULT_CENTER: [517000, 377000], // Oujda en Lambert Maroc Nord
      EPSG_CODE: 'EPSG:26191'
    },
    
    // Formats
    DATE_FORMATS: {
      DISPLAY: 'dd/MM/yyyy',
      DISPLAY_TIME: 'dd/MM/yyyy HH:mm',
      API: 'yyyy-MM-dd',
      API_TIME: "yyyy-MM-dd'T'HH:mm:ss"
    },
    
    // Messages
    MESSAGES: {
      LOADING: 'Chargement en cours...',
      SAVING: 'Sauvegarde en cours...',
      DELETING: 'Suppression en cours...',
      UPLOADING: 'Téléchargement en cours...',
      GENERATING: 'Génération en cours...',
      SUCCESS_SAVE: 'Enregistrement réussi',
      SUCCESS_DELETE: 'Suppression réussie',
      ERROR_GENERIC: 'Une erreur est survenue',
      ERROR_NETWORK: 'Erreur de connexion',
      CONFIRM_DELETE: 'Êtes-vous sûr de vouloir supprimer cet élément ?'
    }
  } as const;
  
  // Types pour une meilleure sécurité de types
  export type PageSizeOption = typeof APP_CONSTANTS.PAGE_SIZE_OPTIONS[number];
  export type ExemptionDuration = typeof APP_CONSTANTS.TNB_CALCULATION.EXEMPTION_DURATIONS[number];
  export type CacheDuration = keyof typeof APP_CONSTANTS.CACHE_DURATION;