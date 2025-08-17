export interface LayerConfig {
    id: string;
    name: string;
    type: LayerType;
    url?: string;
    visible: boolean;
    opacity: number;
    minZoom?: number;
    maxZoom?: number;
    style?: LayerStyle;
    attribution?: string;
    queryable?: boolean;
  }
  
  export type LayerType = 'tile' | 'wms' | 'wmts' | 'vector' | 'geojson';
  
  export interface LayerStyle {
    fill?: {
      color: string;
      opacity: number;
    };
    stroke?: {
      color: string;
      width: number;
      opacity: number;
    };
    point?: {
      radius: number;
      fill: string;
      stroke: string;
    };
  }
  
  export interface MapControls {
    zoom: boolean;
    rotate: boolean;
    attribution: boolean;
    scaleLine: boolean;
    fullScreen: boolean;
    mousePosition: boolean;
    overviewMap: boolean;
  }
  
  export interface DrawingConfig {
    enabled: boolean;
    tools: DrawingTool[];
    style: LayerStyle;
    snapTolerance: number;
  }
  
  export type DrawingTool = 'point' | 'line' | 'polygon' | 'circle' | 'rectangle';
  
  export const MAP_CONFIG: {
    projection: string;
    extent: [number, number, number, number];
    layers: LayerConfig[];
    controls: MapControls;
    drawing: DrawingConfig;
  } = {
    projection: 'EPSG:26191',
    extent: [400000, 300000, 700000, 500000], // Étendue du Maroc Oriental
    layers: [
      {
        id: 'base-osm',
        name: 'OpenStreetMap',
        type: 'tile',
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        visible: true,
        opacity: 1,
        attribution: '© OpenStreetMap contributors'
      },
      {
        id: 'parcelles-tnb',
        name: 'Parcelles TNB',
        type: 'vector',
        visible: true,
        opacity: 0.8,
        style: {
          fill: { color: '#3498db', opacity: 0.3 },
          stroke: { color: '#2980b9', width: 2, opacity: 1 }
        },
        queryable: true
      },
      {
        id: 'limites-administratives',
        name: 'Limites administratives',
        type: 'wms',
        url: 'http://localhost:8080/geoserver/tnb/wms',
        visible: false,
        opacity: 0.7,
        style: {
          stroke: { color: '#e74c3c', width: 3, opacity: 1 }
        }
      }
    ],
    controls: {
      zoom: true,
      rotate: true,
      attribution: true,
      scaleLine: true,
      fullScreen: true,
      mousePosition: true,
      overviewMap: false
    },
    drawing: {
      enabled: true,
      tools: ['polygon', 'rectangle', 'circle'],
      style: {
        fill: { color: '#e67e22', opacity: 0.3 },
        stroke: { color: '#d35400', width: 3, opacity: 1 }
      },
      snapTolerance: 10
    }
  };