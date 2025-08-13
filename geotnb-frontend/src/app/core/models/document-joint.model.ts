import { TypeDocument } from './enums/type-document.enum';
import { Parcelle } from './parcelle.model';

export interface DocumentJoint {
  id: number;
  parcelleId: number;
  typeDoc: TypeDocument;
  cheminFichier: string;
  nomFichier: string;
  tailleFichier: number;
  mimeType: string;
  dateAjout: Date;
  
  // Relations
  parcelle?: Parcelle;
}

export interface CreateDocumentJointDto {
  parcelleId: number;
  typeDoc: TypeDocument;
  nomFichier: string;
  tailleFichier: number;
  mimeType: string;
}