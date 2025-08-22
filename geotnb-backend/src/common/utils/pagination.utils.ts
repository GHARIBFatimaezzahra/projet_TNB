export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }
  
  export interface PaginationResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
  
  export class PaginationUtils {
    /**
     * Calcule le skip pour la pagination
     */
    static calculateSkip(page: number, limit: number): number {
      return (page - 1) * limit;
    }
  
    /**
     * Crée un objet de résultat paginé
     */
    static createPaginationResult<T>(
      data: T[],
      total: number,
      options: PaginationOptions
    ): PaginationResult<T> {
      const totalPages = Math.ceil(total / options.limit);
      
      return {
        data,
        total,
        page: options.page,
        limit: options.limit,
        totalPages,
        hasNext: options.page < totalPages,
        hasPrev: options.page > 1,
      };
    }
  
    /**
     * Valide les paramètres de pagination
     */
    static validatePaginationParams(page: number, limit: number): { page: number; limit: number } {
      const validPage = Math.max(1, Math.floor(page) || 1);
      const validLimit = Math.min(100, Math.max(1, Math.floor(limit) || 10));
      
      return { page: validPage, limit: validLimit };
    }
  }
  