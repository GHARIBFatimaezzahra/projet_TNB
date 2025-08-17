export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, any>;
  }

  export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
  
  
  export class PaginationHelper {
    static createParams(
      page: number = 1,
      limit: number = 10,
      options?: Partial<PaginationParams>
    ): PaginationParams {
      return {
        page: Math.max(1, page),
        limit: Math.max(1, Math.min(100, limit)),
        ...options
      };
    }
  
    static createMeta(
      page: number,
      limit: number,
      total: number
    ): PaginationMeta {
      const pages = Math.ceil(total / limit);
      return {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      };
    }
  }