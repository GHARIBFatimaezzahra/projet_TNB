import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  BASE_URL: environment.apiUrl,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile',
      REGISTER: '/auth/register',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password'
    },
    USERS: {
      BASE: '/users',
      BY_ID: (id: number) => `/users/${id}`,
      ACTIVATE: (id: number) => `/users/${id}/activate`,
      DEACTIVATE: (id: number) => `/users/${id}/deactivate`,
      CHANGE_ROLE: (id: number) => `/users/${id}/role`
    },
    PARCELLES: {
      BASE: '/parcelles',
      BY_ID: (id: number) => `/parcelles/${id}`,
      SEARCH: '/parcelles/search',
      SPATIAL_QUERY: '/parcelles/spatial',
      BULK_UPDATE: '/parcelles/bulk-update',
      EXPORT: '/parcelles/export',
      VALIDATE: (id: number) => `/parcelles/${id}/validate`,
      PUBLISH: (id: number) => `/parcelles/${id}/publish`
    },
    PROPRIETAIRES: {
      BASE: '/proprietaires',
      BY_ID: (id: number) => `/proprietaires/${id}`,
      SEARCH: '/proprietaires/search',
      MERGE: '/proprietaires/merge',
      BY_CIN_RC: (cinRc: string) => `/proprietaires/by-cin-rc/${cinRc}`
    },
    PARCELLE_PROPRIETAIRE: {
      BASE: '/parcelle-proprietaire',
      BY_PARCELLE: (parcelleId: number) => `/parcelle-proprietaire/parcelle/${parcelleId}`,
      BY_PROPRIETAIRE: (proprietaireId: number) => `/parcelle-proprietaire/proprietaire/${proprietaireId}`,
      CALCULATE_TNB: '/parcelle-proprietaire/calculate-tnb'
    },
    FICHES_FISCALES: {
      BASE: '/fiche-fiscale',
      BY_ID: (id: number) => `/fiche-fiscale/${id}`,
      GENERATE: '/fiche-fiscale/generate',
      BULK_GENERATE: '/fiche-fiscale/bulk-generate',
      DOWNLOAD_PDF: (id: number) => `/fiche-fiscale/${id}/pdf`,
      BY_PARCELLE: (parcelleId: number) => `/fiche-fiscale/parcelle/${parcelleId}`,
      BY_YEAR: (year: number) => `/fiche-fiscale/year/${year}`
    },
    DOCUMENTS: {
      BASE: '/document-joint',
      BY_ID: (id: number) => `/document-joint/${id}`,
      BY_PARCELLE: (parcelleId: number) => `/document-joint/parcelle/${parcelleId}`,
      UPLOAD: '/document-joint/upload',
      DOWNLOAD: (id: number) => `/document-joint/${id}/download`,
      DELETE: (id: number) => `/document-joint/${id}`
    },
    DASHBOARD: {
      STATS: '/dashboard/stats',
      CHARTS: '/dashboard/charts',
      RECENT_ACTIVITIES: '/dashboard/activities',
      MAP_SUMMARY: '/dashboard/map-summary',
      REVENUE_EVOLUTION: '/dashboard/revenue-evolution',
      ZONE_DISTRIBUTION: '/dashboard/zone-distribution'
    },
    IMPORT: {
      UPLOAD: '/import/upload',
      VALIDATE: '/import/validate',
      PROCESS: '/import/process',
      HISTORY: '/import/history',
      STATUS: (importId: string) => `/import/${importId}/status`,
      DOWNLOAD_ERRORS: (importId: string) => `/import/${importId}/errors`
    },
    JOURNAL: {
      BASE: '/journal-action',
      BY_USER: (userId: number) => `/journal-action/user/${userId}`,
      BY_TABLE: (tableName: string) => `/journal-action/table/${tableName}`,
      BY_RECORD: (tableName: string, recordId: number) => `/journal-action/record/${tableName}/${recordId}`
    },
    REPORTS: {
      EXPORT_PARCELLES: '/reports/parcelles/export',
      EXPORT_PROPRIETAIRES: '/reports/proprietaires/export',
      EXPORT_FICHES: '/reports/fiches/export',
      TNB_SUMMARY: '/reports/tnb-summary',
      CUSTOM_REPORT: '/reports/custom'
    },
    SYSTEM: {
      HEALTH: '/system/health',
      VERSION: '/system/version',
      BACKUP: '/system/backup',
      LOGS: '/system/logs'
    }
  },
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  UPLOAD_LIMITS: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: {
      IMAGES: ['image/jpeg', 'image/png', 'image/gif'],
      DOCUMENTS: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      GIS: [
        'application/json', // GeoJSON
        'application/x-zip-compressed', // Shapefile
        'application/zip'
      ]
    }
  }
};