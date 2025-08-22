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
import { FicheFiscaleService } from './fiche-fiscale.service';
import { CreateFicheDto } from './dto/create-fiche.dto';
import { UpdateFicheDto } from './dto/update-fiche.dto';
import { GenerateFicheDto } from './dto/generate-fiche.dto';
import { SearchFicheDto } from './dto/search-fiche.dto';
import { AgentFiscalOrAdmin, AdminOnly } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Fiches Fiscales')
@Controller('fiches-fiscales')
@ApiBearerAuth()
export class FicheFiscaleController {
  constructor(private readonly ficheFiscaleService: FicheFiscaleService) {}

  @Post()
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Créer une nouvelle fiche fiscale' })
  @ApiResponse({ status: 201, description: 'Fiche fiscale créée avec succès' })
  create(
    @Body() createFicheDto: CreateFicheDto,
    @CurrentUser() user: User
  ) {
    return this.ficheFiscaleService.create(createFicheDto, user.id);
  }

  @Post('generate-bulk')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Générer des fiches fiscales en lot' })
  generateBulk(
    @Body() generateDto: GenerateFicheDto,
    @CurrentUser() user: User
  ) {
    return this.ficheFiscaleService.generateBulk(generateDto, user.id);
  }

  @Get()
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Liste des fiches fiscales avec recherche et pagination' })
  findAll(@Query() searchDto: SearchFicheDto) {
    return this.ficheFiscaleService.findAll(searchDto);
  }

  @Get('statistics')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Statistiques des fiches fiscales' })
  getStatistics(@Query('annee') annee?: number) {
    return this.ficheFiscaleService.getStatistics(annee);
  }

  @Get(':id')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Détails d\'une fiche fiscale' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ficheFiscaleService.findOne(id);
  }

  @Patch(':id')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Modifier une fiche fiscale' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFicheDto: UpdateFicheDto,
  ) {
    return this.ficheFiscaleService.update(id, updateFicheDto);
  }

  @Patch(':id/statut/:statut')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Mettre à jour le statut de paiement' })
  updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Param('statut') statut: string,
  ) {
    return this.ficheFiscaleService.updateStatutPayment(id, statut);
  }

  @Delete(':id')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Supprimer une fiche fiscale' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ficheFiscaleService.remove(id);
  }
}
