import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Geometry } from 'geojson';

@Injectable()
export class ParseGeometryPipe implements PipeTransform {
  transform(value: any): Geometry {
    if (!value) {
      return null;
    }

    try {
      // Si c'est déjà un objet, le valider
      const geometry = typeof value === 'string' ? JSON.parse(value) : value;
      
      // Validation basique de la géométrie GeoJSON
      if (!this.isValidGeometry(geometry)) {
        throw new BadRequestException('Format de géométrie GeoJSON invalide');
      }

      return geometry;
    } catch (error) {
      throw new BadRequestException('Impossible de parser la géométrie: ' + error.message);
    }
  }

  private isValidGeometry(geometry: any): boolean {
    if (!geometry || typeof geometry !== 'object') {
      return false;
    }

    // Types de géométrie supportés pour TNB
    const validTypes = ['Point', 'Polygon', 'MultiPolygon', 'LineString'];
    
    if (!validTypes.includes(geometry.type)) {
      return false;
    }

    // Vérifier que les coordonnées existent
    if (!geometry.coordinates || !Array.isArray(geometry.coordinates)) {
      return false;
    }

    // Validation spécifique pour les polygones (principal usage TNB)
    if (geometry.type === 'Polygon') {
      return this.isValidPolygon(geometry);
    }

    return true;
  }

  private isValidPolygon(polygon: any): boolean {
    if (!polygon.coordinates || !Array.isArray(polygon.coordinates)) {
      return false;
    }

    // Un polygone doit avoir au moins un anneau extérieur
    if (polygon.coordinates.length === 0) {
      return false;
    }

    // Vérifier que l'anneau extérieur est fermé (premier point = dernier point)
    const ring = polygon.coordinates[0];
    if (!Array.isArray(ring) || ring.length < 4) {
      return false;
    }

    const first = ring[0];
    const last = ring[ring.length - 1];
    
    return first[0] === last[0] && first[1] === last[1];
  }
}