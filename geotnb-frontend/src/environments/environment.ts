export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  websocketUrl: 'ws://localhost:3001', // Ajouter cette ligne
  mapConfig: {
    defaultCenter: [-2.9333, 34.6833], // Oujda coordinates
    defaultZoom: 12,
    maxZoom: 20,
    minZoom: 8,
    projection: 'EPSG:4326',
    extent: [-3.2, 34.4, -2.6, 35.0]
  },
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
  uploadMaxSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ['.shp', '.geojson', '.kml', '.gpx', '.pdf', '.jpg', '.png'],
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  },
  tnb: {
    defaultTariff: 5, // DH/m²
    exemptionDurations: [3, 5, 7], // années
    calculationPrecision: 2
  }
};