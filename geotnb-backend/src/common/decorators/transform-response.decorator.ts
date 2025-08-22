import { SetMetadata } from '@nestjs/common';

export const TRANSFORM_RESPONSE_KEY = 'transformResponse';

export interface TransformConfig {
  exclude?: string[];    // Champs à exclure
  include?: string[];    // Seuls champs à inclure
  groups?: string[];     // Groupes class-transformer
  nested?: boolean;      // Transformer les objets imbriqués
}

/**
 * Decorator pour transformer automatiquement les réponses
 * @param config Configuration de transformation
 * @example
 * @TransformResponse({ exclude: ['password', 'internalId'] })
 * @Get()
 * findAll() { ... }
 */
export const TransformResponse = (config: TransformConfig = {}) => 
  SetMetadata(TRANSFORM_RESPONSE_KEY, config);

// Helpers pour transformations communes
export const ExcludePassword = () => TransformResponse({ exclude: ['password'] });
export const PublicFields = () => TransformResponse({ 
  include: ['id', 'nom', 'dateCreation', 'dateModification'] 
});
