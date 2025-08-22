import { IsNotEmpty, IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MappingStrategy } from './import-geojson.dto';

export class ImportShapefileDto {
  @ApiProperty({ 
    description: 'Contenu du fichier .shp en base64',
    type: 'string',
    format: 'binary'
  })
  @IsNotEmpty()
  @IsString()
  shpFile: string;

  @ApiProperty({ 
    description: 'Contenu du fichier .dbf en base64',
    type: 'string',
    format: 'binary'
  })
  @IsNotEmpty()
  @IsString()
  dbfFile: string;

  @ApiProperty({ 
    description: 'Contenu du fichier .shx en base64 (optionnel)',
    type: 'string',
    format: 'binary',
    required: false
  })
  @IsOptional()
  @IsString()
  shxFile?: string;

  @ApiProperty({ 
    description: 'Contenu du fichier .prj en base64 (optionnel)',
    type: 'string',
    format: 'binary',
    required: false
  })
  @IsOptional()
  @IsString()
  prjFile?: string;

  @ApiProperty({ enum: MappingStrategy, example: MappingStrategy.AUTO })
  @IsEnum(MappingStrategy)
  mappingStrategy: MappingStrategy;

  @ApiProperty({ 
    description: 'Configuration du mapping des champs',
    required: false
  })
  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @ApiProperty({ example: 'Import Shapefile - Cadastre Oujda' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'EPSG:4326', description: 'Système de coordonnées source' })
  @IsOptional()
  @IsString()
  sourceCRS?: string = 'EPSG:4326';

  @ApiProperty({ example: true })
  @IsOptional()
  validateData?: boolean = true;

  @ApiProperty({ example: false })
  @IsOptional()
  dryRun?: boolean = false;
}