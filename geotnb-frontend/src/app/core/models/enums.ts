// Énumérations utilisées dans l'application

// Profils utilisateurs (rôles)
export enum UserRole {
  ADMIN = 'Admin',
  AGENT_FISCAL = 'AgentFiscal',
  TECHNICIEN_SIG = 'TechnicienSIG',
  LECTEUR = 'Lecteur'
}

// États de validation des parcelles
export enum ValidationState {
  BROUILLON = 'Brouillon',
  VALIDE = 'Valide',
  PUBLIE = 'Publie',
  ARCHIVE = 'Archive'
}

// Statuts fonciers
export enum LandStatus {
  TF = 'TF',           // Titre Foncier
  R = 'R',             // Réquisition
  NI = 'NI',           // Non Immatriculé
  DOMANIAL = 'Domanial',
  COLLECTIF = 'Collectif'
}

// États d'occupation des terrains
export enum OccupationStatus {
  NU = 'Nu',
  CONSTRUIT = 'Construit',
  EN_CONSTRUCTION = 'En_Construction',
  PARTIELLEMENT_CONSTRUIT = 'Partiellement_Construit'
}

// Types de documents
export enum DocumentType {
  CERTIFICAT = 'Certificat',
  PHOTO = 'Photo',
  REQUISITION = 'Requisition',
  PLAN = 'Plan',
  AUTORISATION = 'Autorisation',
  AUTRE = 'Autre'
}

// Types d'actions pour l'audit
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT'
}

// Statuts de paiement des fiches fiscales
export enum PaymentStatus {
  EN_ATTENTE = 'EnAttente',
  PAYE = 'Paye',
  RETARD = 'Retard',
  ANNULE = 'Annule'
}

// Nature des propriétaires
export enum OwnerNature {
  PHYSIQUE = 'Physique',
  MORALE = 'Morale'
}

// Types de zones urbanistiques
export enum UrbanZone {
  ZONE_CENTRALE = 'Zone_Centrale',
  ZONE_PERIPHERIQUE = 'Zone_Peripherique',
  ZONE_INDUSTRIELLE = 'Zone_Industrielle',
  ZONE_AGRICOLE = 'Zone_Agricole',
  ZONE_TOURISTIQUE = 'Zone_Touristique',
  ZONE_RESIDENTIELLE = 'Zone_Residentielle'
}

// Formats d'export
export enum ExportFormat {
  EXCEL = 'excel',
  CSV = 'csv',
  PDF = 'pdf',
  GEOJSON = 'geojson',
  SHAPEFILE = 'shapefile',
  KML = 'kml'
}

// Types de requêtes spatiales
export enum SpatialOperation {
  INTERSECTS = 'intersects',
  CONTAINS = 'contains',
  WITHIN = 'within',
  TOUCHES = 'touches',
  DISTANCE = 'distance'
}

// Niveaux de sévérité
export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Types de notifications
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

// Canaux de notification
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  SYSTEM = 'system',
  PUSH = 'push'
}

// Statuts de processus
export enum ProcessStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Types de mesures géographiques
export enum MeasurementType {
  LENGTH = 'length',
  AREA = 'area',
  POINT = 'point'
}

// Unités de mesure
export enum MeasurementUnit {
  METER = 'm',
  KILOMETER = 'km',
  SQUARE_METER = 'm²',
  HECTARE = 'ha',
  SQUARE_KILOMETER = 'km²'
}

// Types de géométries
export enum GeometryType {
  POINT = 'Point',
  MULTIPOINT = 'MultiPoint',
  LINESTRING = 'LineString',
  MULTILINESTRING = 'MultiLineString',
  POLYGON = 'Polygon',
  MULTIPOLYGON = 'MultiPolygon',
  GEOMETRYCOLLECTION = 'GeometryCollection'
}

// Types de couches cartographiques
export enum LayerType {
  BASE = 'base',
  VECTOR = 'vector',
  RASTER = 'raster',
  WMS = 'wms',
  WFS = 'wfs'
}

// Types de sauvegarde
export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential'
}

// Fréquences de planification
export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

// Types de rapports
export enum ReportType {
  SITUATION_GLOBALE = 'situation_globale',
  RECETTES_PAR_ZONE = 'recettes_par_zone',
  EVOLUTION_TEMPORELLE = 'evolution_temporelle',
  PARCELLES_EXONEREES = 'parcelles_exonerees',
  RECOUVREMENT_TNB = 'recouvrement_tnb',
  STATISTIQUES_PROPRIETAIRES = 'statistiques_proprietaires'
}

// Périodes de rapport
export enum ReportPeriod {
  CURRENT_YEAR = 'current_year',
  PREVIOUS_YEAR = 'previous_year',
  CURRENT_QUARTER = 'current_quarter',
  CURRENT_MONTH = 'current_month',
  CUSTOM = 'custom'
}

// Types de workflows
export enum WorkflowType {
  VALIDATION_PARCELLE = 'validation_parcelle',
  GENERATION_FICHE = 'generation_fiche',
  TRAITEMENT_PAIEMENT = 'traitement_paiement',
  IMPORT_DONNEES = 'import_donnees'
}

// Opérateurs de filtre
export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  LIKE = 'like',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null'
}

// Directions de tri
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

// Types de graphiques
export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  AREA = 'area',
  SCATTER = 'scatter'
}

// États de santé système
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy'
}

// Niveaux de log
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

// Types de cache
export enum CacheType {
  MEMORY = 'memory',
  REDIS = 'redis',
  FILE = 'file'
}

// Environnements d'application
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test'
}

// Types de configuration
export enum ConfigType {
  DATABASE = 'database',
  EMAIL = 'email',
  SMS = 'sms',
  STORAGE = 'storage',
  SECURITY = 'security',
  FEATURES = 'features'
}