import { Geometry, Polygon } from 'geojson';

export class GeometryUtils {
  /**
   * Calcule la superficie d'un polygone en mètres carrés
   */
  static calculateArea(geometry: Geometry): number {
    if (!geometry || geometry.type !== 'Polygon') {
      return 0;
    }

    const polygon = geometry as Polygon;
    if (!polygon.coordinates || polygon.coordinates.length === 0) {
      return 0;
    }

    // Calcul simplifié de l'aire (approximation)
    // En production, utiliser une bibliothèque comme @turf/area
    const coords = polygon.coordinates[0];
    let area = 0;

    for (let i = 0; i < coords.length - 1; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[i + 1];
      area += (x1 * y2) - (x2 * y1);
    }

    return Math.abs(area / 2);
  }

  /**
   * Valide qu'une géométrie est un polygone valide
   */
  static isValidPolygon(geometry: Geometry): boolean {
    if (!geometry || geometry.type !== 'Polygon') {
      return false;
    }

    const polygon = geometry as Polygon;
    if (!polygon.coordinates || polygon.coordinates.length === 0) {
      return false;
    }

    // Vérifier que le polygone est fermé
    const ring = polygon.coordinates[0];
    if (ring.length < 4) {
      return false;
    }

    const first = ring[0];
    const last = ring[ring.length - 1];
    return first[0] === last[0] && first[1] === last[1];
  }

  /**
   * Convertit des coordonnées en WKT (Well-Known Text)
   */
  static geometryToWKT(geometry: Geometry): string {
    if (!geometry || geometry.type !== 'Polygon') {
      return '';
    }

    const polygon = geometry as Polygon;
    const coords = polygon.coordinates[0];
    const wktCoords = coords.map(coord => `${coord[0]} ${coord[1]}`).join(', ');
    return `POLYGON((${wktCoords}))`;
  }
}