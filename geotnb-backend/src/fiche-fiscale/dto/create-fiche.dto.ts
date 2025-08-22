import { 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsEnum,
  Min,
  Max,
  IsDateString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StatutPayment {
  EN_ATTENTE = 'EnAttente',
  PAYE = 'Paye',
  RETARD = 'Retard',
  ANNULE = 'Annule'
}

export class CreateFicheDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  parcelleProprietaireId: number;

  @ApiProperty({ example: 2024 })
  @IsNotEmpty()
  @IsNumber()
  @Min(2020)
  @Max(2050)
  annee: number;

  @ApiProperty({ example: 1500.50 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  montantTnb: number;

  @ApiProperty({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dateLimitePayment?: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montantPaye?: number;

  @ApiProperty({ enum: StatutPayment, example: StatutPayment.EN_ATTENTE, required: false })
  @IsOptional()
  @IsEnum(StatutPayment)
  statutPayment?: StatutPayment;
}