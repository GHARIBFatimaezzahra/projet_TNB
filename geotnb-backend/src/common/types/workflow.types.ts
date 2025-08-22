export enum EtatValidation {
    BROUILLON = 'Brouillon',
    VALIDE = 'Valide',
    PUBLIE = 'Publie',
    ARCHIVE = 'Archive'
  }
  
  export interface WorkflowTransition {
    from: EtatValidation;
    to: EtatValidation;
    requiredRole: string[];
    condition?: (entity: any) => boolean;
  }
  
  export interface ValidationRule {
    field: string;
    required: boolean;
    validator?: (value: any) => boolean;
    message: string;
  }