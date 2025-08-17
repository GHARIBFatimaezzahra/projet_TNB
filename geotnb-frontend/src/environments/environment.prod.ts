export const environment = {
  production: true,
  apiUrl: 'https://api.votre-domaine.com/api',
  wsUrl: 'wss://api.votre-domaine.com',
  api: {
    baseUrl: 'https://api.votre-domaine.com/api',
    timeout: 30000,
    retries: 2,
    version: 'v1'
  },
  mapConfig: {
    center: [-1.9, 34.68],
    defaultCenter: [-1.9, 34.68],
    defaultZoom: 12,
    zoom: 12,
    maxZoom: 20,
    minZoom: 8,
    defaultProjection: 'EPSG:3857'
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    userKey: 'current_user'
  },
  storage: {
    prefix: 'tnb_',
    defaultTTL: 1800000
  },
  cache: {
    maxSize: 1000,
    defaultTTL: 1800000
  },
  upload: {
    maxFileSize: 10485760,
    allowedTypes: ['image/*', '.pdf', '.doc', '.docx']
  }
};