export interface NotificationTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
    type: 'EMAIL' | 'SMS' | 'SYSTEM';
  }
  
  export interface NotificationData {
    templateId: string;
    recipient: string;
    variables: Record<string, any>;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    scheduledFor?: Date;
  }