import { IsNotEmpty, IsObject, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FeatureCollection } from 'geojson';

export enum MappingStrategy {
  AUTO = 'auto',
  MANUAL = 'manual',
  TEMPLATE = 'template'
}

export class ImportGeojsonDto {
  @ApiProperty({ 
    description: 'Données GeoJSON à importer',
    example: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            reference: 'TF123456',
            surface: 1500,
            zonage: 'ZR1'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
          }
        }
      ]
    }
  })
  @IsNotEmpty()
  @IsObject()
  geojsonData: FeatureCollection;

  @ApiProperty({ enum: MappingStrategy, example: MappingStrategy.AUTO })
  @IsEnum(MappingStrategy)
  mappingStrategy: MappingStrategy;

  @ApiProperty({ 
    description: 'Configuration du mapping des champs',
    required: false,
    example: {
      'reference_fonciere': 'reference',
      'surface_totale': 'surface',
      'zonage': 'zonage'
    }
  })
  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @ApiProperty({ example: 'Import GeoJSON - Parcelles 2024' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, description: 'Valider les données avant import' })
  @IsOptional()
  validateData?: boolean = true;

  @ApiProperty({ example: false, description: 'Mode simulation (aperçu sans sauvegarde)' })
  @IsOptional()
  dryRun?: boolean = false;
}