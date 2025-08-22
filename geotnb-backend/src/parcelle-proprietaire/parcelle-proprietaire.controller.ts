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
} from '@nestjs/swagger';
import { ParcelleProprietaireService } from './parcelle-proprietaire.service';
import { CreateParcelleProprietaireDto } from './dto/create-parcelle-proprietaire.dto';
import { UpdateParcelleProprietaireDto } from './dto/update-parcelle-proprietaire.dto';
import { QuotePartDto } from './dto/quote-part.dto';
import { SearchParcelleProprietaireDto } from './dto/search-parcelle-proprietaire.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Parcelle-Propriétaire')
@Controller('parcelle-proprietaire')
@ApiBearerAuth()
export class ParcelleProprietaireController {
  constructor(private readonly parcelleProprietaireService: ParcelleProprietaireService) {}

  @Post()
  @Roles('Admin', 'AgentFiscal', 'TechnicienSIG')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Créer une relation parcelle-propriétaire' })
  @ApiResponse({ status: 201, description: 'Relation créée avec succès' })
  @ApiResponse({ status: 409, description: 'Relation déjà existante ou quote-parts invalides' })
  create(@Body() createDto: CreateParcelleProprietaireDto) {
    return this.parcelleProprietaireService.create(createDto);
  }

  @Post('quote-parts')
  @Roles('Admin', 'AgentFiscal')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Mettre à jour les quotes-parts d\'une parcelle' })
  @ApiResponse({ status: 200, description: 'Quotes-parts mises à jour' })
  @ApiResponse({ status: 400, description: 'Somme des quotes-parts invalide' })
  updateQuoteParts(@Body() quotePartDto: QuotePartDto) {
    return this.parcelleProprietaireService.updateQuoteParts(quotePartDto);
  }

  @Get()
  @Roles('Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Liste des relations parcelle-propriétaire' })
  findAll(@Query() searchDto: SearchParcelleProprietaireDto) {
    return this.parcelleProprietaireService.findAll(searchDto);
  }

  @Get('statistics')
  @Roles('Admin', 'AgentFiscal')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Statistiques des relations parcelle-propriétaire' })
  getStatistics() {
    return this.parcelleProprietaireService.getStatistics();
  }

  @Get('parcelle/:parcelleId/proprietaires')
  @Roles('Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Propriétaires d\'une parcelle' })
  getProprietairesByParcelle(
    @Param('parcelleId', ParseIntPipe) parcelleId: number,
    @Query('dateReference') dateReference?: string
  ) {
    const date = dateReference ? new Date(dateReference) : undefined;
    return this.parcelleProprietaireService.getProprietairesByParcelle(parcelleId, date);
  }

  @Get('proprietaire/:proprietaireId/parcelles')
  @Roles('Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Parcelles d\'un propriétaire' })
  getParcellesByProprietaire(
    @Param('proprietaireId', ParseIntPipe) proprietaireId: number,
    @Query('dateReference') dateReference?: string
  ) {
    const date = dateReference ? new Date(dateReference) : undefined;
    return this.parcelleProprietaireService.getParcellesByProprietaire(proprietaireId, date);
  }

  @Get(':id')
  @Roles('Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Détails d\'une relation parcelle-propriétaire' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parcelleProprietaireService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'AgentFiscal')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Modifier une relation parcelle-propriétaire' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateParcelleProprietaireDto,
  ) {
    return this.parcelleProprietaireService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('Admin', 'AgentFiscal')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Supprimer une relation parcelle-propriétaire' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.parcelleProprietaireService.remove(id);
  }
}