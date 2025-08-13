export const APP_CONSTANTS = {
    APP_NAME: 'GeoTNB',
    VERSION: '1.0.0',
    COPYRIGHT: '© 2025 Commune d\'Oujda - GeoConseil',
    
    ROLES: {
      ADMIN: 'Admin',
      AGENT_FISCAL: 'AgentFiscal',
      TECHNICIEN_SIG: 'TechnicienSIG',
      LECTEUR: 'Lecteur'
    },
  
    PAGINATION: {
      DEFAULT_PAGE_SIZE: 20,
      PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
      MAX_PAGE_SIZE: 1000
    },
  
    VALIDATION: {
      MIN_PASSWORD_LENGTH: 8,
      MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
      ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
      ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },
  
    DATE_FORMATS: {
      DISPLAY: 'dd/MM/yyyy',
      DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
      API: 'yyyy-MM-dd',
      API_WITH_TIME: 'yyyy-MM-ddTHH:mm:ss'
    },
  
    CURRENCY: {
      CODE: 'MAD',
      SYMBOL: 'DH',
      LOCALE: 'fr-MA'
    },
  
    MAP: {
      DEFAULT_STYLE_COLOR: '#007bff',
      SELECTED_STYLE_COLOR: '#ffc107',
      EXEMPTED_STYLE_COLOR: '#28a745',
      ERROR_STYLE_COLOR: '#dc3545'
    }
  };