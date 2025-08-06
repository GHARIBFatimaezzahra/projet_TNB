import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Geometry } from 'geojson';

export class CreateParcelleDto {
  @IsString()
  referenceFonciere: string;

  @IsNumber()
  surfaceTotale: number;

  @IsNumber()
  surfaceImposable: number;

  @IsString()
  statutFoncier: string;

  @IsString()
  statutOccupation: string;

  @IsString()
  zonage: string;

  @IsString()
  categorieFiscale: string;

  @IsNumber()
  prixUnitaireM2: number;

  @IsNumber()
  montantTotalTNB: number;

  @IsBoolean()
  exonereTNB: boolean;

  @IsOptional()
  @IsDateString()
  datePermis?: string;

  @IsOptional()
  @IsNumber()
  dureeExoneration?: number;

  @ValidateNested()
  @Type(() => Object)
  geometry: Geometry;

  @IsString()
  etatValidation: string;
}
