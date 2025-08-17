// ===== 📁 src/app/core/models/interfaces/geometry.interface.ts =====

/**
 * Point géographique avec coordonnées 2D ou 3D
 */
export interface Point {
  x: number;
  y: number;
  z?: number;
  m?: number; // Mesure (pour les coordonnées 4D)
}

/**
 * Alias pour Point pour compatibilité
 */
export interface Coordinate extends Point {
  // Hérite de Point
}

/**
 * Boîte englobante (bounding box)
 */
export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  minZ?: number;
  maxZ?: number;
}

/**
 * Étendue géographique avec informations supplémentaires
 */
export interface Extent extends BoundingBox {
  crs?: string; // Système de coordonnées (ex: "EPSG:26191")
  area?: number; // Surface en m²
  perimeter?: number; // Périmètre en m
}

/**
 * Types de géométrie supportés
 */
export enum GeometryType {
  POINT = 'Point',
  LINE_STRING = 'LineString',
  POLYGON = 'Polygon',
  MULTI_POINT = 'MultiPoint',
  MULTI_LINE_STRING = 'MultiLineString',
  MULTI_POLYGON = 'MultiPolygon',
  GEOMETRY_COLLECTION = 'GeometryCollection',
  CIRCLE = 'Circle', // Extension pour les cercles
  RECTANGLE = 'Rectangle' // Extension pour les rectangles
}

/**
 * Système de référence de coordonnées
 */
export interface CoordinateReferenceSystem {
  type: 'name' | 'EPSG' | 'proj4';
  properties: {
    name?: string; // ex: 'EPSG:26191' pour Lambert Maroc Nord
    code?: number; // ex: 26191
    proj4?: string; // Définition proj4
  };
}

/**
 * Géométrie de base (format GeoJSON)
 */
export interface Geometry {
  type: GeometryType;
  coordinates?: number[] | number[][] | number[][][] | number[][][][];
  crs?: CoordinateReferenceSystem;
  bbox?: number[]; // [minX, minY, maxX, maxY]
}

/**
 * Géométries spécifiques
 */
export interface PointGeometry {
  type: GeometryType.POINT;
  coordinates: number[]; // [x, y] ou [x, y, z]
  crs?: CoordinateReferenceSystem;
  bbox?: number[];
}

export interface LineStringGeometry {
  type: GeometryType.LINE_STRING;
  coordinates: number[][]; // [[x, y], [x, y], ...]
  crs?: CoordinateReferenceSystem;
  bbox?: number[];
}

export interface PolygonGeometry {
  type: GeometryType.POLYGON;
  coordinates: number[][][]; // [[[x, y], [x, y], ...], ...] (premier = extérieur, suivants = trous)
  crs?: CoordinateReferenceSystem;
  bbox?: number[];
}

export interface MultiPointGeometry {
  type: GeometryType.MULTI_POINT;
  coordinates: number[][];
  crs?: CoordinateReferenceSystem;
  bbox?: number[];
}

export interface MultiLineStringGeometry {
  type: GeometryType.MULTI_LINE_STRING;
  coordinates: number[][][];
  crs?: CoordinateReferenceSystem;
  bbox?: number[];
}

export interface MultiPolygonGeometry {
  type: GeometryType.MULTI_POLYGON;
  coordinates: number[][][][];
  crs?: CoordinateReferenceSystem;
  bbox?: number[];
}

export interface GeometryCollection {
  type: GeometryType.GEOMETRY_COLLECTION;
  geometries: Geometry[];
  coordinates?: never; // GeometryCollection n'a pas de coordinates
  crs?: CoordinateReferenceSystem;
  bbox?: number[];
}

/**
 * Géométries étendues (non-standard GeoJSON)
 */
export interface CircleGeometry {
  type: GeometryType.CIRCLE;
  coordinates: number[]; // [centerX, centerY, radius]
  radius: number;
  crs?: CoordinateReferenceSystem;
  bbox?: number[];
}

export interface RectangleGeometry {
  type: GeometryType.RECTANGLE;
  coordinates: number[][]; // [[minX, minY], [maxX, maxY]]
  crs?: CoordinateReferenceSystem;
  bbox?: number[];
}

/**
 * Feature GeoJSON
 */
export interface Feature<T = any> {
  type: 'Feature';
  id?: string | number;
  geometry: Geometry | null;
  properties: T;
  bbox?: number[];
}

/**
 * Collection de features
 */
