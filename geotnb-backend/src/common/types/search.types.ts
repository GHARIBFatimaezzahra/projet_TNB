import { PaginationOptions, PaginatedResult } from './pagination.types';

export interface SearchFilter {
    field: string;
    operator: 'eq' | 'ne' | 'like' | 'ilike' | 'in' | 'between' | 'gt' | 'gte' | 'lt' | 'lte' | 'isNull' | 'isNotNull';
    value: any;
  }
  
  export interface SearchQuery {
    filters: SearchFilter[];
    pagination: PaginationOptions;
    search?: string;
    searchFields?: string[];
  }
  
  export interface SearchResult<T> extends PaginatedResult<T> {
    searchTerm?: string;
    appliedFilters: SearchFilter[];
    executionTime?: number;
  }