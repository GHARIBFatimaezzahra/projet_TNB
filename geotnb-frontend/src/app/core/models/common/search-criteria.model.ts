import { PaginationParams } from './pagination.model';

export interface SearchOptions {
  query?: string;
  fields?: string[];
  exactMatch?: boolean;
  caseSensitive?: boolean;
  filters?: SearchFilter[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pagination?: PaginationParams;
}

export interface SearchFilter {
  field: string;
  operator: SearchOperator;
  value: any;
  value2?: any; // Pour range, between
  logicalOperator?: 'AND' | 'OR';
}

export type SearchOperator = 
  | 'equals' 
  | 'notEquals'
  | 'contains' 
  | 'startsWith' 
  | 'endsWith'
  | 'greaterThan' 
  | 'greaterThanOrEqual'
  | 'lessThan' 
  | 'lessThanOrEqual'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull';

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  searchTime: number;
  query: string;
  filters: SearchFilter[];
}