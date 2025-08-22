import { IsOptional, IsString, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ActionType } from './create-journal.dto';

export class SearchJournalDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  utilisateurId?: number;

  @ApiProperty({ enum: ActionType, required: false })
  @IsOptional()
  @IsEnum(ActionType)
  action?: ActionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tableCible?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  idCible?: number;

  @ApiProperty({ required: false, example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({ required: false, example: 50 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'dateHeure';

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