export interface FeatureCollection<T = any> {
  type: 'FeatureCollection';
  features: Feature<T>[];
  crs?: CoordinateReferenceSystem;
  bbox?: number[];
}

/**
 * Interface pour les entités géospatiales
 */
export interface GeospatialEntity {
  geometry: Geometry;
  centroid?: Point;
  area?: number; // Surface en m²
  perimeter?: number; // Périmètre en m
  boundingBox?: BoundingBox;
  extent?: Extent;
}

/**
 * Propriétés géométriques calculées
 */
export interface GeometryProperties {
  area: number; // m²
  perimeter: number; // m
  length?: number; // Pour les lignes
  width?: number; // Largeur
  height?: number; // Hauteur
  centroid: Point;
  boundingBox: BoundingBox;
  isValid: boolean;
  isSimple?: boolean; // Géométrie simple (sans auto-intersection)
  isClosed?: boolean; // Pour les lignes
}

/**
 * Interface spécifique pour les parcelles TNB
 */
export interface ParcelleGeometry extends GeospatialEntity {
  referenceFonciere: string;
  surfaceTotale: number; // m²
  surfaceImposable: number; // m²
  surfaceNonImposable?: number; // m² (bâti, voirie, etc.)
  precision?: number; // Précision géométrique en mètres
  sourceGeometrie: GeometrySource;
  dateRelevé?: Date;
  qualiteGeometrie: GeometryQuality;
  methodeAcquisition: AcquisitionMethod;
  coordSystem: string; // ex: "EPSG:26191"
}

/**
 * Source de la géométrie
 */
export enum GeometrySource {
  GPS = 'GPS',
  DIGITALISATION = 'Digitalisation',
  IMPORT_CADASTRE = 'Import_cadastre',
  IMPORT_SHAPEFILE = 'Import_shapefile',
  IMPORT_GEOJSON = 'Import_geojson',
  IMPORT_DXF = 'Import_dxf',
  DESSIN_MANUAL = 'Dessin_manual',
  PHOTOGRAMMETRIE = 'Photogrammetrie',
  AUTRE = 'Autre'
}

/**
 * Qualité de la géométrie
 */
export enum GeometryQuality {
  TRES_HAUTE = 'Tres_haute', // < 10cm
  HAUTE = 'Haute', // 10cm - 50cm
  MOYENNE = 'Moyenne', // 50cm - 2m
  FAIBLE = 'Faible', // 2m - 5m
  TRES_FAIBLE = 'Tres_faible', // > 5m
  INCONNUE = 'Inconnue'
}

/**
 * Méthode d'acquisition
 */
export enum AcquisitionMethod {
  LEVER_GPS_RTK = 'Lever_GPS_RTK',
  LEVER_GPS_DGPS = 'Lever_GPS_DGPS',
  LEVER_TACHEOMETRE = 'Lever_tacheometre',
  DIGITALISATION_ORTHO = 'Digitalisation_orthophoto',
  DIGITALISATION_PLAN = 'Digitalisation_plan',
  IMPORT_CADASTRE = 'Import_cadastre',
  IMPORT_EXTERNE = 'Import_externe',
  ESTIMATION = 'Estimation'
}

/**
 * Opérations géométriques
 */
export interface GeometryOperations {
  buffer(distance: number): Geometry;
  intersection(other: Geometry): Geometry | null;
  union(other: Geometry): Geometry;
  difference(other: Geometry): Geometry | null;
  contains(point: Point): boolean;
  intersects(other: Geometry): boolean;
  distance(other: Geometry): number;
  simplify(tolerance: number): Geometry;
  validate(): boolean;
  transform(targetCRS: string): Geometry;
}

/**
 * Configuration de style pour l'affichage
 */
export interface GeometryStyle {
  fill?: {
    color: string;
    opacity: number;
  };
  stroke?: {
    color: string;
    width: number;
    opacity: number;
    dashArray?: number[];
  };
  point?: {
    radius: number;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
  };
  text?: {
    field: string;
    font: string;
    size: number;
    color: string;
    haloColor?: string;
    haloWidth?: number;
  };
}

/**
 * Layer de géométries
 */
export interface GeometryLayer {
  id: string;
  name: string;
  type: 'vector' | 'raster';
  geometries: Feature[];
  style: GeometryStyle;
  visible: boolean;
  opacity: number;
  minZoom?: number;
  maxZoom?: number;
  extent?: BoundingBox;
  crs: string;
}

/**
 * Requête spatiale
 */
