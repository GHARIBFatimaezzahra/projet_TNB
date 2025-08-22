import { PartialType } from '@nestjs/swagger';
import { CreateFicheDto } from './create-fiche.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFicheDto extends PartialType(CreateFicheDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cheminFichierPdf?: string;
}