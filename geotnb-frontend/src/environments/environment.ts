export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  mapConfig: {
    defaultCenter: [-1.9, 34.7], // Oujda
    defaultZoom: 12,
    maxZoom: 20,
    minZoom: 8
  },
  features: {
    enableDebugMode: true,
    enableMapDebug: true,
    enableConsoleLogging: true
  }
};