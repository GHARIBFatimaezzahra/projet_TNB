import { SetMetadata } from '@nestjs/common';

export const TIMEOUT_KEY = 'timeout';

/**
 * Decorator pour définir un timeout personnalisé pour une route
 * @param ms Timeout en millisecondes
 * @example
 * @Timeout(30000) // 30 secondes
 * @Post('process-large-file')
 * processFile() { ... }
 */
export const Timeout = (ms: number) => SetMetadata(TIMEOUT_KEY, ms);

// Helpers pour timeouts communs
export const TimeoutShort = () => Timeout(5000);   // 5 secondes
export const TimeoutMedium = () => Timeout(30000); // 30 secondes
export const TimeoutLong = () => Timeout(120000);  // 2 minutes