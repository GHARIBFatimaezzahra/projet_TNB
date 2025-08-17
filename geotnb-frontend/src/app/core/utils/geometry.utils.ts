export interface Point {
    x: number;
    y: number;
    z?: number;
  }
  
  export interface Coordinate extends Point {
    // Alias pour Point pour la compatibilité
  }
  
  export interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }
  
  export interface Geometry {
    type: GeometryType;
    coordinates: number[] | number[][] | number[][][];
    crs?: CoordinateReferenceSystem;
  }
  
  export enum GeometryType {
    POINT = 'Point',
    LINE_STRING = 'LineString',
    POLYGON = 'Polygon',
    MULTI_POINT = 'MultiPoint',
    MULTI_LINE_STRING = 'MultiLineString',
    MULTI_POLYGON = 'MultiPolygon',
    GEOMETRY_COLLECTION = 'GeometryCollection'
  }
  
  export interface CoordinateReferenceSystem {
    type: 'name';
    properties: {
      name: string; // ex: 'EPSG:26191' pour Lambert Maroc Nord
    };
  }
  
  export interface Feature {
    type: 'Feature';
    id?: string | number;
    geometry: Geometry;
    properties: { [key: string]: any };
  }
  
  export interface FeatureCollection {
    type: 'FeatureCollection';
    features: Feature[];
    crs?: CoordinateReferenceSystem;
  }
  
  export interface GeospatialEntity {
    geometry: Geometry;
    centroid?: Point;
    area?: number; // en m²
    perimeter?: number; // en m
    boundingBox?: BoundingBox;
  }
  
  // Interfaces spécifiques pour les parcelles TNB
  export interface ParcelleGeometry extends GeospatialEntity {
    referenceFonciere: string;
    surfaceTotale: number;
    surfaceImposable: number;
    precision?: number; // Précision en mètres
    sourceGeometrie?: string; // GPS, Digitalisation, Import, etc.
    dateRelevé?: Date;
  }