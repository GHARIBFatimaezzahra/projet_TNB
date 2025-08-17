export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: ApiError[];
    meta?: ResponseMeta;
    timestamp: string;
    path: string;
  }
  
  export interface ApiError {
    field?: string;
    message: string;
    code: string;
  }
  
  export interface ResponseMeta {
    requestId: string;
    version: string;
    [key: string]: any;
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    meta: PaginationMeta;
  }
  
  export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }