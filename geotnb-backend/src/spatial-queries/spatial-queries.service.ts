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
    existingParcelles?: number;
    temporaryParcelles?: number;
  };
}

export interface IntersectionQuery {
  geometry: string; // WKT ou GeoJSON
  srid?: number;
  filters?: {
    statutFoncier?: string;
    zonage?: string;
    surfaceMin?: number;
  };
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
  // Stockage temporaire des parcelles en cours de création
  private temporaryParcelles: Map<string, any[]> = new Map();

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
      // Construire la requête avec filtres optionnels
      let whereConditions = ['ST_Intersects(p.geom, ST_GeomFromText($1, $2))'];
      const queryParams = [query.geometry, srid];
      let paramIndex = 3;

      // Ajouter les filtres si fournis
      if (query.filters) {
        if (query.filters.statutFoncier) {
          whereConditions.push(`p.statut_foncier = $${paramIndex}`);
          queryParams.push(query.filters.statutFoncier);
          paramIndex++;
        }
        
        if (query.filters.zonage) {
          whereConditions.push(`p.zone_urbanistique = $${paramIndex}`);
          queryParams.push(query.filters.zonage);
          paramIndex++;
        }
        
        if (query.filters.surfaceMin) {
          whereConditions.push(`ST_Area(p.geom) >= $${paramIndex}`);
          queryParams.push(query.filters.surfaceMin);
          paramIndex++;
        }
      }

      // Requête principale pour les parcelles existantes
      const sql = `
        SELECT 
          p.*,
          ST_AsGeoJSON(p.geom) as geometry,
          ST_Area(p.geom) as surface,
          ST_Area(ST_Intersection(p.geom, ST_GeomFromText($1, $2))) as surface_intersection,
          'existing' as source_type
        FROM parcelles p
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY surface_intersection DESC
      `;

      const parcelles = await this.parcelleRepository.query(sql, queryParams);

      // Récupérer les parcelles temporaires (en cours de création)
      const tempParcelles = await this.getTemporaryParcelles(query);
      
      // Combiner les parcelles existantes et temporaires
      const allParcelles = [...parcelles, ...tempParcelles];

      const executionTime = Date.now() - startTime;

      return {
        parcelles: allParcelles,
        total: allParcelles.length,
        geometry: query.geometry,
        metadata: {
          queryType: 'intersection',
          parameters: { 
            geometry: query.geometry, 
            srid, 
            filters: query.filters 
          },
          executionTime,
          existingParcelles: parcelles.length,
          temporaryParcelles: tempParcelles.length
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

  /**
   * Récupérer les communes de Casablanca
   */
  async getCommunes(): Promise<any[]> {
    return this.parcelleRepository.query(`
      SELECT 
        id, 
        "COMMUNE_AR" as nom, 
        geom,
        "PREFECTURE" as prefecture,
        numero,
        "PLAN_AMENA" as plan_amena
      FROM "Communes_Casablanca" 
      ORDER BY "COMMUNE_AR"
    `);
  }

  /**
   * Récupérer les hôtels (avec les vrais noms d'attributs)
   */
  async getHotels(): Promise<any[]> {
    return this.parcelleRepository.query(`
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
  }

  /**
   * Récupérer les voies routières
   */
  async getRoads(): Promise<any[]> {
    return this.parcelleRepository.query(`
      SELECT 
        id, 
        "NOM" as nom, 
        geom,
        "LENGTH" as length
      FROM "voirie" 
      ORDER BY "NOM"
    `);
  }

  /**
   * Récupérer les parcelles temporaires qui intersectent la zone de requête
   */
  private async getTemporaryParcelles(query: IntersectionQuery): Promise<any[]> {
    const tempParcelles: any[] = [];
    
    // Récupérer toutes les parcelles temporaires de toutes les sessions
    for (const [sessionId, parcelles] of this.temporaryParcelles.entries()) {
      for (const parcelle of parcelles) {
        // Vérifier l'intersection avec la zone de requête
        if (this.checkIntersection(parcelle.geometry, query.geometry)) {
          tempParcelles.push({
            ...parcelle,
            source_type: 'temporary',
            sessionId: sessionId
          });
        }
      }
    }
    
    return tempParcelles;
  }

  /**
   * Vérifier l'intersection entre deux géométries (simplifié)
   */
  private checkIntersection(geom1: any, geom2: string): boolean {
    // Pour l'instant, on retourne true pour toutes les parcelles temporaires
    // Dans une implémentation complète, on utiliserait PostGIS pour vérifier l'intersection
    return true;
  }

  /**
   * Ajouter une parcelle temporaire (appelée depuis la création de parcelle)
   */
  addTemporaryParcelle(sessionId: string, parcelle: any): void {
    if (!this.temporaryParcelles.has(sessionId)) {
      this.temporaryParcelles.set(sessionId, []);
    }
    this.temporaryParcelles.get(sessionId)!.push(parcelle);
  }

  /**
   * Supprimer une parcelle temporaire
   */
  removeTemporaryParcelle(sessionId: string, parcelleId: string): void {
    if (this.temporaryParcelles.has(sessionId)) {
      const parcelles = this.temporaryParcelles.get(sessionId)!;
      const index = parcelles.findIndex(p => p.id === parcelleId);
      if (index > -1) {
        parcelles.splice(index, 1);
      }
    }
  }

  /**
   * Vider les parcelles temporaires d'une session
   */
  clearTemporaryParcelles(sessionId: string): void {
    this.temporaryParcelles.delete(sessionId);
  }

  /**
   * Obtenir toutes les parcelles temporaires d'une session
   */
  getTemporaryParcellesBySession(sessionId: string): any[] {
    return this.temporaryParcelles.get(sessionId) || [];
  }
}