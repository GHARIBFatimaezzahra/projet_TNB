export interface DocumentEntity {
    typeDoc: string;
    nomFichier: string;
    cheminFichier: string;
    tailleFichier: number;
    mimeType: string;
    description?: string;
    estValide: boolean;
  }
  
  export interface FileUpload {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
    destination?: string;
    filename?: string;
    path?: string;
  }