import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentJoint } from './entities/document-joint.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentJointService {
  constructor(
    @InjectRepository(DocumentJoint)
    private documentRepository: Repository<DocumentJoint>,
  ) {}

  // Création d'un document joint
  async create(createDocumentDto: CreateDocumentDto): Promise<DocumentJoint> {
    const document = this.documentRepository.create(createDocumentDto);
    return this.documentRepository.save(document);
  }

  // Récupérer tous les documents joints
  async findAll(): Promise<DocumentJoint[]> {
    return this.documentRepository.find({ relations: ['parcelle'] });
  }

  // Récupérer un document joint par son ID
  async findOne(id: number): Promise<DocumentJoint> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['parcelle'],
    });
    if (!document) {
      throw new NotFoundException('Document non trouvé');
    }
    return document;
  }

  // Mettre à jour un document joint
  async update(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<DocumentJoint> {
    await this.documentRepository.update(id, updateDocumentDto);
    return this.findOne(id);
  }

  // Supprimer un document joint
  async remove(id: number): Promise<void> {
    const document = await this.findOne(id);
    await this.documentRepository.remove(document);
  }
}
