import { Geometry, Polygon, Point } from 'geojson';

export class GeometryUtils {
  /**
   * Calcule la superficie d'un polygone en mètres carrés
   * Utilise la formule de Shoelace pour les calculs simples
   */
  static calculatePolygonArea(geometry: Geometry): number {
    if (!geometry || geometry.type !== 'Polygon') {
      return 0;
    }

    const polygon = geometry as Polygon;
    if (!polygon.coordinates || polygon.coordinates.length === 0) {
      return 0;
    }

    const coords = polygon.coordinates[0];
    let area = 0;

    for (let i = 0; i < coords.length - 1; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[i + 1];
      area += (x1 * y2) - (x2 * y1);
    }

    // Conversion approximative en m² (à ajuster selon la projection)
    return Math.abs(area / 2) * 12321; // Factor de conversion approximatif
  }

  /**
   * Valide qu'une géométrie est un polygone fermé valide
   */
  static isValidPolygon(geometry: Geometry): boolean {
    if (!geometry || geometry.type !== 'Polygon') {
      return false;
    }

    const polygon = geometry as Polygon;
    if (!polygon.coordinates || polygon.coordinates.length === 0) {
      return false;
    }

    const ring = polygon.coordinates[0];
    if (ring.length < 4) {
      return false;
    }

    // Vérifier que le polygone est fermé
    const first = ring[0];
    const last = ring[ring.length - 1];
    return first[0] === last[0] && first[1] === last[1];
  }

  /**
   * Convertit une géométrie en format WKT pour PostGIS
   */
  static toWKT(geometry: Geometry): string {
    if (!geometry) return '';

    switch (geometry.type) {
      case 'Point':
        const point = geometry as Point;
        return `POINT(${point.coordinates[0]} ${point.coordinates[1]})`;
      
      case 'Polygon':
        const polygon = geometry as Polygon;
        const rings = polygon.coordinates.map(ring => {
          const coords = ring.map(coord => `${coord[0]} ${coord[1]}`).join(', ');
          return `(${coords})`;
        }).join(', ');
        return `POLYGON(${rings})`;
      
      default:
        return '';
    }
  }

  /**
   * Calcule le centroïde d'un polygone
   */
  static getCentroid(geometry: Geometry): [number, number] | null {
    if (!geometry || geometry.type !== 'Polygon') {
      return null;
    }

    const polygon = geometry as Polygon;
    const coords = polygon.coordinates[0];
    
    let x = 0, y = 0;
    for (const coord of coords) {
      x += coord[0];
      y += coord[1];
    }
    
    return [x / coords.length, y / coords.length];
  }
}