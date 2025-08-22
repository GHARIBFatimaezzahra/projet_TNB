import { SetMetadata } from '@nestjs/common';

export const VALIDATE_FILE_KEY = 'validateFile';

export interface FileValidationConfig {
  maxSize?: number;           // Taille max en bytes
  allowedTypes?: string[];    // Types MIME autorisés
  required?: boolean;         // Fichier obligatoire
  fieldName?: string;         // Nom du champ fichier
}

/**
 * Decorator pour valider les fichiers uploadés
 * @param config Configuration de validation
 * @example
 * @ValidateFile({ maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png'] })
 * @Post('upload')
 * upload(@UploadedFile() file) { ... }
 */
export const ValidateFile = (config: FileValidationConfig) => 
  SetMetadata(VALIDATE_FILE_KEY, config);

// Helpers pour validations communes
export const ValidateImage = () => ValidateFile({
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
});

export const ValidateDocument = () => ValidateFile({
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
});

export const ValidateGeoFile = () => ValidateFile({
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['application/json', 'application/zip', 'application/x-zip-compressed']
});