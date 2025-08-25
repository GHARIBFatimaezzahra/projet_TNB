export const ApiEndpoints = {
  // Authentification
  auth: {
    login: '/auth/login',
    logout: '/auth/logout', 
    refresh: '/auth/refresh',
    profile: '/auth/profile',
    changePassword: '/auth/change-password'
  },

  // Gestion des utilisateurs
  users: {
    base: '/users',
    create: '/users',
    update: (id: number) => `/users/${id}`,
    delete: (id: number) => `/users/${id}`,
    getById: (id: number) => `/users/${id}`,
    list: '/users',
    search: '/users/search',
    roles: '/users/roles'
  },

  // Gestion des propriétaires
  proprietaires: {
    base: '/proprietaires',
    create: '/proprietaires',
    update: (id: number) => `/proprietaires/${id}`,
    delete: (id: number) => `/proprietaires/${id}`,
    getById: (id: number) => `/proprietaires/${id}`,
    list: '/proprietaires',
    search: '/proprietaires/search',
    byNature: (nature: string) => `/proprietaires/nature/${nature}`
  },

  // Gestion des parcelles
  parcelles: {
    base: '/parcelles',
    create: '/parcelles',
    update: (id: number) => `/parcelles/${id}`,
    delete: (id: number) => `/parcelles/${id}`,
    getById: (id: number) => `/parcelles/${id}`,
    list: '/parcelles',
    search: '/parcelles/search',
    geojson: '/parcelles/geojson',
    byZone: (zonage: string) => `/parcelles/zone/${zonage}`,
    byStatut: (statut: string) => `/parcelles/statut/${statut}`,
    spatial: '/parcelles/spatial-query',
    validate: (id: number) => `/parcelles/${id}/validate`,
    publish: (id: number) => `/parcelles/${id}/publish`,
    archive: (id: number) => `/parcelles/${id}/archive`
  },

  // Relations parcelle-propriétaire
  parcelleProprietaires: {
    base: '/parcelle-proprietaires',
    create: '/parcelle-proprietaires',
    update: (id: number) => `/parcelle-proprietaires/${id}`,
    delete: (id: number) => `/parcelle-proprietaires/${id}`,
    byParcelle: (parcelleId: number) => `/parcelle-proprietaires/parcelle/${parcelleId}`,
    byProprietaire: (proprietaireId: number) => `/parcelle-proprietaires/proprietaire/${proprietaireId}`,
    validateQuotes: '/parcelle-proprietaires/validate-quotes'
  },

  // Fiches fiscales
  fichesFiscales: {
    base: '/fiches-fiscales',
    create: '/fiches-fiscales',
    update: (id: number) => `/fiches-fiscales/${id}`,
    delete: (id: number) => `/fiches-fiscales/${id}`,
    getById: (id: number) => `/fiches-fiscales/${id}`,
    list: '/fiches-fiscales',
    byAnnee: (annee: number) => `/fiches-fiscales/annee/${annee}`,
    byStatut: (statut: string) => `/fiches-fiscales/statut/${statut}`,
    generate: '/fiches-fiscales/generate',
    generateBulk: '/fiches-fiscales/generate-bulk',
    downloadPdf: (id: number) => `/fiches-fiscales/${id}/pdf`,
    markPaid: (id: number) => `/fiches-fiscales/${id}/mark-paid`
  },

  // Documents joints
  documentsJoints: {
    base: '/documents-joints',
    upload: '/documents-joints/upload',
    update: (id: number) => `/documents-joints/${id}`,
    delete: (id: number) => `/documents-joints/${id}`,
    getById: (id: number) => `/documents-joints/${id}`,
    byParcelle: (parcelleId: number) => `/documents-joints/parcelle/${parcelleId}`,
    byType: (type: string) => `/documents-joints/type/${type}`,
    download: (id: number) => `/documents-joints/${id}/download`,
    validate: (id: number) => `/documents-joints/${id}/validate`
  },

  // Journal des actions (audit)
  journalActions: {
    base: '/journal-actions',
    list: '/journal-actions',
    byUser: (userId: number) => `/journal-actions/user/${userId}`,
    byTable: (table: string) => `/journal-actions/table/${table}`,
    byEntity: (table: string, entityId: number) => `/journal-actions/entity/${table}/${entityId}`,
    stats: '/journal-actions/stats',
    cleanup: (retentionDays: number) => `/journal-actions/cleanup/${retentionDays}`
  },

  // Configurations
  configurations: {
    zones: {
      base: '/config/zones',
      create: '/config/zones',
      update: (id: number) => `/config/zones/${id}`,
      delete: (id: number) => `/config/zones/${id}`,
      getById: (id: number) => `/config/zones/${id}`,
      list: '/config/zones',
      geojson: '/config/zones/geojson',
      active: '/config/zones/active'
    },
    fiscales: {
      base: '/config/fiscales',
      create: '/config/fiscales',
      update: (id: number) => `/config/fiscales/${id}`,
      delete: (id: number) => `/config/fiscales/${id}`,
      getById: (id: number) => `/config/fiscales/${id}`,
      list: '/config/fiscales',
      byAnnee: (annee: number) => `/config/fiscales/annee/${annee}`,
      byZonage: (zonage: string) => `/config/fiscales/zonage/${zonage}`,
      active: '/config/fiscales/active',
      calculate: '/config/fiscales/calculate-tnb'
    }
  },

  // Tableaux de bord et statistiques
  dashboard: {
    statistiques: '/dashboard/statistiques',
    statistiquesZones: '/dashboard/statistiques-zones',
    statistiquesFiches: '/dashboard/statistiques-fiches',
    kpis: '/dashboard/kpis',
    evolution: '/dashboard/evolution',
    repartition: '/dashboard/repartition',
    recouvrement: '/dashboard/recouvrement'
  },

  // Import/Export
  import: {
    base: '/import',
    parcelles: '/import/parcelles',
    proprietaires: '/import/proprietaires',
    geojson: '/import/geojson',
    shapefile: '/import/shapefile',
    excel: '/import/excel',
    validate: '/import/validate',
    status: (importId: string) => `/import/status/${importId}`
  },

  export: {
    base: '/export',
    parcelles: '/export/parcelles',
    proprietaires: '/export/proprietaires',
    fichesFiscales: '/export/fiches-fiscales',
    statistiques: '/export/statistiques',
    geojson: '/export/geojson',
    shapefile: '/export/shapefile',
    excel: '/export/excel',
    pdf: '/export/pdf'
  },

  // Sauvegarde/Restauration
  backup: {
    create: '/backup/create',
    list: '/backup/list',
    download: (backupId: string) => `/backup/download/${backupId}`,
    delete: (backupId: string) => `/backup/${backupId}`,
    restore: '/backup/restore',
    upload: '/backup/upload',
    schedule: '/backup/schedule',
    scheduled: '/backup/scheduled',
    verify: (backupId: string) => `/backup/verify/${backupId}`,
    progress: (backupId: string) => `/backup/progress/${backupId}`,
    diskSpace: '/backup/disk-space',
    cleanup: '/backup/cleanup'
  },

  // Notifications
  notifications: {
    base: '/notifications',
    list: '/notifications',
    markRead: (id: number) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    preferences: '/notifications/preferences',
    send: '/notifications/send',
    templates: '/notifications/templates'
  },

  // Système
  system: {
    health: '/health',
    version: '/version',
    status: '/status',
    logs: '/system/logs',
    metrics: '/system/metrics',
    cache: {
      clear: '/system/cache/clear',
      stats: '/system/cache/stats'
    }
  },

  // Workflows
  workflow: {
    transitions: '/workflow/transitions',
    validate: '/workflow/validate',
    execute: '/workflow/execute',
    history: (entityType: string, entityId: number) => `/workflow/history/${entityType}/${entityId}`
  }
};