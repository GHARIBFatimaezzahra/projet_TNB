export const FiscalConfig = {
  // Année fiscale par défaut
  defaultFiscalYear: new Date().getFullYear(),

  // Tarifs TNB par défaut (en DH/m²)
  defaultRates: {
    'Zone_Centrale': 20.0,
    'Zone_Peripherique': 15.0,
    'Zone_Industrielle': 10.0,
    'Zone_Agricole': 5.0,
    'Zone_Touristique': 25.0,
    'Zone_Residentielle': 18.0
  },

  // Règles d'exonération selon la loi 47-06
  exemptionRules: {
    // Durée d'exonération selon la superficie (en années)
    durationBySurface: {
      // Surface <= 100m²
      small: { maxSurface: 100, duration: 3 },
      // Surface 101-500m²
      medium: { maxSurface: 500, duration: 5 },
      // Surface > 500m²
      large: { maxSurface: Infinity, duration: 7 }
    },
    
    // Exonérations spéciales
    specialExemptions: [
      {
        type: 'Domaine_Public',
        description: 'Terrains du domaine public',
        permanent: true
      },
      {
        type: 'Equipement_Public',
        description: 'Terrains destinés aux équipements publics',
        permanent: true
      },
      {
        type: 'Voirie',
        description: 'Emprises de voirie et espaces verts publics',
        permanent: true
      }
    ],

    // Période de grâce pour nouveaux permis
    gracePeriod: {
      enabled: true,
      duration: 30, // jours après obtention du permis
      description: 'Délai de grâce après obtention du permis'
    }
  },

  // Configuration du calcul TNB
  calculationRules: {
    // Formule: montant = surface_imposable × tarif_unitaire × coefficient_zone
    baseFormula: 'surface_imposable * tarif_unitaire * coefficient_zone',
    
    // Coefficients de zone
    zoneCoefficients: {
      'Zone_Centrale': 1.2,
      'Zone_Peripherique': 1.0,
      'Zone_Industrielle': 0.8,
      'Zone_Agricole': 0.6,
      'Zone_Touristique': 1.5,
      'Zone_Residentielle': 1.1
    },

    // Montant minimum (en DH)
    minimumAmount: 50.0,

    // Montant maximum par parcelle (en DH) - optionnel
    maximumAmount: null,

    // Arrondi (nombre de décimales)
    roundingDecimals: 2,

    // Mode d'arrondi
    roundingMode: 'round' // 'floor', 'ceil', 'round'
  },

  // Gestion des quotes-parts en indivision
  indivisionRules: {
    // Validation: somme des quotes-parts = 1.0
    validateSum: true,
    
    // Tolérance pour l'arrondi des quotes-parts
    tolerance: 0.01,

    // Quote-part minimale
    minimumQuotePart: 0.01,

    // Répartition par défaut si non spécifiée
    defaultDistribution: 'equal', // 'equal' ou 'manual'

    // Génération de fiches individuelles
    generateIndividualSheets: true
  },

  // Configuration des fiches fiscales
  fiscalSheetConfig: {
    // Format du code unique: TNB-YYYY-PARCELLE-PROPRIETAIRE-SEQUENCE
    codeFormat: 'TNB-{year}-{parcelle_id}-{proprietaire_id}-{sequence}',
    
    // Longueur de la séquence
    sequenceLength: 4,

    // Délai de paiement (en jours)
    paymentDeadline: 90,

    // Date limite de paiement dans l'année
    deadlineDate: '{year}-12-31',

    // Génération automatique
    autoGenerate: false,

    // Modèle PDF
    pdfTemplate: 'default',

    // Informations à inclure
    includeMap: true,
    includeQRCode: true,
    includeLegalText: true
  },

  // Pénalités et majorations
  penalties: {
    // Taux de majoration pour retard (%)
    latePaymentRate: 10.0,

    // Délai avant application des pénalités (en jours)
    gracePeriodDays: 30,

    // Majoration progressive
    progressivePenalty: {
      enabled: true,
      brackets: [
        { days: 30, rate: 5.0 },   // 5% après 30 jours
        { days: 90, rate: 10.0 },  // 10% après 90 jours
        { days: 180, rate: 15.0 }  // 15% après 180 jours
      ]
    }
  },

  // Paramètres de validation
  validation: {
    // Surface minimale imposable (m²)
    minimumTaxableSurface: 1.0,

    // Surface maximale raisonnable (m²) - contrôle de cohérence
    maximumReasonableSurface: 100000.0,

    // Ratio surface imposable / surface totale maximum
    maxImposableRatio: 1.0,

    // Contrôles automatiques
    automaticChecks: {
      surfaceConsistency: true,
      geometryValidity: true,
      zoneCompatibility: true,
      ownershipCompleteness: true
    }
  },

  // Configuration des rapports
  reportConfig: {
    // Types de rapports disponibles
    availableReports: [
      'situation_globale',
      'recettes_par_zone',
      'evolution_temporelle',
      'parcelles_exonerees',
      'recouvrement_tnb'
    ],

    // Périodes de référence
    reportPeriods: [
      'current_year',
      'previous_year',
      'current_quarter',
      'custom_period'
    ],

    // Formats d'export
    exportFormats: ['PDF', 'Excel', 'CSV']
  },

  // Alertes et notifications
  alerts: {
    // Seuils d'alerte pour les recettes
    revenueThresholds: {
      low: 0.5,    // 50% de l'objectif
      medium: 0.75, // 75% de l'objectif
      high: 0.9     // 90% de l'objectif
    },

    // Notifications automatiques
    automaticNotifications: {
      ficheGenerated: true,
      paymentReceived: true,
      deadlineApproaching: true,
      validationRequired: true
    }
  },

  // Processus d'identification TNB (selon votre document)
  identificationProcess: {
    steps: [
      {
        step: 1,
        name: 'Constitution base géographique',
        description: 'Créer base de données géographiques complète',
        requiredActions: [
          'Collecte sources données',
          'Reprojection EPSG:26191',
          'Création couche parcelles_tnb',
          'Association attributs fonciers'
        ]
      },
      {
        step: 2,
        name: 'Analyse autorisations et exonérations',
        description: 'Vérification permis et droits exonération',
        requiredActions: [
          'Interrogation base autorisations',
          'Vérification permis construire/lotir',
          'Application durées exonération',
          'Marquage champs exoneration'
        ]
      },
      {
        step: 3,
        name: 'Calcul surface imposable nette',
        description: 'Calcul précis surface soumise TNB',
        requiredActions: [
          'Identification surfaces à exclure',
          'Opérations spatiales',
          'Calcul surface_imposable',
          'Validation géométrique'
        ]
      },
      {
        step: 4,
        name: 'Identification propriétaires',
        description: 'Association parcelles aux propriétaires',
        requiredActions: [
          'Collecte données propriétaires',
          'Structure table proprietaires',
          'Gestion indivision',
          'Vérification croisée terrain'
        ]
      },
      {
        step: 5,
        name: 'Classification fiscale et calcul taxe',
        description: 'Classification et calcul montant TNB',
        requiredActions: [
          'Détermination catégorie fiscale',
          'Attribution tarif unitaire',
          'Calcul montant par quote-part',
          'Génération synthèse recettes'
        ]
      },
      {
        step: 6,
        name: 'Génération fiches fiscales',
        description: 'Production fiches individuelles',
        requiredActions: [
          'Extraction données automatique',
          'Génération PDF standardisé',
          'Ajout identifiants officiels',
          'Export par lots filtrés'
        ]
      }
    ]
  },

  // Tarifs par zone selon processus d'identification
  zoneRates: {
    'Zone_Centrale': { min: 15.0, max: 25.0, default: 20.0 },
    'Zone_Peripherique': { min: 10.0, max: 20.0, default: 15.0 },
    'Zone_Industrielle': { min: 5.0, max: 15.0, default: 10.0 },
    'Zone_Agricole': { min: 2.0, max: 8.0, default: 5.0 },
    'Zone_Touristique': { min: 20.0, max: 30.0, default: 25.0 },
    'Zone_Residentielle': { min: 12.0, max: 22.0, default: 18.0 }
  }
};