import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentJoint } from './entities/document-joint.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FileUploadUtils } from './utils/file-upload.utils';
import { FileValidationUtils } from './utils/file-validation.utils';
import { Multer } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

export interface PaginatedDocuments {
  data: DocumentJoint[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentSearchParams {
  parcelleId?: number;
  proprietaireId?: number;
  typeDoc?: string;
  estValide?: boolean;
  uploaderPar?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class DocumentJointService {
  constructor(
    @InjectRepository(DocumentJoint)
    private documentRepository: Repository<DocumentJoint>,
  ) {}

  async create(createDocumentDto: CreateDocumentDto, uploaderPar: number): Promise<DocumentJoint> {
    // Valider le fichier
    if (createDocumentDto.tailleFichier) {
      FileUploadUtils.validateFile(createDocumentDto.nomFichier, createDocumentDto.tailleFichier);
    }

    // Ajouter l'utilisateur qui upload
    const documentData = {
      ...createDocumentDto,
      uploaderPar,
      mimeType: createDocumentDto.mimeType || FileUploadUtils.getMimeTypeFromExtension(createDocumentDto.nomFichier)
    };

    const document = this.documentRepository.create(documentData);
    return await this.documentRepository.save(document);
  }

  async findAll(searchParams: DocumentSearchParams = {}): Promise<PaginatedDocuments> {
    const { page = 1, limit = 10, ...filters } = searchParams;
    const skip = (page - 1) * limit;

    const query = this.documentRepository.createQueryBuilder('document');

    // Filtres
    if (filters.parcelleId) {
      query.andWhere('document.parcelleId = :parcelleId', { parcelleId: filters.parcelleId });
    }

    if (filters.proprietaireId) {
      query.andWhere('document.proprietaireId = :proprietaireId', { proprietaireId: filters.proprietaireId });
    }

    if (filters.typeDoc) {
      query.andWhere('document.typeDoc = :typeDoc', { typeDoc: filters.typeDoc });
    }

    if (filters.estValide !== undefined) {
      query.andWhere('document.estValide = :estValide', { estValide: filters.estValide });
    }

    if (filters.uploaderPar) {
      query.andWhere('document.uploaderPar = :uploaderPar', { uploaderPar: filters.uploaderPar });
    }

    // Tri par date d'ajout décroissant
    query.orderBy('document.dateAjout', 'DESC');

    // Pagination
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<DocumentJoint> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['parcelle', 'proprietaire', 'uploader']
    });

    if (!document) {
      throw new NotFoundException(`Document avec l'ID ${id} introuvable`);
    }

    return document;
  }

  async findByParcelle(parcelleId: number): Promise<DocumentJoint[]> {
    return await this.documentRepository.find({
      where: { parcelleId, estValide: true },
      order: { dateAjout: 'DESC' }
    });
  }

  async findByProprietaire(proprietaireId: number): Promise<DocumentJoint[]> {
    return await this.documentRepository.find({
      where: { proprietaireId, estValide: true },
      order: { dateAjout: 'DESC' }
    });
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto): Promise<DocumentJoint> {
    const document = await this.findOne(id);

    await this.documentRepository.update(id, updateDocumentDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const document = await this.findOne(id);

    // Supprimer le fichier physique
    try {
      if (fs.existsSync(document.cheminFichier)) {
        fs.unlinkSync(document.cheminFichier);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
    }

    // Supprimer l'enregistrement en base
    await this.documentRepository.remove(document);
  }

  async validateDocument(id: number): Promise<DocumentJoint> {
    await this.documentRepository.update(id, { estValide: true });
    return await this.findOne(id);
  }

  async invalidateDocument(id: number): Promise<DocumentJoint> {
    await this.documentRepository.update(id, { estValide: false });
    return await this.findOne(id);
  }

  async getStatistics() {
    const total = await this.documentRepository.count();
    const valides = await this.documentRepository.count({ where: { estValide: true } });
    const invalides = total - valides;

    // Statistiques par type
    const byType = await this.documentRepository
      .createQueryBuilder('document')
      .select('document.typeDoc', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(document.tailleFichier)', 'totalSize')
      .groupBy('document.typeDoc')
      .getRawMany();

    // Taille totale des fichiers
    const totalSizeResult = await this.documentRepository
      .createQueryBuilder('document')
      .select('SUM(document.tailleFichier)', 'totalSize')
      .getRawOne();

    const totalSize = parseInt(totalSizeResult?.totalSize || '0');

    return {
      total,
      valides,
      invalides,
      totalSize,
      totalSizeFormatted: this.formatFileSize(totalSize),
      byType: byType.map(item => ({
        type: item.type,
        count: parseInt(item.count),
        totalSize: parseInt(item.totalSize || '0'),
        percentage: total > 0 ? Math.round((parseInt(item.count) / total) * 100) : 0,
      })),
    };
  }

  async uploadFile(file: Express.Multer.File, parcelleId: number, typeDoc: string, userId: number): Promise<string> {
    // Valider le fichier
    FileUploadUtils.validateFile(file.originalname, file.size);
    FileValidationUtils.scanForMalware(file.buffer);

    // Validation spécifique selon le type
    if (file.mimetype.startsWith('image/')) {
      FileValidationUtils.validateImageFile(file.buffer, file.originalname);
    } else if (file.mimetype === 'application/pdf') {
      FileValidationUtils.validatePDFFile(file.buffer);
    }

    // Générer le nom et le chemin du fichier
    const fileName = FileUploadUtils.generateFileName(file.originalname, parcelleId, typeDoc);
    const uploadDir = FileUploadUtils.getUploadPath(typeDoc);
    const filePath = path.join(uploadDir, fileName);

    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Sauvegarder le fichier
    fs.writeFileSync(filePath, file.buffer);

    return filePath;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}