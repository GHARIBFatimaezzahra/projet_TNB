/* =====================================================
   DASHBOARD COLORS - COULEURS HOMOGÈNES
   ===================================================== */

// Palette de couleurs exacte de l'image du dashboard
export const DASHBOARD_COLORS = {
  // KPIs Principaux
  terrainsRecenses: '#3498db',      // Bleu
  terrainsImposables: '#9b59b6',    // Violet
  superficieTotale: '#2ecc71',      // Vert
  surfaceImposable: '#e67e22',      // Orange
  rendementPrevisionnel: '#27ae60', // Vert foncé
  tauxAssujettissement: '#f39c12',  // Orange clair

  // Statut Foncier (cohérent avec la création des parcelles)
  titreFoncier: '#3498db',          // Bleu - TF
  requisition: '#9b59b6',           // Violet - R
  nonImmatricule: '#e74c3c',        // Rouge - NI
  domanial: '#8e44ad',              // Violet foncé - Domanial
  collectif: '#f39c12',             // Orange - Collectif

  // Zone Urbanistique (cohérent avec la création des parcelles)
  r1: '#3498db',                    // Bleu - R1 Résidentiel dense
  r2: '#9b59b6',                    // Violet - R2 Résidentiel moyen
  r3: '#e74c3c',                    // Rouge - R3 Résidentiel faible
  industriel: '#1abc9c',            // Teal - I Industriel
  commercial: '#f39c12',            // Orange - C Commercial

  // Statut Fiscal (homogène avec le projet)
  imposable: '#e74c3c',             // Rouge
  exonere: '#f39c12',               // Jaune/Orange
  paye: '#27ae60',                  // Vert
  enAttente: '#e67e22',             // Orange foncé
  enLitige: '#8e44ad',              // Violet foncé

  // Statut Occupation (homogène avec le projet)
  nu: '#95a5a6',                    // Gris
  construit: '#2ecc71',             // Vert
  enConstruction: '#e67e22',        // Orange
  partiellementConstruit: '#f39c12', // Jaune

  // Couleurs de tendance
  positive: '#27ae60',              // Vert
  negative: '#e74c3c',              // Rouge
  neutre: '#95a5a6',                // Gris

  // Couleurs d'état
  success: '#27ae60',               // Vert
  warning: '#f39c12',               // Orange
  error: '#e74c3c',                 // Rouge
  info: '#3498db',                  // Bleu

  // Couleurs de fond
  background: '#f8f9fa',            // Gris très clair
  cardBackground: '#ffffff',        // Blanc
  borderColor: '#e9ecef',           // Gris clair
  textPrimary: '#2c3e50',           // Gris foncé
  textSecondary: '#6c757d',         // Gris moyen
  textMuted: '#adb5bd'              // Gris clair
};

// Configuration des graphiques
export const CHART_CONFIG = {
  // Configuration Chart.js par défaut
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: DASHBOARD_COLORS.borderColor,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: {
          color: DASHBOARD_COLORS.borderColor,
          drawBorder: false
        },
        ticks: {
          color: DASHBOARD_COLORS.textSecondary,
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: DASHBOARD_COLORS.borderColor,
          drawBorder: false
        },
        ticks: {
          color: DASHBOARD_COLORS.textSecondary,
          font: {
            size: 11
          }
        }
      }
    }
  },

  // Configuration spécifique pour les graphiques en donut
  donutOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  },

  // Configuration pour les graphiques en barres
  barOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: DASHBOARD_COLORS.borderColor
        }
      }
    }
  }
};

// Configuration des cartes KPI
export const KPI_CONFIG = {
  // Configuration des cartes KPI
  cardStyle: {
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },

  // Configuration des icônes
  icons: {
    terrainsRecenses: 'description',
    terrainsImposables: 'account_balance',
    superficieTotale: 'square_foot',
    surfaceImposable: 'terrain',
    rendementPrevisionnel: 'trending_up',
    tauxAssujettissement: 'pie_chart'
  },

  // Configuration des tendances
  trends: {
    up: {
      icon: '↗️',
      color: DASHBOARD_COLORS.positive,
      class: 'trend-up'
    },
    down: {
      icon: '↘️',
      color: DASHBOARD_COLORS.negative,
      class: 'trend-down'
    },
    stable: {
      icon: '→',
      color: DASHBOARD_COLORS.neutre,
      class: 'trend-stable'
    }
  }
};

// Configuration de la carte thématique
export const MAP_CONFIG = {
  // Couleurs des parcelles selon le statut fiscal
  parcelleColors: {
    imposable: DASHBOARD_COLORS.imposable,     // Rouge
    exonere: DASHBOARD_COLORS.exonere,         // Jaune/Orange
    paye: DASHBOARD_COLORS.paye,               // Vert
    enAttente: DASHBOARD_COLORS.enAttente,     // Orange foncé
    enLitige: DASHBOARD_COLORS.enLitige        // Violet foncé
  },

  // Couleurs des parcelles selon le statut d'occupation
  occupationColors: {
    nu: DASHBOARD_COLORS.nu,                   // Gris
    construit: DASHBOARD_COLORS.construit,     // Vert
    enConstruction: DASHBOARD_COLORS.enConstruction, // Orange
    partiellementConstruit: DASHBOARD_COLORS.partiellementConstruit // Jaune
  },

  // Couleurs des parcelles selon le zonage urbanistique (cohérent avec la création)
  zonageColors: {
    r1: DASHBOARD_COLORS.r1,                  // Bleu - R1
    r2: DASHBOARD_COLORS.r2,                  // Violet - R2
    r3: DASHBOARD_COLORS.r3,                  // Rouge - R3
    industriel: DASHBOARD_COLORS.industriel,  // Teal - I
    commercial: DASHBOARD_COLORS.commercial   // Orange - C
  },

  // Configuration de la légende
  legend: {
    position: 'bottom-right',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: `1px solid ${DASHBOARD_COLORS.borderColor}`,
    borderRadius: '8px',
    padding: '10px',
    fontSize: '12px'
  }
};

// Configuration des tableaux
export const TABLE_CONFIG = {
  // Configuration des tableaux de données
  tableStyle: {
    backgroundColor: DASHBOARD_COLORS.cardBackground,
    border: `1px solid ${DASHBOARD_COLORS.borderColor}`,
    borderRadius: '8px',
    overflow: 'hidden'
  },

  // Configuration des en-têtes
  headerStyle: {
    backgroundColor: DASHBOARD_COLORS.background,
    color: DASHBOARD_COLORS.textPrimary,
    fontWeight: '600',
    padding: '12px 16px',
    borderBottom: `1px solid ${DASHBOARD_COLORS.borderColor}`
  },

  // Configuration des cellules
  cellStyle: {
    padding: '12px 16px',
    borderBottom: `1px solid ${DASHBOARD_COLORS.borderColor}`,
    color: DASHBOARD_COLORS.textPrimary
  },

  // Configuration des statuts
  statusColors: {
    paye: DASHBOARD_COLORS.success,
    enAttente: DASHBOARD_COLORS.warning,
    enLitige: DASHBOARD_COLORS.error,
    valide: DASHBOARD_COLORS.success,
    brouillon: DASHBOARD_COLORS.warning
  }
};
