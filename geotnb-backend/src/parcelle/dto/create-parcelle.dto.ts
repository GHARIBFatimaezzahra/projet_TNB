import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsEnum, 
  IsBoolean,
  IsDateString,
  Min,
  Max
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Geometry } from 'geojson';

export enum StatutFoncier {
  TF = 'TF',
  R = 'R',
  NI = 'NI',
  DOMANIAL = 'Domanial',
  COLLECTIF = 'Collectif'
}

export enum StatutOccupation {
  NU = 'Nu',
  CONSTRUIT = 'Construit',
  EN_CONSTRUCTION = 'En_Construction',
  PARTIELLEMENT_CONSTRUIT = 'Partiellement_Construit'
}

export enum EtatValidation {
  BROUILLON = 'Brouillon',
  VALIDE = 'Valide',
  PUBLIE = 'Publie',
  ARCHIVE = 'Archive'
}

export class CreateParcelleDto {
  @ApiProperty({ example: 'TF123456/78' })
  @IsNotEmpty()
  @IsString()
  referenceFonciere: string;

  @ApiProperty({ example: 1500.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  surfaceTotale?: number;

  @ApiProperty({ example: 1400.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  surfaceImposable?: number;

  @ApiProperty({ enum: StatutFoncier, example: StatutFoncier.TF })
  @IsOptional()
  @IsEnum(StatutFoncier)
  statutFoncier?: StatutFoncier;

  @ApiProperty({ enum: StatutOccupation, example: StatutOccupation.NU })
  @IsOptional()
  @IsEnum(StatutOccupation)
  statutOccupation?: StatutOccupation;

  @ApiProperty({ example: 'ZR1' })
  @IsOptional()
  @IsString()
  zonage?: string;

  @ApiProperty({ example: 'Zone résidentielle R1' })
  @IsOptional()
  @IsString()
  categorieFiscale?: string;

  @ApiProperty({ example: 12.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  prixUnitaireM2?: number;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  exonereTnb?: boolean;

  @ApiProperty({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  datePermis?: string;

  @ApiProperty({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(7)
  dureeExoneration?: number;

  @ApiProperty({ 
    description: 'Géométrie GeoJSON de la parcelle',
    example: {
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
    }
  })
  @IsOptional()
  geometry?: Geometry;

  @ApiProperty({ enum: EtatValidation, example: EtatValidation.BROUILLON })
  @IsOptional()
  @IsEnum(EtatValidation)
  etatValidation?: EtatValidation;

  @ApiProperty({ 
    description: 'Propriétaires de la parcelle avec leurs quote-parts',
    example: [
      {
        proprietaireId: 1,
        quotePart: 0.6
      },
      {
        proprietaireId: 2,
        quotePart: 0.4
      }
    ]
  })
  @IsOptional()
  proprietaires?: {
    proprietaireId: number;
    quotePart: number;
  }[];
}