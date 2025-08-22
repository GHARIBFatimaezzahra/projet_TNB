import { SetMetadata } from '@nestjs/common';

export const API_KEY_KEY = 'apiKey';

export interface ApiKeyOptions {
  required?: boolean;
  scopes?: string[];
}

/**
 * Decorator pour exiger une clé API pour accéder à une route
 * @param options - Configuration de la clé API
 * @returns Metadata decorator
 * 
 * @example
 * @ApiKey({ scopes: ['read:parcelles'] })
 * @Get('external-api')
 * externalApi() { ... }
 */
export const ApiKey = (options: ApiKeyOptions = { required: true }) => 
  SetMetadata(API_KEY_KEY, options);