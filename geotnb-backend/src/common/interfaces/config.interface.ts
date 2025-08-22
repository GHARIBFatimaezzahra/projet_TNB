export interface AppConfig {
    database: {
      host: string;
      port: number;
      database: string;
      synchronize: boolean;
    };
    jwt: {
      secret: string;
      expiresIn: string;
    };
    upload: {
      maxFileSize: number;
      allowedTypes: string[];
      destination: string;
    };
    fiscal: {
      tarifParDefaut: number;
      deviseSymbole: string;
      anneeFiscale: number;
    };
  }
  
  export interface ZoneConfig {
    codeZone: string;
    nomZone: string;
    description?: string;
    couleurCarte: string;
    actif: boolean;
  }