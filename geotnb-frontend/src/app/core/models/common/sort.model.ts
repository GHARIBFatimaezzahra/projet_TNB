export interface SortOption {
    field: string;
    direction: SortDirection;
    priority?: number; // Pour le tri multi-colonnes
  }
  
  export type SortDirection = 'asc' | 'desc';
  
  export interface SortConfig {
    defaultSort?: SortOption;
    allowedFields?: string[];
    multiSort?: boolean;
    maxSortFields?: number;
  }
  
  export class SortHelper {
    static createSortString(sorts: SortOption[]): string {
      return sorts
        .sort((a, b) => (a.priority || 0) - (b.priority || 0))
        .map(sort => `${sort.field}:${sort.direction}`)
        .join(',');
    }
  
    static parseSortString(sortString: string): SortOption[] {
      if (!sortString) return [];
      
      return sortString.split(',').map((sort, index) => {
        const [field, direction = 'asc'] = sort.split(':');
        return {
          field: field.trim(),
          direction: direction.trim() as SortDirection,
          priority: index
        };
      });
    }
  
    static toggleSortDirection(currentDirection: SortDirection): SortDirection {
      return currentDirection === 'asc' ? 'desc' : 'asc';
    }
  }