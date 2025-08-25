// Types de réponses API standardisées
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  path?: string;
  status?: number;
}

// Réponse avec pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Réponse d'erreur détaillée
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    validation?: ValidationError[];
  };
  timestamp: string;
  path: string;
  status: number;
}

// Erreur de validation
export interface ValidationError {
  field: string;
  value: any;
  constraints: string[];
  message: string;
}

// Réponse d'upload de fichier
export interface UploadResponse {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

// Réponse d'import de données
export interface ImportResponse {
  importId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  startTime: string;
  endTime?: string;
  progress: number;
}

// Erreur d'import
export interface ImportError {
  row: number;
  field?: string;
  value?: any;
  error: string;
  severity: 'error' | 'warning';
}

// Avertissement d'import
export interface ImportWarning {
  row: number;
  field?: string;
  message: string;
}

// Réponse d'export
export interface ExportResponse {
  exportId: string;
  filename: string;
  format: string;
  size: number;
  recordCount: number;
  downloadUrl: string;
  expiresAt: string;
}

// Réponse de calcul spatial
export interface SpatialResponse {
  geometry: any;
  area?: number;
  centroid?: [number, number];
  bounds?: [number, number, number, number];
  intersections?: number;
}

// Réponse de validation
export interface ValidationResponse {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  metadata?: any;
}

// Réponse de statistiques
export interface StatsResponse {
  period: {
    start: string;
    end: string;
  };
  metrics: {
    [key: string]: number | string;
  };
  charts?: ChartData[];
  lastUpdated: string;
}

// Données de graphique
export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  labels: string[];
  datasets: ChartDataset[];
  options?: any;
}

// Dataset de graphique
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// Réponse de processus asynchrone
export interface AsyncProcessResponse {
  processId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    current: number;
    total: number;
    percentage: number;
    message?: string;
  };
  result?: any;
  error?: string;
  startTime: string;
  endTime?: string;
  estimatedCompletion?: string;
}

// Réponse de notification
export interface NotificationResponse {
  id: string;
  sent: boolean;
  recipients: string[];
  failedRecipients: string[];
  message: string;
  sentAt: string;
}

// Réponse de système
export interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: ServiceHealth[];
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    database: {
      connections: number;
      responseTime: number;
    };
  };
}

// État de service
export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

// Types utilitaires pour les requêtes
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  headers?: { [key: string]: string };
  params?: { [key: string]: any };
  timeout?: number;
  retries?: number;
}

// Filtre de recherche standard
export interface SearchFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
  value: any;
}

// Paramètres de tri
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Paramètres de requête avec pagination et tri
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: SortParams[];
  filters?: SearchFilter[];
  search?: string;
  include?: string[];
  exclude?: string[];
}