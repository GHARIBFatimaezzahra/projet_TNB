import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { StatutFoncier, StatutOccupation, EtatValidation } from './create-parcelle.dto';

export class SearchParcelleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceFonciere?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zonage?: string;

  @ApiProperty({ enum: StatutFoncier, required: false })
  @IsOptional()
  @IsEnum(StatutFoncier)
  statutFoncier?: StatutFoncier;

  @ApiProperty({ enum: StatutOccupation, required: false })
  @IsOptional()
  @IsEnum(StatutOccupation)
  statutOccupation?: StatutOccupation;

  @ApiProperty({ enum: EtatValidation, required: false })
  @IsOptional()
  @IsEnum(EtatValidation)
  etatValidation?: EtatValidation;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  exonereTnb?: boolean;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'dateCreation';

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}