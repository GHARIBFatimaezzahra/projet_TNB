import { IsNotEmpty, IsNumber, IsOptional, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateFicheDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  parcelleProprietaireIds: number[];

  @ApiProperty({ example: 2024 })
  @IsNotEmpty()
  @IsNumber()
  @Min(2020)
  @Max(2050)
  annee: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  genererPdf?: boolean;
}