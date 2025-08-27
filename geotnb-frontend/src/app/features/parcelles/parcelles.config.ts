export const PARCELLES_CONFIG = {
  // Configuration des surfaces
  SURFACES: {
    MIN_SURFACE: 1, // m²
    MAX_SURFACE: 10000000, // m²
    TOLERANCE_GEOMETRIE: 0.1 // 10% de tolérance pour la cohérence surface/géométrie
  },

  // Configuration des zonages
  ZONAGES: {
    RESIDENTIEL: ['R1', 'R2', 'R3', 'R4'],
    INDUSTRIEL: ['I1', 'I2'],
    COMMERCIAL: ['C1', 'C2'],
    AGRICOLE: ['A'],
    EQUIPEMENTS: ['E'],
    VERTS: ['V']
  },

  // Configuration des statuts
  STATUTS: {
    FONCIER: ['TF', 'R', 'NI', 'Domanial', 'Collectif'],
    OCCUPATION: ['Nu', 'Construit', 'En_Construction', 'Partiellement_Construit'],
    VALIDATION: ['Brouillon', 'Valide', 'Publie', 'Archive']
  },

  // Configuration fiscale
  FISCAL: {
    TAUX_EXONERATION_MAX: 84, // mois
    SURFACE_EXONERATION_MAX: 500, // m²
    TARIFS_DEFAUT: {
      'R1': 20,
      'R2': 15,
      'R3': 10,
      'R4': 8,
      'I1': 12,
      'I2': 8,
      'C1': 25,
      'C2': 18,
      'A': 5,
      'E': 7,
      'V': 2
    }
  },

  // Configuration de la pagination
  PAGINATION: {
    PAGE_SIZE_DEFAULT: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
  },

  // Configuration des exports
  EXPORT: {
    FORMATS: ['csv', 'excel', 'pdf'],
    MAX_RECORDS: 10000
  },

  // Configuration des messages
  MESSAGES: {
    SUCCESS: {
      CREATED: 'Parcelle créée avec succès',
      UPDATED: 'Parcelle mise à jour avec succès',
      DELETED: 'Parcelle supprimée avec succès',
      EXPORTED: 'Export réalisé avec succès'
    },
    ERROR: {
      LOAD: 'Erreur lors du chargement des parcelles',
      SAVE: 'Erreur lors de la sauvegarde',
      DELETE: 'Erreur lors de la suppression',
      EXPORT: 'Erreur lors de l\'export'
    },
    WARNING: {
      UNSAVED_CHANGES: 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?',
      DELETE_CONFIRM: 'Êtes-vous sûr de vouloir supprimer cette parcelle ?'
    }
  }
};
