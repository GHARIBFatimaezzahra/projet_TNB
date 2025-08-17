export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
  pagination?: PaginationMeta;
  errors?: ApiError[];
}

export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Export déplacé vers pagination.model.ts pour éviter la duplication
// export interface PaginationParams {
//   page: number;
//   size: number;
//   sortBy?: string;
//   sortDirection?: 'asc' | 'desc';
// }

export interface ApiError {
  field?: string;
  code: string;
  message: string;
  details?: any;
}

export interface SearchCriteria {
  [key: string]: any;
}

export interface FilterCriteria {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
  value: any;
  value2?: any; // Pour l'opérateur 'between'
}