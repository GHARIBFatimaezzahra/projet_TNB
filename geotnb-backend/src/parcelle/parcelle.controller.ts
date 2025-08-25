import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ParcelleService } from './parcelle.service';
import { CreateParcelleDto } from './dto/create-parcelle.dto';
import { UpdateParcelleDto } from './dto/update-parcelle.dto';
import { SearchParcelleDto } from './dto/search-parcelle.dto';
import { Roles, TechnicienSIGOrAdmin, AgentFiscalOrAdmin } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Parcelles')
@Controller('parcelles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ParcelleController {
  constructor(private readonly parcelleService: ParcelleService) {}
 
  @Post()
  @Roles('Admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Créer une nouvelle parcelle' })
  @ApiResponse({ status: 201, description: 'Parcelle créée avec succès' })
  @ApiResponse({ status: 409, description: 'Référence foncière déjà utilisée' })
  create(@Body() createParcelleDto: CreateParcelleDto) {
    return this.parcelleService.create(createParcelleDto);
  }

  @Get()
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Liste des parcelles avec recherche et pagination' })
  findAll(@Query() searchDto: SearchParcelleDto) {
    return this.parcelleService.findAll(searchDto);
  }

  @Get('statistics')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Statistiques des parcelles' })
  getStatistics() {
    return this.parcelleService.getStatistics();
  }

  @Get('spatial/distance')
  @TechnicienSIGOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Parcelles dans un rayon donné' })
  @ApiQuery({ name: 'longitude', type: 'number' })
  @ApiQuery({ name: 'latitude', type: 'number' })
  @ApiQuery({ name: 'distance', type: 'number' })
  findByDistance(
    @Query('longitude') longitude: number,
    @Query('latitude') latitude: number,
    @Query('distance') distance: number,
  ) {
    return this.parcelleService.findByDistance(longitude, latitude, distance);
  }

  @Get('spatial/bbox')
  @TechnicienSIGOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Parcelles dans un bounding box' })
  @ApiQuery({ name: 'minX', type: 'number' })
  @ApiQuery({ name: 'minY', type: 'number' })
  @ApiQuery({ name: 'maxX', type: 'number' })
  @ApiQuery({ name: 'maxY', type: 'number' })
  findByBoundingBox(
    @Query('minX') minX: number,
    @Query('minY') minY: number,
    @Query('maxX') maxX: number,
    @Query('maxY') maxY: number,
  ) {
    return this.parcelleService.findByBoundingBox([minX, minY, maxX, maxY]);
  }

  @Get(':id')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Détails d\'une parcelle' })
  @ApiResponse({ status: 200, description: 'Parcelle trouvée' })
  @ApiResponse({ status: 404, description: 'Parcelle introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parcelleService.findOne(id);
  }

  @Patch(':id')
  @TechnicienSIGOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Modifier une parcelle' })
  @ApiResponse({ status: 200, description: 'Parcelle modifiée' })
  @ApiResponse({ status: 404, description: 'Parcelle introuvable' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParcelleDto: UpdateParcelleDto,
  ) {
    return this.parcelleService.update(id, updateParcelleDto);
  }

  @Delete(':id')
  @TechnicienSIGOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Archiver une parcelle' })
  @ApiResponse({ status: 200, description: 'Parcelle archivée' })
  @ApiResponse({ status: 404, description: 'Parcelle introuvable' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.parcelleService.remove(id);
  }
}