export interface AppConfig {
    production: boolean;
    appName: string;
    version: string;
    apiUrl: string;
    mapConfig: MapConfig;
    featureFlags: FeatureFlags;
    thirdPartyServices: ThirdPartyServices;
    security: SecurityConfig;
  }
  
  export interface MapConfig {
    defaultZoom: number;
    minZoom: number;
    maxZoom: number;
    defaultCenter: [number, number];
    epsgCode: string;
    baseLayers: BaseLayer[];
    overlayLayers: OverlayLayer[];
  }
  
  export interface BaseLayer {
    id: string;
    name: string;
    url: string;
    type: 'tile' | 'wms' | 'wmts';
    visible: boolean;
    attribution?: string;
  }
  
  export interface OverlayLayer {
    id: string;
    name: string;
    url: string;
    type: 'wms' | 'geojson' | 'vector';
    visible: boolean;
    style?: any;
  }
  
  export interface FeatureFlags {
    enableReporting: boolean;
    enableBulkOperations: boolean;
    enableAdvancedSearch: boolean;
    enableNotifications: boolean;
    enableAuditLog: boolean;
    enableMobileApp: boolean;
  }
  
  export interface ThirdPartyServices {
    googleMaps?: {
      apiKey: string;
      enabled: boolean;
    };
    openWeather?: {
      apiKey: string;
      enabled: boolean;
    };
    sentry?: {
      dsn: string;
      enabled: boolean;
    };
  }
  
  export interface SecurityConfig {
    sessionTimeout: number; // en minutes
    maxLoginAttempts: number;
    passwordPolicy: PasswordPolicy;
    corsOrigins: string[];
  }
  
  export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // en jours
  }
  
  // Configuration par défaut
  export const DEFAULT_APP_CONFIG: AppConfig = {
    production: false,
    appName: 'GeoTNB',
    version: '1.0.0',
    apiUrl: 'http://localhost:3000/api',
    mapConfig: {
      defaultZoom: 12,
      minZoom: 8,
      maxZoom: 20,
      defaultCenter: [517000, 377000],
      epsgCode: 'EPSG:26191',
      baseLayers: [
        {
          id: 'osm',
          name: 'OpenStreetMap',
          url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          type: 'tile',
          visible: true,
          attribution: '© OpenStreetMap contributors'
        }
      ],
      overlayLayers: []
    },
    featureFlags: {
      enableReporting: true,
      enableBulkOperations: true,
      enableAdvancedSearch: true,
      enableNotifications: true,
      enableAuditLog: true,
      enableMobileApp: false
    },
    thirdPartyServices: {},
    security: {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90
      },
      corsOrigins: ['http://localhost:4200']
    }
  };
  