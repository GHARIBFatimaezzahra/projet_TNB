export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
      LOGIN: 'auth/login',
      LOGOUT: 'auth/logout',
      REGISTER: 'auth/register',
      REFRESH: 'auth/refresh',
      VERIFY: 'auth/verify',
      PROFILE: 'auth/profile',
      CHANGE_PASSWORD: 'auth/change-password',
      FORGOT_PASSWORD: 'auth/forgot-password',
      RESET_PASSWORD: 'auth/reset-password'
    },
  
    // Users
    USERS: {
      BASE: 'users',
      BY_ID: (id: number) => `users/${id}`,
      ACTIVATE: (id: number) => `users/${id}/activate`,
      DEACTIVATE: (id: number) => `users/${id}/deactivate`,
      ROLES: 'users/roles',
      PERMISSIONS: 'users/permissions'
    },
  
    // Parcelles
    PARCELLES: {
      BASE: 'parcelles',
      BY_ID: (id: number) => `parcelles/${id}`,
      SEARCH: 'parcelles/search',
      SPATIAL_QUERY: 'parcelles/spatial-query',
      VALIDATE: (id: number) => `parcelles/${id}/validate`,
      REJECT: (id: number) => `parcelles/${id}/reject`,
      PUBLISH: (id: number) => `parcelles/${id}/publish`,
      GEOMETRY: (id: number) => `parcelles/${id}/geometry`,
      DOCUMENTS: (id: number) => `parcelles/${id}/documents`,
      PROPRIETAIRES: (id: number) => `parcelles/${id}/proprietaires`
    },
  
    // Propriétaires
    PROPRIETAIRES: {
      BASE: 'proprietaires',
      BY_ID: (id: number) => `proprietaires/${id}`,
      SEARCH: 'proprietaires/search',
      MERGE: 'proprietaires/merge',
      PARCELLES: (id: number) => `proprietaires/${id}/parcelles`
    },
  
    // Parcelle-Propriétaire (Indivision)
    PARCELLE_PROPRIETAIRE: {
      BASE: 'parcelle-proprietaire',
      BY_PARCELLE: (parcelleId: number) => `parcelle-proprietaire/parcelle/${parcelleId}`,
      BY_PROPRIETAIRE: (proprietaireId: number) => `parcelle-proprietaire/proprietaire/${proprietaireId}`,
      UPDATE_QUOTE_PART: 'parcelle-proprietaire/quote-part',
      VALIDATE_INDIVISION: (parcelleId: number) => `parcelle-proprietaire/validate/${parcelleId}`
    },
  
    // Fiches Fiscales
    FICHES_FISCALES: {
      BASE: 'fiche-fiscale',
      BY_ID: (id: number) => `fiche-fiscale/${id}`,
      GENERATE: 'fiche-fiscale/generate',
      BULK_GENERATE: 'fiche-fiscale/bulk-generate',
      BY_PARCELLE: (parcelleId: number) => `fiche-fiscale/parcelle/${parcelleId}`,
      DOWNLOAD_PDF: (id: number) => `fiche-fiscale/${id}/pdf`,
      PREVIEW: 'fiche-fiscale/preview',
      TEMPLATES: 'fiche-fiscale/templates'
    },
  
    // Documents Joints
    DOCUMENTS: {
      BASE: 'document-joint',
      BY_ID: (id: number) => `document-joint/${id}`,
      UPLOAD: 'document-joint/upload',
      BY_PARCELLE: (parcelleId: number) => `document-joint/parcelle/${parcelleId}`,
      DOWNLOAD: (id: number) => `document-joint/${id}/download`,
      TYPES: 'document-joint/types'
    },
  
    // Import/Export
    IMPORT_EXPORT: {
      IMPORT_GEOJSON: 'import/geojson',
      IMPORT_SHAPEFILE: 'import/shapefile',
      IMPORT_EXCEL: 'import/excel',
      EXPORT_PARCELLES: 'export/parcelles',
      EXPORT_PROPRIETAIRES: 'export/proprietaires',
      EXPORT_FICHES: 'export/fiches',
      JOBS: 'import/jobs',
      JOB_STATUS: (jobId: string) => `import/jobs/${jobId}/status`
    },
  
    // Dashboard
    DASHBOARD: {
      STATS: 'dashboard/stats',
      KPI: 'dashboard/kpi',
      CHARTS: 'dashboard/charts',
      PARCELLES_BY_ZONE: 'dashboard/parcelles-by-zone',
      REVENUE_EVOLUTION: 'dashboard/revenue-evolution',
      STATUS_DISTRIBUTION: 'dashboard/status-distribution'
    },
  
    // Journal/Audit
    AUDIT: {
      BASE: 'journal-action',
      BY_USER: (userId: number) => `journal-action/user/${userId}`,
      BY_TABLE: (table: string) => `journal-action/table/${table}`,
      BY_ENTITY: (table: string, entityId: number) => `journal-action/entity/${table}/${entityId}`,
      ACTIVITY_TIMELINE: 'journal-action/timeline'
    },
  
    // Cartographie
    MAP: {
      LAYERS: 'map/layers',
      LAYER_BY_ID: (id: number) => `map/layers/${id}`,
      SPATIAL_REFERENCE: 'map/spatial-reference',
      EXTENT: 'map/extent',
      LEGEND: (layerId: number) => `map/layers/${layerId}/legend`
    }
  } as const;