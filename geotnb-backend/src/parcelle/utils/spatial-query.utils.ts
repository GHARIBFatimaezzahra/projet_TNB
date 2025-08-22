import { SelectQueryBuilder } from 'typeorm';
import { Parcelle } from '../entities/parcelle.entity';
import { Geometry } from 'geojson';

export class SpatialQueryUtils {
  /**
   * Ajoute une requête spatiale d'intersection
   */
  static addIntersectionQuery(
    query: SelectQueryBuilder<Parcelle>,
    geometry: Geometry,
    alias: string = 'parcelle'
  ): SelectQueryBuilder<Parcelle> {
    return query.andWhere(
      `ST_Intersects(${alias}.geometry, ST_GeomFromGeoJSON(:geometry))`,
      { geometry: JSON.stringify(geometry) }
    );
  }

  /**
   * Ajoute une requête spatiale de distance
   */
  static addDistanceQuery(
    query: SelectQueryBuilder<Parcelle>,
    point: [number, number],
    distance: number,
    alias: string = 'parcelle'
  ): SelectQueryBuilder<Parcelle> {
    return query.andWhere(
      `ST_DWithin(${alias}.geometry, ST_Point(:longitude, :latitude), :distance)`,
      { longitude: point[0], latitude: point[1], distance }
    );
  }

  /**
   * Ajoute une requête spatiale dans un bounding box
   */
  static addBboxQuery(
    query: SelectQueryBuilder<Parcelle>,
    bbox: [number, number, number, number], // [minX, minY, maxX, maxY]
    alias: string = 'parcelle'
  ): SelectQueryBuilder<Parcelle> {
    return query.andWhere(
      `ST_Intersects(${alias}.geometry, ST_MakeEnvelope(:minX, :minY, :maxX, :maxY, 4326))`,
      { minX: bbox[0], minY: bbox[1], maxX: bbox[2], maxY: bbox[3] }
    );
  }

  /**
   * Calcule la superficie de la géométrie en base
   */
  static addAreaCalculation(
    query: SelectQueryBuilder<Parcelle>,
    alias: string = 'parcelle'
  ): SelectQueryBuilder<Parcelle> {
    return query.addSelect(
      `ST_Area(${alias}.geometry::geography) as calculated_area`
    );
  }
}