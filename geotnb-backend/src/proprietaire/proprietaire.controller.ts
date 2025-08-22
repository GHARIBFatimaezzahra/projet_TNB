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
import { ProprietaireService } from './proprietaire.service';
import { CreateProprietaireDto } from './dto/create-proprietaire.dto';
import { UpdateProprietaireDto } from './dto/update-proprietaire.dto';
import { SearchProprietaireDto } from './dto/search-proprietaire.dto';
import { AllRoles, AgentFiscalOrAdmin, AdminOnly } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Propriétaires')
@Controller('proprietaires')
@ApiBearerAuth()
export class ProprietaireController {
  constructor(private readonly proprietaireService: ProprietaireService) {}

  @Post()
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Créer un nouveau propriétaire' })
  @ApiResponse({ status: 201, description: 'Propriétaire créé avec succès' })
  @ApiResponse({ status: 409, description: 'CIN ou RC déjà utilisé' })
  create(@Body() createProprietaireDto: CreateProprietaireDto) {
    return this.proprietaireService.create(createProprietaireDto);
  }

  @Get()
  @AllRoles()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Liste des propriétaires avec recherche et pagination' })
  findAll(@Query() searchDto: SearchProprietaireDto) {
    return this.proprietaireService.findAll(searchDto);
  }

  @Get('statistics')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Statistiques des propriétaires' })
  getStatistics() {
    return this.proprietaireService.getStatistics();
  }

  @Get('search')
  @AllRoles()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Recherche par nom complet' })
  @ApiQuery({ name: 'q', description: 'Terme de recherche' })
  searchByName(@Query('q') searchTerm: string) {
    return this.proprietaireService.searchByFullName(searchTerm);
  }

  @Get('duplicates')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Détecter les doublons' })
  findDuplicates() {
    return this.proprietaireService.findDuplicates();
  }

  @Get(':id')
  @AllRoles()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Détails d\'un propriétaire' })
  @ApiResponse({ status: 200, description: 'Propriétaire trouvé' })
  @ApiResponse({ status: 404, description: 'Propriétaire introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proprietaireService.findOne(id);
  }

  @Patch(':id')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Modifier un propriétaire' })
  @ApiResponse({ status: 200, description: 'Propriétaire modifié' })
  @ApiResponse({ status: 404, description: 'Propriétaire introuvable' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProprietaireDto: UpdateProprietaireDto,
  ) {
    return this.proprietaireService.update(id, updateProprietaireDto);
  }

  @Delete(':id')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Désactiver un propriétaire' })
  @ApiResponse({ status: 200, description: 'Propriétaire désactivé' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proprietaireService.remove(id);
  }

  @Patch(':id/activate')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Activer un propriétaire' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.proprietaireService.activate(id);
  }

  @Patch(':id/deactivate')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Désactiver un propriétaire' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.proprietaireService.deactivate(id);
  }
}