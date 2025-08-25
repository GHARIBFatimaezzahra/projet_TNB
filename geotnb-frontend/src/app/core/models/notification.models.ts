export interface NotificationConfig {
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number; // en millisecondes
    persistent?: boolean; // ne se ferme pas automatiquement
    position?: NotificationPosition;
    actions?: NotificationAction[];
    data?: Record<string, any>;
    dismissible?: boolean;
    showCloseButton?: boolean;
    template?: string; // pour notifications personnalisées
  }
  
  export interface NotificationAction {
    text: string;
    action: () => void;
    style?: 'primary' | 'accent' | 'warn' | 'basic';
    icon?: string;
    disabled?: boolean;
  }
  
  export interface NotificationPosition {
    horizontal: 'start' | 'center' | 'end' | 'left' | 'right';
    vertical: 'top' | 'bottom';
  }
  
  export interface NotificationTemplate {
    id: string;
    name: string;
    template: string;
    variables: NotificationVariable[];
    defaultType: 'success' | 'error' | 'warning' | 'info';
  }
  
  export interface NotificationVariable {
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    required: boolean;
    defaultValue?: any;
    description?: string;
  }
  
  export interface NotificationHistory {
    id: string;
    config: NotificationConfig;
    timestamp: Date;
    userId?: number;
    read: boolean;
    dismissed: boolean;
    interacted: boolean;
  }
  
  export interface NotificationPreferences {
    userId: number;
    enableBrowser: boolean;
    enableEmail: boolean;
    enableSMS: boolean;
    types: {
      success: boolean;
      error: boolean;
      warning: boolean;
      info: boolean;
    };
    categories: {
      workflow: boolean;
      parcelles: boolean;
      fiches: boolean;
      system: boolean;
      audit: boolean;
    };
    quietHours?: {
      enabled: boolean;
      start: string; // HH:mm
      end: string; // HH:mm
    };
  }