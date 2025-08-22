import { IsOptional, IsString, IsDateString, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum PeriodType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

export class DashboardFilterDto {
  @ApiProperty({ enum: PeriodType, example: PeriodType.YEARLY, required: false })
  @IsOptional()
  @IsEnum(PeriodType)
  period?: PeriodType;

  @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiProperty({ example: 'ZR1', required: false })
  @IsOptional()
  @IsString()
  zonage?: string;

  @ApiProperty({ example: 'TF', required: false })
  @IsOptional()
  @IsString()
  statutFoncier?: string;

  @ApiProperty({ example: 'Valide', required: false })
  @IsOptional()
  @IsString()
  etatValidation?: string;

  @ApiProperty({ example: 2024, required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  annee?: number;
}