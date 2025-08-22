import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { StatutPayment } from './create-fiche.dto';

export class SearchFicheDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  codeUnique?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  annee?: number;

  @ApiProperty({ enum: StatutPayment, required: false })
  @IsOptional()
  @IsEnum(StatutPayment)
  statutPayment?: StatutPayment;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateGenerationDebut?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateGenerationFin?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'dateGeneration';

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}