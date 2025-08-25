export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  mapConfig: {
    defaultCenter: [582000, 384000], // Oujda en EPSG:26191
    defaultZoom: 13,
    minZoom: 10,
    maxZoom: 20,
    projection: 'EPSG:26191'
  },
  storage: {
    tokenKey: 'tnb_access_token',
    refreshTokenKey: 'tnb_refresh_token',
    userKey: 'tnb_user_data',
    cachePrefix: 'tnb_cache_'
  },
  notifications: {
    defaultDuration: 3000,
    errorDuration: 5000,
    maxNotifications: 5
  }
};