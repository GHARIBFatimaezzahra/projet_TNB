import { IsNotEmpty, IsString, IsOptional, IsEnum, IsObject, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MappingStrategy } from './import-geojson.dto';

export class ImportExcelDto {
  @ApiProperty({ 
    description: 'Contenu du fichier Excel en base64',
    type: 'string',
    format: 'binary'
  })
  @IsNotEmpty()
  @IsString()
  excelFile: string;

  @ApiProperty({ example: 'Parcelles', description: 'Nom de la feuille à importer' })
  @IsOptional()
  @IsString()
  sheetName?: string = 'Sheet1';

  @ApiProperty({ example: 1, description: 'Ligne de début des données (1-based)' })
  @IsOptional()
  @IsNumber()
  startRow?: number = 2;

  @ApiProperty({ enum: MappingStrategy, example: MappingStrategy.AUTO })
  @IsEnum(MappingStrategy)
  mappingStrategy: MappingStrategy;

  @ApiProperty({ 
    description: 'Configuration du mapping des colonnes',
    required: false,
    example: {
      'reference_fonciere': 'A',
      'surface_totale': 'B',
      'zonage': 'C'
    }
  })
  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @ApiProperty({ example: 'Import Excel - Données propriétaires' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true })
  @IsOptional()
  validateData?: boolean = true;

  @ApiProperty({ example: false })
  @IsOptional()
  dryRun?: boolean = false;

  @ApiProperty({ 
    example: 'parcelles',
    enum: ['parcelles', 'proprietaires'],
    description: 'Type de données à importer'
  })
  @IsEnum(['parcelles', 'proprietaires'])
  dataType: 'parcelles' | 'proprietaires';
}