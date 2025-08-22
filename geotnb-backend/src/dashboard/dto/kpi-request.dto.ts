import { IsOptional, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KpiRequestDto {
  @ApiProperty({ 
    example: ['total_parcelles', 'recettes_prevues', 'surface_totale'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kpis?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  includeComparison?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  includeEvolution?: boolean;
}