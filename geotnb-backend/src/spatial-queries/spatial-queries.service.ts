/* =====================================================
   SERVICE REQUÊTES SPATIALES - POSTGIS
   ===================================================== */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parcelle } from '../parcelle/entities/parcelle.entity';

export interface SpatialQueryResult {
  parcelles: any[];
  total: number;
  geometry: any;
  metadata: {
    queryType: 'intersection' | 'sector' | 'buffer';
    parameters: any;
    executionTime: number;
  };
}

export interface IntersectionQuery {
  geometry: string; // WKT ou GeoJSON
  srid?: number;
}

export interface SectorQuery {
  secteurId: string;
  secteurName?: string;
}

export interface BufferQuery {
  center: { x: number; y: number };
  radius: number; // en mètres
  srid?: number;
}

@Injectable()
export class SpatialQueriesService {
  constructor(
    @InjectRepository(Parcelle)
    private parcelleRepository: Repository<Parcelle>,
  ) {}

  /**
   * a) Intersection avec une emprise
   * Trouve toutes les parcelles qui coupent une zone géographique
   */
  async findParcellesByIntersection(query: IntersectionQuery): Promise<SpatialQueryResult> {
    const startTime = Date.now();
    const srid = query.srid || 26191; // Merchich/Nord Maroc par défaut

    try {
      // Requête PostGIS avec ST_Intersects
      const sql = `
        SELECT 
          p.*,
          ST_AsGeoJSON(p.geom) as geometry,
          ST_Area(p.geom) as surface,
          ST_Area(ST_Intersection(p.geom, ST_GeomFromText($1, $2))) as surface_intersection
        FROM parcelles p
        WHERE ST_Intersects(p.geom, ST_GeomFromText($1, $2))
        ORDER BY surface_intersection DESC
      `;

      const parcelles = await this.parcelleRepository.query(sql, [
        query.geometry,
        srid
      ]);

      const executionTime = Date.now() - startTime;

      return {
        parcelles,
        total: parcelles.length,
        geometry: query.geometry,
        metadata: {
          queryType: 'intersection',
          parameters: { geometry: query.geometry, srid },
          executionTime
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la requête d'intersection: ${error.message}`);
    }
  }

  /**
   * b) Sélection par secteur (commune)
   * Trouve toutes les parcelles dans un secteur administratif
   */
  async findParcellesBySector(query: SectorQuery): Promise<SpatialQueryResult> {
    const startTime = Date.now();

    try {
      // Requête PostGIS avec ST_Within
      const sql = `
        SELECT 
          p.*,
          ST_AsGeoJSON(p.geom) as geometry,
          ST_Area(p.geom) as surface,
          c.nom as commune_nom
        FROM parcelles p
        INNER JOIN "Communes_Casablanca" c ON ST_Within(p.geom, c.geom)
        WHERE c.id = $1 OR c.nom ILIKE $2
        ORDER BY p.reference_fonciere
      `;

      const parcelles = await this.parcelleRepository.query(sql, [
        query.secteurId,
        `%${query.secteurName || query.secteurId}%`
      ]);

      const executionTime = Date.now() - startTime;

      return {
        parcelles,
        total: parcelles.length,
        geometry: null,
        metadata: {
          queryType: 'sector',
          parameters: query,
          executionTime
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la requête par secteur: ${error.message}`);
    }
  }

  /**
   * c) Rayon de distance (buffer)
   * Trouve toutes les parcelles dans un rayon autour d'un point
   */
  async findParcellesByBuffer(query: BufferQuery): Promise<SpatialQueryResult> {
    const startTime = Date.now();
    const srid = query.srid || 26191;

    try {
      // Requête PostGIS avec ST_DWithin
      const sql = `
        SELECT 
          p.*,
          ST_AsGeoJSON(p.geom) as geometry,
          ST_Area(p.geom) as surface,
          ST_Distance(p.geom, ST_SetSRID(ST_Point($1, $2), $3)) as distance_center
        FROM parcelles p
        WHERE ST_DWithin(p.geom, ST_SetSRID(ST_Point($1, $2), $3), $4)
        ORDER BY distance_center ASC
      `;

      const parcelles = await this.parcelleRepository.query(sql, [
        query.center.x,
        query.center.y,
        srid,
        query.radius
      ]);

      const executionTime = Date.now() - startTime;

      return {
        parcelles,
        total: parcelles.length,
        geometry: {
          type: 'Point',
          coordinates: [query.center.x, query.center.y],
          radius: query.radius
        },
        metadata: {
          queryType: 'buffer',
          parameters: query,
          executionTime
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la requête par buffer: ${error.message}`);
    }
  }

  /**
   * Requête avancée : Parcelles près d'un équipement (hôtel)
   */
  async findParcellesNearHotel(hotelId: string, radius: number = 1000): Promise<SpatialQueryResult> {
    const startTime = Date.now();

    try {
      const sql = `
        SELECT 
          p.*,
          ST_AsGeoJSON(p.geom) as geometry,
          ST_Area(p.geom) as surface,
          h.nom as hotel_nom,
          ST_Distance(p.geom, h.geom) as distance_hotel
        FROM parcelles p
        CROSS JOIN "Hotels_wgs" h
        WHERE h.id = $1 
        AND ST_DWithin(p.geom, h.geom, $2)
        ORDER BY distance_hotel ASC
      `;

      const parcelles = await this.parcelleRepository.query(sql, [hotelId, radius]);

      const executionTime = Date.now() - startTime;

      return {
        parcelles,
        total: parcelles.length,
        geometry: null,
        metadata: {
          queryType: 'buffer',
          parameters: { hotelId, radius },
          executionTime
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la requête près d'un hôtel: ${error.message}`);
    }
  }

  /**
   * Requête avancée : Parcelles le long d'une voie
   */
  async findParcellesAlongRoad(roadId: string, buffer: number = 100): Promise<SpatialQueryResult> {
    const startTime = Date.now();

    try {
      const sql = `
        SELECT 
          p.*,
          ST_AsGeoJSON(p.geom) as geometry,
          ST_Area(p.geom) as surface,
          v.nom as voie_nom,
          ST_Distance(p.geom, v.geom) as distance_voie
        FROM parcelles p
        CROSS JOIN voirie v
        WHERE v.id = $1 
        AND ST_DWithin(p.geom, v.geom, $2)
        ORDER BY distance_voie ASC
      `;

      const parcelles = await this.parcelleRepository.query(sql, [roadId, buffer]);

      const executionTime = Date.now() - startTime;

      return {
        parcelles,
        total: parcelles.length,
        geometry: null,
        metadata: {
          queryType: 'buffer',
          parameters: { roadId, buffer },
          executionTime
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la requête le long d'une voie: ${error.message}`);
    }
  }

  /**
   * Obtenir la liste des communes disponibles
   */
  async getAvailableCommunes(): Promise<any[]> {
    try {
      const sql = `
        SELECT 
          id,
          nom,
          ST_AsGeoJSON(ST_Centroid(geom)) as centroid,
          ST_Area(geom) as surface
        FROM "Communes_Casablanca"
        ORDER BY nom
      `;

      return await this.parcelleRepository.query(sql);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des communes: ${error.message}`);
    }
  }

  /**
   * Obtenir la liste des hôtels disponibles
   */
  async getAvailableHotels(): Promise<any[]> {
    try {
      const sql = `
        SELECT 
          id,
          nom,
          ST_AsGeoJSON(geom) as geometry,
          ST_X(geom) as longitude,
          ST_Y(geom) as latitude
        FROM "Hotels_wgs"
        ORDER BY nom
      `;

      return await this.parcelleRepository.query(sql);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des hôtels: ${error.message}`);
    }
  }

  /**
   * Obtenir la liste des voies disponibles
   */
  async getAvailableRoads(): Promise<any[]> {
    try {
      const sql = `
        SELECT 
          id,
          nom,
          ST_AsGeoJSON(geom) as geometry,
          ST_Length(geom) as longueur
        FROM voirie
        ORDER BY nom
      `;

      return await this.parcelleRepository.query(sql);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des voies: ${error.message}`);
    }
  }

  /**
   * Statistiques des résultats de requête spatiale
   */
  async getSpatialQueryStats(result: SpatialQueryResult): Promise<any> {
    if (result.parcelles.length === 0) {
      return {
        totalParcelles: 0,
        totalSurface: 0,
        surfaceMoyenne: 0,
        parcellesParStatut: {},
        parcellesParZonage: {}
      };
    }

    const totalSurface = result.parcelles.reduce((sum, p) => sum + (p.surface || 0), 0);
    const surfaceMoyenne = totalSurface / result.parcelles.length;

    const parcellesParStatut = result.parcelles.reduce((acc, p) => {
      const statut = p.statut_foncier || 'Inconnu';
      acc[statut] = (acc[statut] || 0) + 1;
      return acc;
    }, {});

    const parcellesParZonage = result.parcelles.reduce((acc, p) => {
      const zonage = p.zone_urbanistique || 'Inconnu';
      acc[zonage] = (acc[zonage] || 0) + 1;
      return acc;
    }, {});

    return {
      totalParcelles: result.parcelles.length,
      totalSurface: Math.round(totalSurface),
      surfaceMoyenne: Math.round(surfaceMoyenne),
      parcellesParStatut,
      parcellesParZonage,
      executionTime: result.metadata.executionTime
    };
  }
}