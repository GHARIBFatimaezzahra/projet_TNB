// =====================================================
// CONFIGURATION ENDPOINTS API
// =====================================================

export const API_ENDPOINTS = {
  // Authentification
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
    changePassword: '/auth/change-password',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password'
  },

  // Utilisateurs
  users: {
    base: '/users',
    create: '/users',
    update: (id: number) => `/users/${id}`,
    delete: (id: number) => `/users/${id}`,
    get: (id: number) => `/users/${id}`,
    search: '/users/search',
    activate: (id: number) => `/users/${id}/activate`,
    deactivate: (id: number) => `/users/${id}/deactivate`
  },

  // Parcelles
  parcelles: {
    base: '/parcelles',
    create: '/parcelles',
    update: (id: number) => `/parcelles/${id}`,
    delete: (id: number) => `/parcelles/${id}`,
    get: (id: number) => `/parcelles/${id}`,
    search: '/parcelles/search',
    spatial: '/parcelles/spatial-query',
    validate: (id: number) => `/parcelles/${id}/validate`,
    publish: (id: number) => `/parcelles/${id}/publish`,
    archive: (id: number) => `/parcelles/${id}/archive`,
    calculateTnb: (id: number) => `/parcelles/${id}/calculate-tnb`,
    geometry: (id: number) => `/parcelles/${id}/geometry`,
    byReference: (reference: string) => `/parcelles/reference/${reference}`
  },

  // Propriétaires
  proprietaires: {
    base: '/proprietaires',
    create: '/proprietaires',
    update: (id: number) => `/proprietaires/${id}`,
    delete: (id: number) => `/proprietaires/${id}`,
    get: (id: number) => `/proprietaires/${id}`,
    search: '/proprietaires/search',
    byCin: (cin: string) => `/proprietaires/cin/${cin}`,
    byRc: (rc: string) => `/proprietaires/rc/${rc}`,
    parcelles: (id: number) => `/proprietaires/${id}/parcelles`
  },

  // Relations Parcelle-Propriétaire
  parcelleProprietaires: {
    base: '/parcelle-proprietaires',
    create: '/parcelle-proprietaires',
    update: (id: number) => `/parcelle-proprietaires/${id}`,
    delete: (id: number) => `/parcelle-proprietaires/${id}`,
    get: (id: number) => `/parcelle-proprietaires/${id}`,
    byParcelle: (parcelleId: number) => `/parcelle-proprietaires/parcelle/${parcelleId}`,
    byProprietaire: (proprietaireId: number) => `/parcelle-proprietaires/proprietaire/${proprietaireId}`,
    validateQuoteParts: (parcelleId: number) => `/parcelle-proprietaires/parcelle/${parcelleId}/validate-quotes`
  },

  // Fiches fiscales
  fichesFiscales: {
    base: '/fiches-fiscales',
    create: '/fiches-fiscales',
    update: (id: number) => `/fiches-fiscales/${id}`,
    delete: (id: number) => `/fiches-fiscales/${id}`,
    get: (id: number) => `/fiches-fiscales/${id}`,
    search: '/fiches-fiscales/search',
    generate: '/fiches-fiscales/generate',
    generateBulk: '/fiches-fiscales/generate-bulk',
    pdf: (id: number) => `/fiches-fiscales/${id}/pdf`,
    download: (id: number) => `/fiches-fiscales/${id}/download`,
    byYear: (year: number) => `/fiches-fiscales/year/${year}`,
    byCode: (code: string) => `/fiches-fiscales/code/${code}`,
    markAsPaid: (id: number) => `/fiches-fiscales/${id}/mark-paid`,
    cancel: (id: number) => `/fiches-fiscales/${id}/cancel`
  },

  // Documents joints
  documents: {
    base: '/documents-joints',
    create: '/documents-joints',
    update: (id: number) => `/documents-joints/${id}`,
    delete: (id: number) => `/documents-joints/${id}`,
    get: (id: number) => `/documents-joints/${id}`,
    upload: '/documents-joints/upload',
    download: (id: number) => `/documents-joints/${id}/download`,
    byParcelle: (parcelleId: number) => `/documents-joints/parcelle/${parcelleId}`,
    byProprietaire: (proprietaireId: number) => `/documents-joints/proprietaire/${proprietaireId}`,
    byType: (type: string) => `/documents-joints/type/${type}`
  },

  // Dashboard & Statistiques
  dashboard: {
    overview: '/dashboard/overview',
    kpis: '/dashboard/kpis',
    charts: '/dashboard/charts',
    statistiques: '/dashboard/statistiques',
    parZone: '/dashboard/statistiques/zones',
    evolution: '/dashboard/evolution',
    recettes: '/dashboard/recettes',
    export: '/dashboard/export'
  },

  // Import/Export
  import: {
    excel: '/import/excel',
    geojson: '/import/geojson',
    shapefile: '/import/shapefile',
    validate: '/import/validate',
    preview: '/import/preview',
    status: (jobId: string) => `/import/status/${jobId}`
  },

  export: {
    excel: '/export/excel',
    csv: '/export/csv',
    geojson: '/export/geojson',
    shapefile: '/export/shapefile',
    pdf: '/export/pdf',
    report: '/export/report'
  },

  // Configuration
  configuration: {
    fiscal: '/configuration/fiscal',
    zones: '/configuration/zones',
    app: '/configuration/app',
    updateFiscal: '/configuration/fiscal/update',
    updateZones: '/configuration/zones/update'
  },

  // Journal d'actions (Audit)
  journalActions: {
    base: '/journal-actions',
    search: '/journal-actions/search',
    byUser: (userId: number) => `/journal-actions/user/${userId}`,
    byTable: (table: string) => `/journal-actions/table/${table}`,
    byEntity: (table: string, entityId: number) => `/journal-actions/table/${table}/entity/${entityId}`,
    export: '/journal-actions/export'
  },

  // Notifications
  notifications: {
    base: '/notifications',
    send: '/notifications/send',
    markAsRead: (id: number) => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
    unread: '/notifications/unread',
    count: '/notifications/count'
  },

  // Workflow
  workflow: {
    states: '/workflow/states',
    transitions: '/workflow/transitions',
    execute: (entityType: string, entityId: number, action: string) => 
      `/workflow/${entityType}/${entityId}/execute/${action}`,
    history: (entityType: string, entityId: number) => 
      `/workflow/${entityType}/${entityId}/history`
  },

  // Sauvegarde
  backup: {
    create: '/backup/create',
    restore: '/backup/restore',
    list: '/backup/list',
    download: (filename: string) => `/backup/download/${filename}`,
    delete: (filename: string) => `/backup/delete/${filename}`,
    status: '/backup/status'
  }
};

// Helper pour construire une URL complète
export const buildApiUrl = (endpoint: string, baseUrl?: string): string => {
  const base = baseUrl || 'http://localhost:3000/api/v1';
  return `${base}${endpoint}`;
};

// Helper pour les paramètres de requête
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};