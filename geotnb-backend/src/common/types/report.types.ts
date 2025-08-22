export interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    type: 'PARCELLES' | 'PROPRIETAIRES' | 'FISCAL' | 'STATISTIQUES';
    parameters: ReportParameter[];
    query: string;
    format: 'PDF' | 'EXCEL' | 'CSV';
  }
  
  export interface ReportParameter {
    name: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'select' | 'multiselect';
    required: boolean;
    defaultValue?: any;
    options?: { value: any; label: string }[];
  }
  
  export interface ReportRequest {
    templateId: string;
    parameters: Record<string, any>;
    format?: 'PDF' | 'EXCEL' | 'CSV';
    fileName?: string;
  }