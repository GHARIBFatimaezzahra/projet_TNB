import { IsNotEmpty, IsNumber, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class QuotePartItemDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  proprietaireId: number;

  @ApiProperty({ example: 0.5 })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  quotePart: number;
}

export class QuotePartDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  parcelleId: number;

  @ApiProperty({ 
    type: [QuotePartItemDto],
    description: 'Liste des propriétaires avec leurs quotes-parts'
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuotePartItemDto)
  proprietaires: QuotePartItemDto[];
}