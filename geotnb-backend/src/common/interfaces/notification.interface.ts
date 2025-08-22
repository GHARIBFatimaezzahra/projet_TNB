export interface NotificationEntity {
    type: 'email' | 'sms' | 'push' | 'system';
    destinataire: string;
    sujet?: string;
    message: string;
    statut: 'pending' | 'sent' | 'failed';
    dateEnvoi?: Date;
    tentatives: number;
    erreur?: string;
  }
  
  export interface NotificationTemplate {
    nom: string;
    type: 'email' | 'sms';
    sujet?: string;
    contenu: string;
    variables: string[];
  }