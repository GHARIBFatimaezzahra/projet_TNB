export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
    meta?: {
      timestamp: Date;
      requestId?: string;
      version?: string;
    };
  }
  
  export interface ErrorResponse {
    success: false;
    error: {
      code: string;
      message: string;
      details?: any;
    };
    meta: {
      timestamp: Date;
      requestId?: string;
    };
  }