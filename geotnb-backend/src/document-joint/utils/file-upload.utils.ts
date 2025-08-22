import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export class FileUploadUtils {
  private static readonly ALLOWED_EXTENSIONS = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp',
    '.dwg', '.dxf', '.shp', '.kml', '.geojson'
  ];

  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  static validateFile(filename: string, size: number): void {
    // Vérifier l'extension
    const ext = extname(filename).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(
        `Extension de fichier non autorisée. Extensions acceptées: ${this.ALLOWED_EXTENSIONS.join(', ')}`
      );
    }

    // Vérifier la taille
    if (size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `Fichier trop volumineux. Taille maximale autorisée: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
    }
  }

  static generateFileName(originalName: string, parcelleId: number, typeDoc: string): string {
    const ext = extname(originalName);
    const timestamp = Date.now();
    const sanitizedType = typeDoc.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `parcelle_${parcelleId}_${sanitizedType}_${timestamp}${ext}`;
  }

  static getUploadPath(typeDoc: string): string {
    const baseDir = process.env.UPLOAD_DIR || './uploads';
    const typeDir = typeDoc.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${baseDir}/documents/${typeDir}`;
  }

  static getMimeTypeFromExtension(filename: string): string {
    const ext = extname(filename).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.dwg': 'application/acad',
      '.dxf': 'application/dxf',
      '.shp': 'application/x-shapefile',
      '.kml': 'application/vnd.google-earth.kml+xml',
      '.geojson': 'application/geo+json'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}