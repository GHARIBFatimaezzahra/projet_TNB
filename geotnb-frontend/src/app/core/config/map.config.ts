export const MapConfig = {
  // Configuration de base de la carte
  defaultView: {
    center: [-1.9, 34.05], // Coordonnées d'Oujda en WGS84
    zoom: 12,
    maxZoom: 20,
    minZoom: 8,
    projection: 'EPSG:4326'
  },

  // Projections supportées
  projections: {
    display: 'EPSG:4326', // WGS84 pour affichage
    data: 'EPSG:26191',   // Lambert Nord Maroc pour calculs
    web: 'EPSG:3857'      // Web Mercator pour fonds de carte
  },

  // Couches de base
  baseLayers: [
    {
      id: 'osm',
      name: 'OpenStreetMap',
      type: 'tile',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      visible: true,
      attribution: '© OpenStreetMap contributors'
    },
    {
      id: 'satellite',
      name: 'Imagerie satellite',
      type: 'tile',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      visible: false,
      attribution: '© Esri, World Imagery'
    },
    {
      id: 'terrain',
      name: 'Terrain',
      type: 'tile',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
      visible: false,
      attribution: '© Esri'
    }
  ],

  // Couches métier TNB
  dataLayers: {
    parcelles: {
      id: 'parcelles',
      name: 'Parcelles TNB',
      type: 'vector',
      source: 'api',
      endpoint: '/parcelles/geojson',
      style: {
        fill: {
          color: 'rgba(0, 123, 255, 0.3)'
        },
        stroke: {
          color: '#007bff',
          width: 2
        }
      },
      cluster: false,
      visible: true,
      queryable: true
    },
    zones: {
      id: 'zones',
      name: 'Zonage urbanistique',
      type: 'vector',
      source: 'api',
      endpoint: '/configurations/zones/geojson',
      style: {
        fill: {
          color: 'rgba(255, 165, 0, 0.2)'
        },
        stroke: {
          color: '#ffa500',
          width: 1
        }
      },
      visible: true,
      queryable: true
    },
    limites: {
      id: 'limites',
      name: 'Limites administratives',
      type: 'vector',
      source: 'api',
      endpoint: '/configurations/limites/geojson',
      style: {
        stroke: {
          color: '#dc3545',
          width: 3,
          lineDash: [5, 5]
        }
      },
      visible: false,
      queryable: false
    }
  },

  // Styles par statut de validation
  validationStyles: {
    'Brouillon': {
      fill: { color: 'rgba(255, 152, 0, 0.3)' },
      stroke: { color: '#ff9800', width: 2 }
    },
    'Valide': {
      fill: { color: 'rgba(33, 150, 243, 0.3)' },
      stroke: { color: '#2196f3', width: 2 }
    },
    'Publie': {
      fill: { color: 'rgba(76, 175, 80, 0.3)' },
      stroke: { color: '#4caf50', width: 2 }
    },
    'Archive': {
      fill: { color: 'rgba(117, 117, 117, 0.3)' },
      stroke: { color: '#757575', width: 2 }
    }
  },

  // Styles par statut d'occupation
  occupationStyles: {
    'Nu': {
      fill: { color: 'rgba(255, 235, 59, 0.4)' },
      stroke: { color: '#ffeb3b', width: 2 }
    },
    'Construit': {
      fill: { color: 'rgba(244, 67, 54, 0.4)' },
      stroke: { color: '#f44336', width: 2 }
    },
    'En_Construction': {
      fill: { color: 'rgba(255, 152, 0, 0.4)' },
      stroke: { color: '#ff9800', width: 2 }
    },
    'Partiellement_Construit': {
      fill: { color: 'rgba(255, 87, 34, 0.4)' },
      stroke: { color: '#ff5722', width: 2 }
    }
  },

  // Configuration des outils de dessin
  drawingTools: {
    polygon: {
      type: 'Polygon',
      style: {
        fill: { color: 'rgba(255, 0, 0, 0.2)' },
        stroke: { color: '#ff0000', width: 3, lineDash: [10, 10] }
      }
    },
    circle: {
      type: 'Circle',
      style: {
        fill: { color: 'rgba(0, 255, 0, 0.2)' },
        stroke: { color: '#00ff00', width: 2 }
      }
    },
    point: {
      type: 'Point',
      style: {
        image: {
          circle: {
            radius: 8,
            fill: { color: 'rgba(255, 0, 0, 0.8)' },
            stroke: { color: '#ffffff', width: 2 }
          }
        }
      }
    }
  },

  // Configuration des interactions
  interactions: {
    select: {
      style: {
        fill: { color: 'rgba(255, 255, 0, 0.5)' },
        stroke: { color: '#ffff00', width: 3 }
      },
      hitTolerance: 10
    },
    modify: {
      deleteCondition: 'shiftKeyOnly',
      insertVertexCondition: 'never'
    },
    snap: {
      pixelTolerance: 10,
      vertex: true,
      edge: true
    }
  },

  // Configuration des popups
  popup: {
    positioning: 'bottom-center',
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    },
    offset: [0, -10],
    className: 'ol-popup'
  },

  // Configuration des contrôles
  controls: {
    zoom: true,
    attribution: true,
    fullScreen: true,
    scaleLine: {
      units: 'metric',
      bar: true,
      steps: 4,
      text: true
    },
    mousePosition: {
      coordinateFormat: 'EPSG:4326',
      projection: 'EPSG:4326',
      undefinedHTML: '&nbsp;'
    },
    overviewMap: {
      collapsed: true,
      collapsible: true
    }
  },

  // Configuration de l'export
  export: {
    dpi: 150,
    formats: ['PNG', 'JPG', 'PDF'],
    sizes: [
      { name: 'A4 Portrait', width: 210, height: 297 },
      { name: 'A4 Paysage', width: 297, height: 210 },
      { name: 'A3 Portrait', width: 297, height: 420 },
      { name: 'A3 Paysage', width: 420, height: 297 }
    ]
  },

  // Configuration des mesures
  measurement: {
    area: {
      units: 'm²',
      style: {
        fill: { color: 'rgba(255, 255, 255, 0.2)' },
        stroke: { color: '#ffcc33', width: 2, lineDash: [10, 10] }
      }
    },
    length: {
      units: 'm',
      style: {
        stroke: { color: '#ffcc33', width: 3 }
      }
    }
  },

  // Configuration de la géolocalisation
  geolocation: {
    trackingOptions: {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    },
    projection: 'EPSG:4326'
  }
};