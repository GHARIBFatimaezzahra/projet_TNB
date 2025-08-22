import { BadRequestException } from '@nestjs/common';

export class FileValidationUtils {
  static validateImageFile(buffer: Buffer, filename: string): void {
    const imageSignatures = {
      jpg: [0xFF, 0xD8, 0xFF],
      png: [0x89, 0x50, 0x4E, 0x47],
      gif: [0x47, 0x49, 0x46],
      bmp: [0x42, 0x4D]
    };

    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext || !['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
      return;
    }

    const signature = imageSignatures[ext === 'jpeg' ? 'jpg' : ext];
    if (signature && buffer.length >= signature.length) {
      const fileSignature = Array.from(buffer.slice(0, signature.length));
      const isValid = signature.every((byte, index) => byte === fileSignature[index]);
      
      if (!isValid) {
        throw new BadRequestException('Le fichier ne correspond pas à son extension');
      }
    }
  }

  static validatePDFFile(buffer: Buffer): void {
    const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF
    if (buffer.length >= 4) {
      const fileSignature = Array.from(buffer.slice(0, 4));
      const isValid = pdfSignature.every((byte, index) => byte === fileSignature[index]);
      
      if (!isValid) {
        throw new BadRequestException('Le fichier PDF est invalide');
      }
    }
  }

  static scanForMalware(buffer: Buffer): boolean {
    // Recherche de patterns suspects (implémentation basique)
    const suspiciousPatterns = [
      'javascript:', 'vbscript:', '<script', 'eval(', 'document.cookie'
    ];

    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
    return !suspiciousPatterns.some(pattern => 
      content.toLowerCase().includes(pattern.toLowerCase())
    );
  }
}