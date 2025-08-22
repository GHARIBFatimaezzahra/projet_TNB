import {
  Controller,
  Get,
  Query,
  Param,
  Delete,
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
import { JournalActionService } from './journal-action.service';
import { SearchJournalDto } from './dto/search-journal.dto';
import { AdminOnly, AgentFiscalOrAdmin } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Journal Actions')
@Controller('journal-actions')
@ApiBearerAuth()
export class JournalActionController {
  constructor(private readonly journalActionService: JournalActionService) {}

  @Get()
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Consulter le journal des actions avec filtres' })
  findAll(@Query() searchDto: SearchJournalDto) {
    return this.journalActionService.findAll(searchDto);
  }

  @Get('statistics')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Statistiques du journal d\'actions' })
  getStatistics() {
    return this.journalActionService.getStatistics();
  }

  @Get('activity-summary')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Résumé d\'activité sur une période' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  getActivitySummary(@Query('days') days?: number) {
    return this.journalActionService.getActivitySummary(days);
  }

  @Get('entity/:table/:id')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Historique d\'une entité spécifique' })
  getEntityHistory(
    @Param('table') tableCible: string,
    @Param('id', ParseIntPipe) idCible: number,
  ) {
    return this.journalActionService.getActionsByEntity(tableCible, idCible);
  }

  @Get('user/:userId')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Activité d\'un utilisateur spécifique' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  getUserActivity(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('days') days?: number,
  ) {
    return this.journalActionService.getUserActivity(userId, days);
  }

  @Delete('cleanup')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Nettoyer les anciennes entrées du journal' })
  @ApiQuery({ name: 'days', required: false, example: 365 })
  async cleanupOldEntries(@Query('days') days?: number) {
    const deletedCount = await this.journalActionService.cleanOldEntries(days);
    return { message: `${deletedCount} entrées supprimées` };
  }
}