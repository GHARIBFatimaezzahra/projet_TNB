/* =====================================================
   CONTRÔLEUR REQUÊTES SPATIALES - API ENDPOINTS
   ===================================================== */

import { Controller, Post, Get, Body, Query, HttpException, HttpStatus, Param, Delete } from '@nestjs/common';
import { SpatialQueriesService, IntersectionQuery, SectorQuery, BufferQuery } from './spatial-queries.service';

@Controller('api/v1/spatial-queries')
export class SpatialQueriesController {
  constructor(private readonly spatialQueriesService: SpatialQueriesService) {}

  /**
   * POST /api/v1/spatial-queries/intersection
   * Requête d'intersection avec une emprise
   */
  @Post('intersection')
  async findParcellesByIntersection(@Body() query: IntersectionQuery) {
    try {
      const result = await this.spatialQueriesService.findParcellesByIntersection(query);
      const stats = await this.spatialQueriesService.getSpatialQueryStats(result);
      
      return {
        success: true,
        data: result,
        statistics: stats,
        message: `Trouvé ${result.total} parcelles intersectées`
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * POST /api/v1/spatial-queries/sector
   * Requête par secteur administratif
   */
  @Post('sector')
  async findParcellesBySector(@Body() query: SectorQuery) {
    try {
      const result = await this.spatialQueriesService.findParcellesBySector(query);
      const stats = await this.spatialQueriesService.getSpatialQueryStats(result);
      
      return {
        success: true,
        data: result,
        statistics: stats,
        message: `Trouvé ${result.total} parcelles dans le secteur ${query.secteurName || query.secteurId}`
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * POST /api/v1/spatial-queries/buffer
   * Requête par rayon de distance
   */
  @Post('buffer')
  async findParcellesByBuffer(@Body() query: BufferQuery) {
    try {
      const result = await this.spatialQueriesService.findParcellesByBuffer(query);
      const stats = await this.spatialQueriesService.getSpatialQueryStats(result);
      
      return {
        success: true,
        data: result,
        statistics: stats,
        message: `Trouvé ${result.total} parcelles dans un rayon de ${query.radius}m`
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * POST /api/v1/spatial-queries/near-hotel
   * Requête par proximité d'un hôtel
   */
  @Post('near-hotel')
  async findParcellesNearHotel(
    @Body() body: { hotelId: string; radius?: number }
  ) {
    try {
      const result = await this.spatialQueriesService.findParcellesNearHotel(
        body.hotelId, 
        body.radius || 1000
      );
      const stats = await this.spatialQueriesService.getSpatialQueryStats(result);
      
      return {
        success: true,
        data: result,
        statistics: stats,
        message: `Trouvé ${result.total} parcelles près de l'hôtel`
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * POST /api/v1/spatial-queries/along-road
   * Requête le long d'une voie
   */
  @Post('along-road')
  async findParcellesAlongRoad(
    @Body() body: { roadId: string; buffer?: number }
  ) {
    try {
      const result = await this.spatialQueriesService.findParcellesAlongRoad(
        body.roadId, 
        body.buffer || 100
      );
      const stats = await this.spatialQueriesService.getSpatialQueryStats(result);
      
      return {
        success: true,
        data: result,
        statistics: stats,
        message: `Trouvé ${result.total} parcelles le long de la voie`
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET /api/v1/spatial-queries/communes
   * Liste des communes disponibles
   */
  @Get('communes')
  async getCommunes() {
    try {
      const communes = await this.spatialQueriesService.getAvailableCommunes();
      return {
        success: true,
        data: communes,
        message: `Trouvé ${communes.length} communes`
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /api/v1/spatial-queries/hotels
   * Liste des hôtels disponibles
   */
  @Get('hotels')
  async getHotels() {
    try {
      const hotels = await this.spatialQueriesService.getAvailableHotels();
      return {
        success: true,
        data: hotels,
        message: `Trouvé ${hotels.length} hôtels`
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /api/v1/spatial-queries/roads
   * Liste des voies disponibles
   */
  @Get('roads')
  async getRoads() {
    try {
      const roads = await this.spatialQueriesService.getAvailableRoads();
      return {
        success: true,
        data: roads,
        message: `Trouvé ${roads.length} voies`
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /api/v1/spatial-queries/test
   * Test de connectivité
   */
  @Get('test')
  async testConnection() {
    return {
      success: true,
      message: 'Service de requêtes spatiales opérationnel',
      timestamp: new Date().toISOString(),
      availableQueries: [
        'intersection',
        'sector', 
        'buffer',
        'near-hotel',
        'along-road'
      ]
    };
  }

  /**
   * Ajouter une parcelle temporaire
   */
  @Post('temporary-parcelle')
  async addTemporaryParcelle(@Body() body: { sessionId: string; parcelle: any }) {
    this.spatialQueriesService.addTemporaryParcelle(body.sessionId, body.parcelle);
    return { success: true, message: 'Parcelle temporaire ajoutée' };
  }

  /**
   * Obtenir les parcelles temporaires d'une session
   */
  @Get('temporary-parcelles/:sessionId')
  async getTemporaryParcelles(@Param('sessionId') sessionId: string) {
    const parcelles = this.spatialQueriesService.getTemporaryParcellesBySession(sessionId);
    return { success: true, data: parcelles };
  }

  /**
   * Vider les parcelles temporaires d'une session
   */
  @Delete('temporary-parcelles/:sessionId')
  async clearTemporaryParcelles(@Param('sessionId') sessionId: string) {
    this.spatialQueriesService.clearTemporaryParcelles(sessionId);
    return { success: true, message: 'Parcelles temporaires supprimées' };
  }
}
