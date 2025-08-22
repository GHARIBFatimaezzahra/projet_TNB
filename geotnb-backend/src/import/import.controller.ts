import {
    Controller,
    Post,
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
  } from '@nestjs/swagger';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import { ImportService } from './import.service';
  import { ImportGeojsonDto } from './dto/import-geojson.dto';
  import { ImportShapefileDto } from './dto/import-shapefile.dto';
  import { ImportExcelDto } from './dto/import-excel.dto';
  import { TechnicienSIGOrAdmin } from '../auth/roles.decorator';
  import { RolesGuard } from '../auth/roles.guard';
  
  @ApiTags('Import')
  @Controller('import')
  @ApiBearerAuth()
  export class ImportController {
    constructor(private readonly importService: ImportService) {}
  
    @Post('geojson')
    @TechnicienSIGOrAdmin()
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Importer des données GeoJSON' })
    @ApiResponse({ status: 201, description: 'Import terminé avec succès' })
    @ApiResponse({ status: 400, description: 'Données invalides' })
    importGeojson(@Body() importGeojsonDto: ImportGeojsonDto) {
      return this.importService.importGeojson(importGeojsonDto);
    }
  
    @Post('shapefile')
    @TechnicienSIGOrAdmin()
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Importer un shapefile' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('files'))
    importShapefile(
      @Body() importShapefileDto: ImportShapefileDto,
      @UploadedFiles() files: Express.Multer.File[]
    ) {
      return this.importService.importShapefile(importShapefileDto);
    }
  
    @Post('excel')
    @TechnicienSIGOrAdmin()
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Importer un fichier Excel' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('files'))
    importExcel(
      @Body() importExcelDto: ImportExcelDto,
      @UploadedFiles() files: Express.Multer.File[]
    ) {
      return this.importService.importExcel(importExcelDto);
    }
  }