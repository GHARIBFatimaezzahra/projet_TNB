import { Geometry } from 'geojson';

export interface GeometryInterface {
  geometry: Geometry;
}

export interface SpatialEntity extends GeometryInterface {
  surfaceTotale?: number;
  surfaceImposable?: number;
  surfaceCalculee?: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface SpatialQuery {
  bbox?: BoundingBox;
  distance?: {
    point: [number, number]; // [longitude, latitude]
    radius: number; // en mètres
  };
  intersects?: Geometry;
}