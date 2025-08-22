import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { NatureProprietaire } from './create-proprietaire.dto';

export class SearchProprietaireDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cinOuRc?: string;

  @ApiProperty({ enum: NatureProprietaire, required: false })
  @IsOptional()
  @IsEnum(NatureProprietaire)
  nature?: NatureProprietaire;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  estActif?: boolean;

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
  sortBy?: string = 'dateCreation';

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}