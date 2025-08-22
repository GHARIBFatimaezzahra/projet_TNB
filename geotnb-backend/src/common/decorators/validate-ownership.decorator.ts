import { SetMetadata } from '@nestjs/common';

export const VALIDATE_OWNERSHIP_KEY = 'validateOwnership';

export interface OwnershipConfig {
  entity: string;
  userIdField?: string;
  paramName?: string;
}

/**
 * Decorator pour valider que l'utilisateur est propriétaire de la ressource
 * @param config Configuration de validation
 * @example
 * @ValidateOwnership({ entity: 'Parcelle', userIdField: 'createdBy' })
 * @Patch(':id')
 * update(@Param('id') id: number) { ... }
 */
export const ValidateOwnership = (config: OwnershipConfig) => 
  SetMetadata(VALIDATE_OWNERSHIP_KEY, config);