// Type de base pour toutes les géométries
export interface GeoJSONGeometry {
  type: string;
  coordinates: any;
}

// Point
export interface Point extends GeoJSONGeometry {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// MultiPoint
export interface MultiPoint extends GeoJSONGeometry {
  type: 'MultiPoint';
  coordinates: [number, number][];
}

// LineString
export interface LineString extends GeoJSONGeometry {
  type: 'LineString';
  coordinates: [number, number][];
}

// MultiLineString
export interface MultiLineString extends GeoJSONGeometry {
  type: 'MultiLineString';
  coordinates: [number, number][][];
}

// Polygon
export interface Polygon extends GeoJSONGeometry {
  type: 'Polygon';
  coordinates: [number, number][][]; // Premier anneau = extérieur, autres = trous
}

// MultiPolygon
export interface MultiPolygon extends GeoJSONGeometry {
  type: 'MultiPolygon';
  coordinates: [number, number][][][];
}

// GeometryCollection
export interface GeometryCollection {
  type: 'GeometryCollection';
  geometries: Array<Point | LineString | Polygon | MultiPolygon>;
  coordinates?: never; // GeometryCollection n'a pas de coordinates
}

// Union de tous les types de géométrie
export type Geometry = Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon | GeometryCollection;

// Feature GeoJSON
export interface Feature<G extends Geometry = Geometry, P = any> {
  type: 'Feature';
  geometry: G | null;
  properties: P;
  id?: string | number;
}

// FeatureCollection
export interface FeatureCollection<G extends Geometry = Geometry, P = any> {
  type: 'FeatureCollection';
  features: Feature<G, P>[];
}

// Types spécifiques au projet TNB
export interface ParcelleGeometry extends Polygon {
  // Géométrie spécifique aux parcelles (toujours des polygones)
}

export interface ZoneGeometry extends MultiPolygon {
  // Géométrie spécifique aux zones (peuvent être multipolygones)
}

// Propriétés d'une feature Parcelle
export interface ParcelleFeatureProperties {
  id: number;
  reference_fonciere: string;
  surface_totale?: number;
  surface_imposable?: number;
  montant_total_tnb: number;
  etat_validation: string;
  zonage?: string;
  statut_foncier?: string;
  exonere_tnb: boolean;
  proprietaires?: string;
  nombre_proprietaires?: number;
}

// Propriétés d'une feature Zone
export interface ZoneFeatureProperties {
  id: number;
  code_zone: string;
  nom_zone: string;
  couleur_carte: string;
  tarif_unitaire?: number;
  nombre_parcelles?: number;
  surface_totale?: number;
}

// Types de features typées
export type ParcelleFeature = Feature<ParcelleGeometry, ParcelleFeatureProperties>;
export type ZoneFeature = Feature<ZoneGeometry, ZoneFeatureProperties>;

// FeatureCollections typées
export type ParcelleFeatureCollection = FeatureCollection<ParcelleGeometry, ParcelleFeatureProperties>;
export type ZoneFeatureCollection = FeatureCollection<ZoneGeometry, ZoneFeatureProperties>;

// Bounds / Emprise géographique
export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// Extent étendu avec informations de projection
export interface Extent extends Bounds {
  projection: string;
  center: [number, number];
}

// Informations spatiales calculées
export interface SpatialInfo {
  area: number; // Surface en m²
  perimeter: number; // Périmètre en m
  centroid: [number, number]; // Centre géométrique
  bounds: Bounds; // Emprise
  isValid: boolean; // Validité géométrique
  selfIntersects: boolean; // Auto-intersections
}

// Résultat de requête spatiale
export interface SpatialQueryResult {
  type: 'intersects' | 'contains' | 'within' | 'touches' | 'distance';
  features: Feature[];
  totalFound: number;
  searchGeometry: Geometry;
  searchArea?: number; // Pour les requêtes par distance
}

// Options de requête spatiale
export interface SpatialQueryOptions {
  geometry: Geometry;
  operation: 'intersects' | 'contains' | 'within' | 'touches' | 'distance';
  distance?: number; // En mètres pour l'opération distance
  buffer?: number; // Tampon en mètres
  precision?: number; // Précision des calculs
}

// Configuration de style pour OpenLayers
export interface StyleConfig {
  fill?: {
    color: string;
  };
  stroke?: {
    color: string;
    width?: number;
    lineDash?: number[];
  };
  image?: {
    circle?: {
      radius: number;
      fill?: { color: string };
      stroke?: { color: string; width?: number };
    };
    icon?: {
      src: string;
      scale?: number;
      anchor?: [number, number];
    };
  };
  text?: {
    font?: string;
    fill?: { color: string };
    stroke?: { color: string; width?: number };
    offsetX?: number;
    offsetY?: number;
  };
}

// Données de mesure
export interface MeasurementData {
  type: 'length' | 'area';
  value: number;
  unit: string;
  precision: number;
  geometry: LineString | Polygon;
}

// Coordonnées avec projection
export interface ProjectedCoordinates {
  x: number;
  y: number;
  projection: string;
}

// Transformation de coordonnées
export interface CoordinateTransform {
  source: string; // EPSG source
  target: string; // EPSG target
  coordinates: [number, number];
  transformed: [number, number];
}

// Export de données géographiques
export interface GeoExportOptions {
  format: 'geojson' | 'shapefile' | 'kml' | 'gpx' | 'geopackage';
  projection?: string;
  includeProperties: boolean;
  compress: boolean;
  filename?: string;
}

// Import de données géographiques
export interface GeoImportResult {
  success: boolean;
  featuresImported: number;
  featuresSkipped: number;
  errors: GeoImportError[];
  bounds?: Bounds;
  projection?: string;
}

// Erreur d'import géographique
export interface GeoImportError {
  feature: number;
  error: string;
  geometry?: Geometry;
  properties?: any;
}