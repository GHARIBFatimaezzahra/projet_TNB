export interface ValidationRule {
    field: string;
    rule: string;
    message: string;
    value?: any;
  }
  
  export interface ValidationResult {
    isValid: boolean;
    errors: ValidationRule[];
    warnings?: ValidationRule[];
  }
  
  export interface WorkflowValidation {
    etatActuel: string;
    etatCible: string;
    autorise: boolean;
    conditions?: string[];
    actions?: string[];
  }