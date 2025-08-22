import {
    Controller,
    Get,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
  } from '@nestjs/swagger';
  import { DashboardService } from './dashboard.service';
  import { DashboardFilterDto } from './dto/dashboard-filter.dto';
  import { KpiRequestDto } from './dto/kpi-request.dto';
  import { AllRoles } from '../auth/roles.decorator';
  import { RolesGuard } from '../auth/roles.guard';
  
  @ApiTags('Dashboard')
  @Controller('dashboard')
  @ApiBearerAuth()
  @AllRoles()
  @UseGuards(RolesGuard)
  export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}
  
    @Get()
    @ApiOperation({ summary: 'Données complètes du tableau de bord' })
    @ApiResponse({ status: 200, description: 'Données du dashboard récupérées' })
    getDashboard(@Query() filters: DashboardFilterDto) {
      return this.dashboardService.getDashboardStats(filters);
    }
  
    @Get('kpis')
    @ApiOperation({ summary: 'Indicateurs clés de performance' })
    getKPIs(
      @Query() filters: DashboardFilterDto,
      @Query() kpiRequest: KpiRequestDto,
    ) {
      return this.dashboardService.getKPIs(filters, kpiRequest);
    }
  
    @Get('charts')
    @ApiOperation({ summary: 'Données pour les graphiques' })
    getCharts(@Query() filters: DashboardFilterDto) {
      return this.dashboardService.getChartData(filters);
    }
  
    @Get('summary')
    @ApiOperation({ summary: 'Résumé des données' })
    getSummary(@Query() filters: DashboardFilterDto) {
      return this.dashboardService.getSummary(filters);
    }
  
    @Get('comparative-analysis')
    @ApiOperation({ summary: 'Analyse comparative avec année précédente' })
    getComparativeAnalysis(@Query() filters: DashboardFilterDto) {
      return this.dashboardService.getAnalyseComparative(filters);
    }
  
    @Get('top-zones')
    @ApiOperation({ summary: 'Top zones par recettes' })
    getTopZones(@Query('limit') limit?: number) {
      return this.dashboardService.getTopZones(limit);
    }
  }