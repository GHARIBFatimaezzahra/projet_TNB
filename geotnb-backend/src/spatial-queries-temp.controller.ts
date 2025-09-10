/* =====================================================
   CONTRÔLEUR TEMPORAIRE REQUÊTES SPATIALES
   ===================================================== */

import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parcelle } from './parcelle/entities/parcelle.entity';

@ApiTags('Spatial Queries (Temporaire)')
@Controller('spatial-queries')
export class SpatialQueriesTempController {
  constructor(
    @InjectRepository(Parcelle)
    private readonly parcelleRepository: Repository<Parcelle>
  ) {}

  @Get('test')
  @Public()
  @ApiOperation({ summary: 'Test de connectivité spatial-queries' })
  testConnection() {
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

  @Get('diagnostic')
  @Public()
  @ApiOperation({ summary: 'Diagnostic des tables disponibles' })
  async diagnostic() {
    try {
      // Lister toutes les tables de la base de données
      const tables = await this.parcelleRepository.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      return {
        success: true,
        data: {
          tables: tables.map(t => t.table_name),
          totalTables: tables.length,
          message: 'Tables disponibles dans la base de données'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du diagnostic',
        error: error.message
      };
    }
  }

  @Get('communes')
  @Public()
  @ApiOperation({ summary: 'Liste des communes disponibles' })
  async getCommunes() {
    try {
      // D'abord, chercher toutes les tables contenant "commune" dans le nom
      const communeTables = await this.parcelleRepository.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND LOWER(table_name) LIKE '%commune%'
        ORDER BY table_name
      `);

      if (communeTables.length === 0) {
        return {
          success: false,
          message: 'Aucune table de communes trouvée',
          suggestion: 'Vérifiez que la table des communes existe dans la base de données'
        };
      }

      // Essayer chaque table trouvée
      for (const table of communeTables) {
        try {
          const tableName = table.table_name;
          console.log(`Tentative avec la table: ${tableName}`);
          
          const communes = await this.parcelleRepository.query(`
            SELECT
              id,
              "COMMUNE_AR" as nom,
              geom,
              "PREFECTURE" as prefecture,
              numero,
              "PLAN_AMENA" as plan_amena
            FROM "${tableName}"
            ORDER BY "COMMUNE_AR"
          `);

          return {
            success: true,
            data: communes,
            message: `Trouvé ${communes.length} communes dans la table ${tableName}`,
            tableUsed: tableName
          };
        } catch (error) {
          console.log(`Erreur avec la table ${table.table_name}:`, error.message);
          continue;
        }
      }

      return {
        success: false,
        message: 'Aucune table de communes accessible trouvée',
        availableTables: communeTables.map(t => t.table_name),
        suggestion: 'Vérifiez les permissions et la structure des tables'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du chargement des communes',
        error: error.message
      };
    }
  }

  @Get('hotels')
  @Public()
  @ApiOperation({ summary: 'Liste des hôtels disponibles' })
  async getHotels() {
    try {
      const hotels = await this.parcelleRepository.query(`
        SELECT
          id,
          "HOTEL" as nom,
          geom,
          "NUMERO" as numero,
          "CATÉGORIE" as categorie,
          "ADRESSE" as adresse
        FROM "Hotels_wgs"
        ORDER BY "HOTEL"
      `);
      
      return {
        success: true,
        data: hotels,
        message: `Trouvé ${hotels.length} hôtels`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du chargement des hôtels',
        error: error.message
      };
    }
  }

  @Get('roads')
  @Public()
  @ApiOperation({ summary: 'Liste des voies disponibles' })
  async getRoads() {
    try {
      const roads = await this.parcelleRepository.query(`
        SELECT
          id,
          "NOM" as nom,
          geom,
          "LENGTH" as length
        FROM "voirie"
        ORDER BY "NOM"
      `);

      return {
        success: true,
        data: roads,
        message: `Trouvé ${roads.length} voies`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du chargement des voies',
        error: error.message
      };
    }
  }

  @Post('intersection')
  @Public()
  @ApiOperation({ summary: 'Requête d\'intersection avec une emprise' })
  async executeIntersectionQuery(@Body() query: any) {
    try {
      const { geometry, filters = {} } = query;
      
      if (!geometry) {
        return {
          success: false,
          message: 'Géométrie requise pour la requête d\'intersection'
        };
      }

      // Construire la requête SQL avec filtres optionnels
      let whereClause = 'WHERE ST_Intersects(geometry, ST_GeomFromText($1, 4326))';
      const params = [geometry];
      let paramIndex = 2;

      if (filters.statutFoncier) {
        whereClause += ` AND "statut_foncier" = $${paramIndex}`;
        params.push(filters.statutFoncier);
        paramIndex++;
      }

      if (filters.zonage) {
        whereClause += ` AND "zonage" = $${paramIndex}`;
        params.push(filters.zonage);
        paramIndex++;
      }

      if (filters.surfaceMin) {
        whereClause += ` AND ST_Area(geometry) >= $${paramIndex}`;
        params.push(filters.surfaceMin);
        paramIndex++;
      }

      const parcelles = await this.parcelleRepository.query(`
        SELECT 
          id,
          "reference_fonciere" as "referenceFonciere",
          "statut_foncier" as "statutFoncier",
          "zonage" as "zoneUrbanistique",
          "surface_totale" as "surfaceTotale",
          "surface_imposable" as "surfaceImposable",
          "montant_total_tnb" as "montantTotalTnb",
          "prix_unitaire_m2" as "prixUnitaireM2",
          "categorie_fiscale" as "categorieFiscale",
          "exonere_tnb" as "exonereTnb",
          ST_AsGeoJSON(geometry) as geometry,
          'existing' as source_type
        FROM parcelles 
        ${whereClause}
        ORDER BY "reference_fonciere"
      `, params);

      return {
        success: true,
        data: {
          parcelles,
          total: parcelles.length,
          geometry: geometry,
          metadata: {
            queryType: 'intersection',
            parameters: query,
            executionTime: 0,
            existingParcelles: parcelles.length,
            temporaryParcelles: 0
          }
        },
        message: `Trouvé ${parcelles.length} parcelles intersectées`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de l\'exécution de la requête d\'intersection',
        error: error.message
      };
    }
  }
}
