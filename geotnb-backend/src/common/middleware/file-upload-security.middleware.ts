import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';
import * as path from 'path';

@Injectable()
export class FileUploadSecurityMiddleware implements NestMiddleware {
  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv',
    'application/json', // GeoJSON
    'application/zip', // Shapefiles
  ];

  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  use(req: Request, res: Response, next: NextFunction): void {
    // Appliquer seulement aux routes d'upload
    if (!req.path.includes('/upload') && !req.path.includes('/import')) {
      return next();
    }

    const upload = multer({
      limits: {
        fileSize: this.maxFileSize,
        files: 5, // Max 5 fichiers
      },
      fileFilter: (req, file, cb) => {
        // Vérifier le type MIME
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Type de fichier non autorisé: ${file.mimetype}. Types autorisés: ${this.allowedMimeTypes.join(', ')}`
            ),
          );
        }

        // Vérifier l'extension
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.xlsx', '.xls', '.csv', '.json', '.zip'];
        
        if (!allowedExtensions.includes(ext)) {
          return cb(
            new BadRequestException(
              `Extension de fichier non autorisée: ${ext}`
            ),
          );
        }

        cb(null, true);
      },
      storage: multer.memoryStorage(), // Stocker en mémoire pour traitement
    });

    // Appliquer multer
    upload.any()(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            throw new BadRequestException('Fichier trop volumineux. Taille maximum: 10MB');
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            throw new BadRequestException('Trop de fichiers. Maximum: 5 fichiers');
          }
        }
        throw new BadRequestException('Erreur lors de l\'upload: ' + err.message);
      }

      // Validation supplémentaire des fichiers
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          this.validateFile(file);
        }
      }

      next();
    });
  }

  private validateFile(file: Express.Multer.File): void {
    // Vérifier que le fichier n'est pas vide
    if (file.size === 0) {
      throw new BadRequestException('Fichier vide détecté');
    }

    // Vérifications spécifiques par type
    if (file.mimetype.startsWith('image/')) {
      this.validateImage(file);
    } else if (file.mimetype === 'application/json') {
      this.validateGeoJSON(file);
    }
  }

  private validateImage(file: Express.Multer.File): void {
    // Vérifier les headers d'image pour éviter les fichiers malveillants
    const buffer = file.buffer;
    
    if (file.mimetype === 'image/jpeg' && !buffer.slice(0, 3).equals(Buffer.from([0xFF, 0xD8, 0xFF]))) {
      throw new BadRequestException('Fichier JPEG invalide');
    }
    
    if (file.mimetype === 'image/png' && !buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
      throw new BadRequestException('Fichier PNG invalide');
    }
  }

  private validateGeoJSON(file: Express.Multer.File): void {
    try {
      const content = file.buffer.toString('utf-8');
      const geojson = JSON.parse(content);
      
      if (!geojson.type || !['FeatureCollection', 'Feature', 'Polygon', 'Point'].includes(geojson.type)) {
        throw new BadRequestException('Format GeoJSON invalide');
      }
    } catch (error) {
      throw new BadRequestException('Fichier GeoJSON invalide: ' + error.message);
    }
  }
}