import { Geometry, Point, Polygon, MultiPolygon } from 'geojson';

export interface GeometryWithSRID extends Geometry {
  srid?: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface SpatialQuery {
  geometry?: Geometry;
  bbox?: BoundingBox;
  distance?: {
    point: [number, number];
    radius: number;
  };
}

export interface CoordinateSystemInfo {
  srid: number;
  name: string;
  proj4: string;
}

// Types spécifiques pour les parcelles TNB
export interface ParcelleGeometry {
  type: 'Polygon';
  coordinates: number[][][];
  srid: 4326;
  calculatedArea?: number;
  centroid?: [number, number];
}