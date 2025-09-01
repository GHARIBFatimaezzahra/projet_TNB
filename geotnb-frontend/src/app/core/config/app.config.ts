// =====================================================
// CONFIGURATION APPLICATION - ENVIRONNEMENTS
// =====================================================

export interface AppConfig {
  production: boolean;
  apiUrl: string;
  mapConfig: {
    defaultZoom: number;
    defaultCenter: [number, number];
    maxZoom: number;
    minZoom: number;
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
    tokenExpirationKey: string;
    userKey: string;
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
  };
  pagination: {
    defaultPageSize: number;
    pageSizeOptions: number[];
  };
}

export const APP_CONFIG: AppConfig = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  
  mapConfig: {
    defaultZoom: 12,
    defaultCenter: [-7.6167, 33.5731], // Casablanca, Maroc
    maxZoom: 20,
    minZoom: 8
  },
  
  auth: {
    tokenKey: 'geotnb_token',
    refreshTokenKey: 'geotnb_refresh_token',
    tokenExpirationKey: 'geotnb_token_expiration',
    userKey: 'geotnb_user'
  },
  
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png', 
      'image/gif',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/json',
      'application/zip'
    ]
  },
  
  pagination: {
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100]
  }
};

// Configuration spécifique à l'environnement
export const getConfig = (): AppConfig => {
  const baseConfig = { ...APP_CONFIG };
  
  // Ajustements selon l'environnement
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      baseConfig.production = false;
      baseConfig.apiUrl = 'http://localhost:3000/api/v1';
    } else if (hostname.includes('staging')) {
      baseConfig.production = false;
      baseConfig.apiUrl = 'https://api-staging.geotnb.ma/api/v1';
    } else {
      baseConfig.production = true;
      baseConfig.apiUrl = 'https://api.geotnb.ma/api/v1';
    }
  }
  
      return baseConfig;
};