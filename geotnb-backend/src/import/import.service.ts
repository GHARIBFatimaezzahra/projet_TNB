import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parcelle } from '../parcelle/entities/parcelle.entity';
import { Proprietaire } from '../proprietaire/entities/proprietaire.entity';
import { ImportGeojsonDto } from './dto/import-geojson.dto';
import { ImportShapefileDto } from './dto/import-shapefile.dto';
import { ImportExcelDto } from './dto/import-excel.dto';
import { ParseGeojsonUtils } from './utils/parse-geojson';
import { ParseShapefileUtils } from './utils/parse-shapefile';
import { ParseExcelUtils } from './utils/parse-excel';
import { DataValidationUtils } from './utils/data-validation.utils';

export interface ImportResult {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  errors: Array<{ row: number; field?: string; message: string }>;
  warnings: Array<{ row: number; field?: string; message: string }>;
  summary: {
    duplicates: number;
    skipped: number;
    created: number;
    updated: number;
  };
  executionTime: number;
  preview?: any[];
}

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(Parcelle)
    private parcelleRepository: Repository<Parcelle>,
    @InjectRepository(Proprietaire)
    private proprietaireRepository: Repository<Proprietaire>,
  ) {}

  async importGeojson(importDto: ImportGeojsonDto): Promise<ImportResult> {
    const startTime = Date.now();
    
    try {
      // Parse et validation des données GeoJSON
      const parsedData = ParseGeojsonUtils.parse(importDto.geojsonData);
      
      if (parsedData.validFeatures.length === 0) {
        throw new BadRequestException('Aucune feature valide trouvée');
      }

      // Génération automatique du mapping si nécessaire
      let fieldMapping = importDto.fieldMapping;
      if (importDto.mappingStrategy === 'auto') {
        fieldMapping = ParseGeojsonUtils.generateMapping(parsedData.detectedFields);
      }

      // Mode aperçu (dry run)
      if (importDto.dryRun) {
        return this.generatePreview(parsedData, fieldMapping, startTime);
      }

      // Import réel
      return await this.processGeojsonFeatures(parsedData.validFeatures, fieldMapping, startTime);
      
    } catch (error) {
      return {
        success: false,
        totalProcessed: 0,
        successCount: 0,
        errorCount: 1,
        warningCount: 0,
        errors: [{ row: 0, message: error.message }],
        warnings: [],
        summary: { duplicates: 0, skipped: 0, created: 0, updated: 0 },
        executionTime: Date.now() - startTime
      };
    }
  }

  async importShapefile(importDto: ImportShapefileDto): Promise<ImportResult> {
    const startTime = Date.now();
    
    try {
      // Décoder les fichiers base64
      const shpBuffer = Buffer.from(importDto.shpFile, 'base64');
      const dbfBuffer = Buffer.from(importDto.dbfFile, 'base64');
      
      // Parser le shapefile
      const geojsonData = await ParseShapefileUtils.parse(shpBuffer, dbfBuffer, {
        sourceCRS: importDto.sourceCRS
      });
      
      // Continuer avec le traitement GeoJSON
      const geojsonDto: ImportGeojsonDto = {
        geojsonData,
        mappingStrategy: importDto.mappingStrategy,
        fieldMapping: importDto.fieldMapping,
        description: importDto.description,
        validateData: importDto.validateData,
        dryRun: importDto.dryRun
      };
      
      return await this.importGeojson(geojsonDto);
      
    } catch (error) {
      return {
        success: false,
        totalProcessed: 0,
        successCount: 0,
        errorCount: 1,
        warningCount: 0,
        errors: [{ row: 0, message: `Erreur Shapefile: ${error.message}` }],
        warnings: [],
        summary: { duplicates: 0, skipped: 0, created: 0, updated: 0 },
        executionTime: Date.now() - startTime
      };
    }
  }

  async importExcel(importDto: ImportExcelDto): Promise<ImportResult> {
    const startTime = Date.now();
    
    try {
      // Décoder le fichier Excel
      const excelBuffer = Buffer.from(importDto.excelFile, 'base64');
      
      // Parser Excel
      const rows = ParseExcelUtils.parse(excelBuffer, {
        sheetName: importDto.sheetName,
        startRow: importDto.startRow
      });
      
      if (rows.length === 0) {
        throw new BadRequestException('Aucune donnée trouvée dans le fichier Excel');
      }

      // Mode aperçu
      if (importDto.dryRun) {
        return this.generateExcelPreview(rows, importDto, startTime);
      }

      // Import réel
      if (importDto.dataType === 'parcelles') {
        return await this.processExcelParcelles(rows, importDto, startTime);
      } else {
        return await this.processExcelProprietaires(rows, importDto, startTime);
      }
      
    } catch (error) {
      return {
        success: false,
        totalProcessed: 0,
        successCount: 0,
        errorCount: 1,
        warningCount: 0,
        errors: [{ row: 0, message: `Erreur Excel: ${error.message}` }],
        warnings: [],
        summary: { duplicates: 0, skipped: 0, created: 0, updated: 0 },
        executionTime: Date.now() - startTime
      };
    }
  }

  private async processGeojsonFeatures(features: any[], fieldMapping: Record<string, string>, startTime: number): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      totalProcessed: features.length,
      successCount: 0,
      errorCount: 0,
      warningCount: 0,
      errors: [],
      warnings: [],
      summary: { duplicates: 0, skipped: 0, created: 0, updated: 0 },
      executionTime: 0
    };

    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      try {
        // Mapper les propriétés
        const mappedData = this.mapFields(feature.properties, fieldMapping);
        mappedData.geometry = feature.geometry;

        // Valider les données
        const validation = DataValidationUtils.validateParcelleData(mappedData);
        
        if (!validation.isValid) {
          result.errorCount++;
          validation.errors.forEach(error => {
            result.errors.push({ row: i + 1, message: error });
          });
          continue;
        }

        // Ajouter les warnings
        validation.warnings.forEach(warning => {
          result.warnings.push({ row: i + 1, message: warning });
          result.warningCount++;
        });

        // Vérifier les doublons
        const existing = await this.parcelleRepository.findOne({
          where: { referenceFonciere: mappedData.reference_fonciere }
        });

        if (existing) {
          result.summary.duplicates++;
          result.warnings.push({ 
            row: i + 1, 
            message: `Référence ${mappedData.reference_fonciere} déjà existante` 
          });
          continue;
        }

        // Créer la parcelle
        const parcelle = this.parcelleRepository.create(mappedData);
        await this.parcelleRepository.save(parcelle);
        
        result.successCount++;
        result.summary.created++;

      } catch (error) {
        result.errorCount++;
        result.errors.push({ 
          row: i + 1, 
          message: `Erreur création: ${error.message}` 
        });
      }
    }

    result.success = result.errorCount === 0;
    result.executionTime = Date.now() - startTime;
    
    return result;
  }

  private async processExcelParcelles(rows: any[], importDto: ImportExcelDto, startTime: number): Promise<ImportResult> {
    // Implémentation similaire à processGeojsonFeatures mais pour Excel
    // ...
    return {
      success: true,
      totalProcessed: rows.length,
      successCount: 0,
      errorCount: 0,
      warningCount: 0,
      errors: [],
      warnings: [],
      summary: { duplicates: 0, skipped: 0, created: 0, updated: 0 },
      executionTime: Date.now() - startTime
    };
  }

  private async processExcelProprietaires(rows: any[], importDto: ImportExcelDto, startTime: number): Promise<ImportResult> {
    // Implémentation pour import de propriétaires depuis Excel
    // ...
    return {
      success: true,
      totalProcessed: rows.length,
      successCount: 0,
      errorCount: 0,
      warningCount: 0,
      errors: [],
      warnings: [],
      summary: { duplicates: 0, skipped: 0, created: 0, updated: 0 },
      executionTime: Date.now() - startTime
    };
  }

  private generatePreview(parsedData: any, fieldMapping: Record<string, string>, startTime: number): ImportResult {
    return {
      success: true,
      totalProcessed: parsedData.totalFeatures,
      successCount: parsedData.validFeatures.length,
      errorCount: parsedData.invalidFeatures.length,
      warningCount: 0,
      errors: parsedData.invalidFeatures.map((item, index) => ({
        row: index + 1,
        message: item.errors.join(', ')
      })),
      warnings: [],
      summary: { duplicates: 0, skipped: 0, created: 0, updated: 0 },
      executionTime: Date.now() - startTime,
      preview: parsedData.sampleData.slice(0, 10)
    };
  }

  private generateExcelPreview(rows: any[], importDto: ImportExcelDto, startTime: number): ImportResult {
    return {
      success: true,
      totalProcessed: rows.length,
      successCount: rows.length,
      errorCount: 0,
      warningCount: 0,
      errors: [],
      warnings: [],
      summary: { duplicates: 0, skipped: 0, created: 0, updated: 0 },
      executionTime: Date.now() - startTime,
      preview: rows.slice(0, 10)
    };
  }

  private mapFields(source: any, mapping: Record<string, string>): any {
    const mapped: any = {};
    
    Object.entries(mapping).forEach(([targetField, sourceField]) => {
      if (source[sourceField] !== undefined) {
        mapped[targetField] = source[sourceField];
      }
    });

    return mapped;
  }
}