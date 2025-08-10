import { StatutFoncier, StatutOccupation } from './parcelle.interface';

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
    meta?: PaginationMeta;
  }
  
  export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
  
  export interface PaginationRequest {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    filters?: Record<string, any>;
  }
  
  export interface FilterOption {
    label: string;
    value: any;
    count?: number;
  }
  
  export interface SearchFilters {
    referenceFonciere?: string;
    statutFoncier?: StatutFoncier[];
    statutOccupation?: StatutOccupation[];
    zonage?: string[];
    proprietaire?: string;
    surfaceMin?: number;
    surfaceMax?: number;
    montantMin?: number;
    montantMax?: number;
    dateDebutCreation?: Date;
    dateFinCreation?: Date;
  }