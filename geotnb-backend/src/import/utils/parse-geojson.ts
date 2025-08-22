import { FeatureCollection, Feature } from 'geojson';
import { BadRequestException } from '@nestjs/common';

export interface ParsedGeojsonData {
  totalFeatures: number;
  validFeatures: Feature[];
  invalidFeatures: { feature: Feature; errors: string[] }[];
  detectedFields: string[];
  sampleData: any[];
}

export class ParseGeojsonUtils {
  static parse(geojsonData: FeatureCollection): ParsedGeojsonData {
    if (!geojsonData || geojsonData.type !== 'FeatureCollection') {
      throw new BadRequestException('Données GeoJSON invalides : FeatureCollection attendu');
    }

    if (!geojsonData.features || !Array.isArray(geojsonData.features)) {
      throw new BadRequestException('Aucune feature trouvée dans le GeoJSON');
    }

    const validFeatures: Feature[] = [];
    const invalidFeatures: { feature: Feature; errors: string[] }[] = [];
    const detectedFields = new Set<string>();

    geojsonData.features.forEach(feature => {
      const errors = this.validateFeature(feature);
      
      if (errors.length === 0) {
        validFeatures.push(feature);
        
        // Collecter les champs détectés
        if (feature.properties) {
          Object.keys(feature.properties).forEach(key => detectedFields.add(key));
        }
      } else {
        invalidFeatures.push({ feature, errors });
      }
    });

    // Échantillon de données pour aperçu
    const sampleData = validFeatures.slice(0, 5).map(f => f.properties);

    return {
      totalFeatures: geojsonData.features.length,
      validFeatures,
      invalidFeatures,
      detectedFields: Array.from(detectedFields),
      sampleData
    };
  }

  private static validateFeature(feature: Feature): string[] {
    const errors: string[] = [];

    if (!feature.type || feature.type !== 'Feature') {
      errors.push('Type Feature manquant ou invalide');
    }

    if (!feature.geometry) {
      errors.push('Géométrie manquante');
    } else {
      // Valider la géométrie
      if (!['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'].includes(feature.geometry.type)) {
        errors.push('Type de géométrie non supporté');
      }
      
      if (feature.geometry.type === 'Polygon' && (!feature.geometry.coordinates || feature.geometry.coordinates.length === 0)) {
        errors.push('Coordonnées de polygone manquantes');
      }
    }

    return errors;
  }

  static generateMapping(detectedFields: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    
    // Mapping automatique basé sur des mots-clés
    const fieldMappings = {
      'reference_fonciere': ['reference', 'ref', 'titre', 'titre_foncier', 'tf'],
      'surface_totale': ['surface', 'area', 'superficie', 'surf_tot'],
      'surface_imposable': ['surf_imp', 'surf_imposable', 'taxable_area'],
      'statut_foncier': ['statut', 'status', 'type_foncier'],
      'zonage': ['zone', 'zonage', 'zoning'],
      'nom': ['nom', 'name', 'proprietaire', 'owner'],
      'prenom': ['prenom', 'firstname', 'given_name']
    };

    detectedFields.forEach(field => {
      const normalizedField = field.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      Object.entries(fieldMappings).forEach(([targetField, keywords]) => {
        keywords.forEach(keyword => {
          if (normalizedField.includes(keyword) && !mapping[targetField]) {
            mapping[targetField] = field;
          }
        });
      });
    });

    return mapping;
  }
}