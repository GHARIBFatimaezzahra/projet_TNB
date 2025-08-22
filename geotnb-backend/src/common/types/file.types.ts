import { SearchFilter } from './search.types';

export interface FileInfo {
    originalName: string;
    fileName: string;
    path: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
    uploadedBy: number;
  }
  
  export interface ImportResult<T = any> {
    success: boolean;
    totalRecords: number;
    successfulImports: number;
    failedImports: number;
    errors: ImportError[];
    importedData?: T[];
    executionTime: number;
  }
  
  export interface ImportError {
    row: number;
    field?: string;
    message: string;
    data?: any;
  }
  
  export interface ExportOptions {
    format: 'excel' | 'csv' | 'pdf' | 'geojson' | 'shapefile';
    filters?: SearchFilter[];
    columns?: string[];
    fileName?: string;
  }