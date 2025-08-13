import { environment } from '../../../environments/environment';

export const MAP_CONFIG = {
  DEFAULT_CENTER: environment.mapConfig.defaultCenter,
  DEFAULT_ZOOM: environment.mapConfig.defaultZoom,
  MIN_ZOOM: environment.mapConfig.minZoom,
  MAX_ZOOM: environment.mapConfig.maxZoom,
  PROJECTION: 'EPSG:4326',
  EXTENT: [-2.5, 34.2, -1.3, 35.2], // Oujda region extent
  
  STYLES: {
    PARCELLE_DEFAULT: {
      fill: { color: 'rgba(0, 123, 255, 0.3)' },
      stroke: { color: '#007bff', width: 2 }
    },
    PARCELLE_SELECTED: {
      fill: { color: 'rgba(255, 193, 7, 0.5)' },
      stroke: { color: '#ffc107', width: 3 }
    },
    PARCELLE_EXONEREE: {
      fill: { color: 'rgba(40, 167, 69, 0.3)' },
      stroke: { color: '#28a745', width: 2 }
    },
    PARCELLE_INVALID: {
      fill: { color: 'rgba(220, 53, 69, 0.3)' },
      stroke: { color: '#dc3545', width: 2 }
    },
    PARCELLE_DRAFT: {
      fill: { color: 'rgba(108, 117, 125, 0.3)' },
      stroke: { color: '#6c757d', width: 2 }
    }
  },

  COLORS_BY_STATUS: {
    'nu': '#007bff',
    'construit': '#28a745',
    'partiellement_construit': '#ffc107',
    'en_construction': '#fd7e14'
  },

  COLORS_BY_ZONE: {
    'R1': '#e3f2fd',
    'R2': '#bbdefb',
    'R3': '#90caf9',
    'R4': '#64b5f6',
    'I1': '#fff3e0',
    'I2': '#ffe0b2',
    'I3': '#ffcc02',
    'C': '#f3e5f5',
    'E': '#e8f5e8'
  },

  BASE_LAYERS: [
    {
      id: 'osm',
      name: 'OpenStreetMap',
      type: 'xyz',
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      visible: true,
      attribution: '© OpenStreetMap contributors'
    },
    {
      id: 'satellite',
      name: 'Satellite',
      type: 'xyz',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      visible: false,
      attribution: '© Esri'
    },
    {
      id: 'terrain',
      name: 'Terrain',
      type: 'xyz',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
      visible: false,
      attribution: '© Esri'
    }
  ],

  OVERLAY_LAYERS: [
    {
      id: 'parcelles',
      name: 'Parcelles TNB',
      type: 'vector',
      visible: true,
      opacity: 0.8,
      zIndex: 100
    },
    {
      id: 'zonage',
      name: 'Zonage Urbanistique',
      type: 'vector',
      visible: false,
      opacity: 0.6,
      zIndex: 50
    },
    {
      id: 'limites_admin',
      name: 'Limites Administratives',
      type: 'vector',
      visible: false,
      opacity: 0.8,
      zIndex: 75
    }
  ],

  DRAWING_TOOLS: {
    POINT: {
      type: 'Point',
      style: {
        image: {
          radius: 6,
          fill: { color: '#ff0000' },
          stroke: { color: '#ffffff', width: 2 }
        }
      }
    },
    LINE: {
      type: 'LineString',
      style: {
        stroke: { color: '#ff0000', width: 3 }
      }
    },
    POLYGON: {
      type: 'Polygon',
      style: {
        fill: { color: 'rgba(255, 0, 0, 0.3)' },
        stroke: { color: '#ff0000', width: 2 }
      }
    }
  },

  POPUP_CONFIG: {
    positioning: 'bottom-center',
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    },
    className: 'ol-popup'
  },

  INTERACTION_CONFIG: {
    doubleClickZoom: true,
    dragAndDrop: true,
    dragPan: true,
    keyboardEventTarget: document,
    keyboardPan: true,
    keyboardZoom: true,
    mouseWheelZoom: true,
    pointer: true,
    select: true
  }
};