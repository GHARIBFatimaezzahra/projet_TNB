import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsEnum,
  IsNumber,
  MaxLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TypeDocument {
  CERTIFICAT = 'Certificat',
  PHOTO = 'Photo',
  REQUISITION = 'Requisition',
  PLAN = 'Plan',
  AUTORISATION = 'Autorisation',
  AUTRE = 'Autre'
}

export class CreateDocumentDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  parcelleId: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  proprietaireId?: number;

  @ApiProperty({ enum: TypeDocument, example: TypeDocument.CERTIFICAT })
  @IsEnum(TypeDocument)
  typeDoc: TypeDocument;

  @ApiProperty({ example: 'Certificat de propriété.pdf' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  nomFichier: string;

  @ApiProperty({ example: '/uploads/documents/cert_123.pdf' })
  @IsNotEmpty()
  @IsString()
  cheminFichier: string;

  @ApiProperty({ example: 1024567, required: false })
  @IsOptional()
  @IsNumber()
  tailleFichier?: number;

  @ApiProperty({ example: 'application/pdf', required: false })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({ example: 'Certificat de propriété pour la parcelle TF123456', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}