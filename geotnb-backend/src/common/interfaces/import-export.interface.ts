export interface ImportJob {
    id: string;
    type: 'geojson' | 'shapefile' | 'excel' | 'csv';
    fileName: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    totalRecords?: number;
    processedRecords?: number;
    errors?: string[];
    startTime: Date;
    endTime?: Date;
    createdBy: number;
  }
  
  export interface ExportOptions {
    format: 'geojson' | 'shapefile' | 'excel' | 'csv' | 'pdf';
    filters?: Record<string, any>;
    fields?: string[];
    includeGeometry?: boolean;
    projection?: string; // EPSG code
  }
  