export interface SpatialQuery {
  geometry: Geometry;
  operation: SpatialOperation;
  targetLayers: string[];
  buffer?: number;
  tolerance?: number;
}

/**
 * Opérations spatiales disponibles
 */
export enum SpatialOperation {
  INTERSECTS = 'intersects',
  CONTAINS = 'contains',
  WITHIN = 'within',
  TOUCHES = 'touches',
  CROSSES = 'crosses',
  OVERLAPS = 'overlaps',
  DISJOINT = 'disjoint',
  BUFFER = 'buffer',
  DISTANCE = 'distance'
}

/**
 * Résultat d'une requête spatiale
 */
export interface SpatialQueryResult {
  features: Feature[];
  totalCount: number;
  operation: SpatialOperation;
  executionTime: number;
  bbox?: BoundingBox;
}

/**
 * Configuration pour l'édition de géométries
 */
export interface GeometryEditConfig {
  allowedTypes: GeometryType[];
  snapTolerance: number;
  snapToLayers: string[];
  vertexRadius: number;
  showVertices: boolean;
  showMidpoints: boolean;
  allowSelfIntersection: boolean;
  minVertices?: number;
  maxVertices?: number;
}

/**
 * Événement d'édition de géométrie
 */
export interface GeometryEditEvent {
  type: 'create' | 'update' | 'delete' | 'vertex_add' | 'vertex_move' | 'vertex_delete';
  geometry: Geometry;
  previousGeometry?: Geometry;
  feature?: Feature;
  timestamp: Date;
}

/**
 * Validation de géométrie
 */
export interface GeometryValidation {
  isValid: boolean;
  errors: GeometryValidationError[];
  warnings: GeometryValidationWarning[];
}

export interface GeometryValidationError {
  code: string;
  message: string;
  location?: Point;
  severity: 'error' | 'warning';
}

export interface GeometryValidationWarning {
  code: string;
  message: string;
  suggestion?: string;
}

/**
 * Transformation de coordonnées
 */
export interface CoordinateTransformation {
  sourceCRS: string;
  targetCRS: string;
  accuracy?: number;
  transformationMethod?: string;
}

/**
 * Métadonnées géométriques
 */
export interface GeometryMetadata {
  created: Date;
  lastModified: Date;
  createdBy: string;
  modifiedBy?: string;
  version: number;
  source: GeometrySource;
  quality: GeometryQuality;
  precision: number;
  crs: string;
  area?: number;
  perimeter?: number;
  isValidated: boolean;
  validationDate?: Date;
  validatedBy?: string;
  comments?: string;
}

/**
 * Constantes pour le projet TNB
 */
export const TNB_GEOMETRY_CONSTANTS = {
  // Système de coordonnées du Maroc
  DEFAULT_CRS: 'EPSG:26191', // Lambert Conformal Conic Morocco
  WGS84_CRS: 'EPSG:4326',
  WEB_MERCATOR_CRS: 'EPSG:3857',
  
  // Précisions
  PRECISION_GPS_RTK: 0.03, // 3cm
  PRECISION_GPS_DGPS: 0.5, // 50cm
  PRECISION_DIGITALISATION: 2.0, // 2m
  
  // Limites
  MIN_PARCEL_AREA: 1, // 1 m²
  MAX_PARCEL_AREA: 1000000, // 1 km²
  MIN_VERTICES: 3,
  MAX_VERTICES: 1000,
  
  // Tolérances
  SNAP_TOLERANCE: 0.1, // 10cm
  SIMPLIFY_TOLERANCE: 0.05, // 5cm
  VALIDATION_TOLERANCE: 0.01, // 1cm
  
  // Buffer distances
  SMALL_BUFFER: 1, // 1m
  MEDIUM_BUFFER: 5, // 5m
  LARGE_BUFFER: 10 // 10m
} as const;

/**
 * Types utilitaires
 */
export type GeometryUnion = 
  | PointGeometry 
  | LineStringGeometry 
  | PolygonGeometry 
  | MultiPointGeometry 
  | MultiLineStringGeometry 
  | MultiPolygonGeometry 
  | GeometryCollection 
  | CircleGeometry 
  | RectangleGeometry;

export type CoordinateArray = number[] | number[][] | number[][][] | number[][][][];

export type GeometryCallback<T> = (geometry: Geometry, feature?: Feature) => T;

export type SpatialPredicate = (geometry1: Geometry, geometry2: Geometry) => boolean;