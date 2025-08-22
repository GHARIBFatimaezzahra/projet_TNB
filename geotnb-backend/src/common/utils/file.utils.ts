export class FileUtils {
    /**
     * Valide le type MIME d'un fichier
     */
    static isValidMimeType(mimeType: string, allowedTypes: string[]): boolean {
      return allowedTypes.includes(mimeType);
    }
  
    /**
     * Types MIME autorisés pour les documents TNB
     */
    static readonly ALLOWED_DOCUMENT_TYPES = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
  
    /**
     * Génère un nom de fichier unique
     */
    static generateUniqueFileName(originalName: string): string {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const extension = originalName.split('.').pop();
      return `${timestamp}-${random}.${extension}`;
    }
  
    /**
     * Formate la taille d'un fichier
     */
    static formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 B';
      
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }
  
    /**
     * Valide la taille maximale d'un fichier
     */
    static isValidFileSize(size: number, maxSizeMB: number = 50): boolean {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      return size <= maxSizeBytes;
    }
  }