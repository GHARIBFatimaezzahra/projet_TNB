import { IsString, IsNotEmpty, IsInt, IsDateString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  typeDoc: string; // Type de document

  @IsString()
  @IsNotEmpty()
  cheminFichier: string; // Chemin d'accès ou lien du fichier

  @IsInt()
  @IsNotEmpty()
  parcelleId: number; // Référence de la parcelle concernée

  @IsDateString()
  @IsNotEmpty()
  dateAjout: string; // Date d'ajout du document
}
