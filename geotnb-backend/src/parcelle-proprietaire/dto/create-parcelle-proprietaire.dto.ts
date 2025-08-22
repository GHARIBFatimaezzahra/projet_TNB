import { 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsBoolean,
  IsDateString,
  Min,
  Max,
  IsPositive
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateParcelleProprietaireDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  parcelleId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  proprietaireId: number;

  @ApiProperty({ 
    example: 0.5,
    description: 'Quote-part entre 0 et 1 (ex: 0.5 = 50%)'
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.0001, { message: 'La quote-part doit être supérieure à 0' })
  @Max(1, { message: 'La quote-part ne peut pas dépasser 1 (100%)' })
  @Transform(({ value }) => parseFloat(value))
  quotePart: number;

  @ApiProperty({ 
    example: 0,
    required: false,
    description: 'Montant individuel TNB (calculé automatiquement si non fourni)'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montantIndividuel?: number;

  @ApiProperty({ 
    example: '2024-01-01',
    required: false,
    description: 'Date de début de la propriété (aujourd\'hui par défaut)'
  })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiProperty({ 
    example: '2025-12-31',
    required: false,
    description: 'Date de fin de la propriété (null = indéfinie)'
  })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  estActif?: boolean;
}