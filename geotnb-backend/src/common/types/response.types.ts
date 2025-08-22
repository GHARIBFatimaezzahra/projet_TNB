export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: string[];
    timestamp: Date;
    path?: string;
  }
  
  export interface ErrorResponse {
    success: false;
    message: string;
    errors: string[];
    statusCode: number;
    timestamp: Date;
    path: string;
  }
  
  export interface SuccessResponse<T = any> {
    success: true;
    message?: string;
    data: T;
    timestamp: Date;
  }
  // Types pour les réponses de validation
export interface ValidationError {
    field: string;
    value: any;
    constraints: string[];
  }