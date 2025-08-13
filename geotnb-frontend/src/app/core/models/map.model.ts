export interface MapExtent {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }
  
  export interface LayerConfig {
    id: string;
    name: string;
    visible: boolean;
    opacity: number;
    zIndex: number;
    source: LayerSource;
  }
  
  export interface LayerSource {
    type: 'vector' | 'raster' | 'wms' | 'wmts';
    url?: string;
    params?: Record<string, any>;
    features?: any[];
  }
  
  export interface MapConfig {
    center: [number, number];
    zoom: number;
    projection: string;
    extent: MapExtent;
    baseLayers: LayerConfig[];
    overlayLayers: LayerConfig[];
  }