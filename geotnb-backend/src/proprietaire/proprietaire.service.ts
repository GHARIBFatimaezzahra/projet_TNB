import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, ILike } from 'typeorm';
import { Proprietaire } from './entities/proprietaire.entity';
import { CreateProprietaireDto } from './dto/create-proprietaire.dto';
import { UpdateProprietaireDto } from './dto/update-proprietaire.dto';
import { SearchProprietaireDto } from './dto/search-proprietaire.dto';

export interface PaginatedProprietaires {
  data: Proprietaire[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProprietaireService {
  constructor(
    @InjectRepository(Proprietaire)
    private proprietaireRepository: Repository<Proprietaire>,
  ) {}

  async create(createProprietaireDto: CreateProprietaireDto): Promise<Proprietaire> {
    // Vérifier si le CIN/RC existe déjà
    if (createProprietaireDto.cinOuRc) {
      const existingProprietaire = await this.proprietaireRepository.findOne({
        where: { cinOuRc: createProprietaireDto.cinOuRc },
      });

      if (existingProprietaire) {
        throw new ConflictException('CIN ou RC déjà utilisé');
      }
    }

    // Valider le format CIN/RC selon le type
    if (createProprietaireDto.cinOuRc) {
      const isValid = this.validateCinOuRc(
        createProprietaireDto.cinOuRc, 
        createProprietaireDto.nature
      );
      
      if (!isValid) {
        const expectedFormat = createProprietaireDto.nature === 'Physique' 
          ? 'Format CIN attendu: 1-2 lettres + 6-8 chiffres (ex: AB123456)'
          : 'Format RC attendu: chiffres uniquement (ex: 12345)';
        throw new ConflictException(expectedFormat);
      }
    }

    const proprietaire = this.proprietaireRepository.create(createProprietaireDto);
    return await this.proprietaireRepository.save(proprietaire);
  }

  async findAll(searchDto: SearchProprietaireDto = {}): Promise<PaginatedProprietaires> {
    const { page = 1, limit = 10, sortBy = 'dateCreation', sortOrder = 'DESC', ...filters } = searchDto;
    const skip = (page - 1) * limit;

    const query = this.proprietaireRepository.createQueryBuilder('proprietaire');

    // Filtres de recherche
    if (filters.nom) {
      query.andWhere('proprietaire.nom ILIKE :nom', { 
        nom: `%${filters.nom}%` 
      });
    }

    if (filters.prenom) {
      query.andWhere('proprietaire.prenom ILIKE :prenom', { 
        prenom: `%${filters.prenom}%` 
      });
    }

    if (filters.cinOuRc) {
      query.andWhere('proprietaire.cinOuRc ILIKE :cinOuRc', { 
        cinOuRc: `%${filters.cinOuRc}%` 
      });
    }

    if (filters.nature) {
      query.andWhere('proprietaire.nature = :nature', { nature: filters.nature });
    }

    if (filters.telephone) {
      query.andWhere('proprietaire.telephone ILIKE :telephone', { 
        telephone: `%${filters.telephone}%` 
      });
    }

    if (filters.email) {
      query.andWhere('proprietaire.email ILIKE :email', { 
        email: `%${filters.email}%` 
      });
    }

    if (filters.estActif !== undefined) {
      query.andWhere('proprietaire.estActif = :estActif', { 
        estActif: filters.estActif 
      });
    }

    // Tri
    query.orderBy(`proprietaire.${sortBy}`, sortOrder);

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

  async findOne(id: number): Promise<Proprietaire> {
    const proprietaire = await this.proprietaireRepository.findOne({
      where: { id },
      // relations: ['parcelles', 'documents'], // À ajouter plus tard
    });

    if (!proprietaire) {
      throw new NotFoundException(`Propriétaire avec l'ID ${id} introuvable`);
    }

    return proprietaire;
  }

  async findByCinOuRc(cinOuRc: string): Promise<Proprietaire | null> {
    return await this.proprietaireRepository.findOne({
      where: { cinOuRc, estActif: true },
    });
  }

  async update(id: number, updateProprietaireDto: UpdateProprietaireDto): Promise<Proprietaire> {
    const proprietaire = await this.findOne(id);

    // Vérifier les conflits de CIN/RC
    if (updateProprietaireDto.cinOuRc) {
      const existingProprietaire = await this.proprietaireRepository.findOne({
        where: { cinOuRc: updateProprietaireDto.cinOuRc },
      });

      if (existingProprietaire && existingProprietaire.id !== id) {
        throw new ConflictException('CIN ou RC déjà utilisé');
      }

      // Valider le format si modifié
      const nature = updateProprietaireDto.nature || proprietaire.nature;
      const isValid = this.validateCinOuRc(updateProprietaireDto.cinOuRc, nature);
      
      if (!isValid) {
        const expectedFormat = nature === 'Physique' 
          ? 'Format CIN attendu: 1-2 lettres + 6-8 chiffres (ex: AB123456)'
          : 'Format RC attendu: chiffres uniquement (ex: 12345)';
        throw new ConflictException(expectedFormat);
      }
    }

    await this.proprietaireRepository.update(id, updateProprietaireDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const proprietaire = await this.findOne(id);
    
    // Soft delete : désactiver au lieu de supprimer
    await this.proprietaireRepository.update(id, { estActif: false });
  }

  async activate(id: number): Promise<Proprietaire> {
    await this.proprietaireRepository.update(id, { estActif: true });
    return await this.findOne(id);
  }

  async deactivate(id: number): Promise<Proprietaire> {
    await this.proprietaireRepository.update(id, { estActif: false });
    return await this.findOne(id);
  }

  async getStatistics() {
    const total = await this.proprietaireRepository.count({ 
      where: { estActif: true } 
    });
    
    const byNature = await this.proprietaireRepository
      .createQueryBuilder('proprietaire')
      .select('proprietaire.nature', 'nature')
      .addSelect('COUNT(*)', 'count')
      .where('proprietaire.estActif = :actif', { actif: true })
      .groupBy('proprietaire.nature')
      .getRawMany();

    const withContact = await this.proprietaireRepository
      .createQueryBuilder('proprietaire')
      .where('proprietaire.estActif = :actif', { actif: true })
      .andWhere('(proprietaire.telephone IS NOT NULL OR proprietaire.email IS NOT NULL)')
      .getCount();

    const withoutCin = await this.proprietaireRepository.count({
      where: { 
        estActif: true,
        cinOuRc: null
      }
    });

    return {
      total,
      withContact,
      withoutCin,
      contactRate: total > 0 ? Math.round((withContact / total) * 100) : 0,
      missingCinRate: total > 0 ? Math.round((withoutCin / total) * 100) : 0,
      byNature: byNature.map(item => ({
        nature: item.nature,
        count: parseInt(item.count),
        percentage: total > 0 ? Math.round((parseInt(item.count) / total) * 100) : 0,
      })),
    };
  }

  // Méthodes de recherche avancée
  async searchByFullName(searchTerm: string): Promise<Proprietaire[]> {
    return await this.proprietaireRepository
      .createQueryBuilder('proprietaire')
      .where('proprietaire.estActif = :actif', { actif: true })
      .andWhere(
        '(CONCAT(proprietaire.prenom, \' \', proprietaire.nom) ILIKE :search OR proprietaire.nom ILIKE :search)',
        { search: `%${searchTerm}%` }
      )
      .orderBy('proprietaire.nom', 'ASC')
      .getMany();
  }

  async findDuplicates(): Promise<{ field: string; value: string; count: number; ids: number[] }[]> {
    const duplicates = [];

    // Doublons par CIN/RC
    const cinDuplicates = await this.proprietaireRepository
      .createQueryBuilder('proprietaire')
      .select('proprietaire.cinOuRc', 'value')
      .addSelect('COUNT(*)', 'count')
      .addSelect('array_agg(proprietaire.id)', 'ids')
      .where('proprietaire.cinOuRc IS NOT NULL')
      .andWhere('proprietaire.estActif = :actif', { actif: true })
      .groupBy('proprietaire.cinOuRc')
      .having('COUNT(*) > 1')
      .getRawMany();

    duplicates.push(...cinDuplicates.map(d => ({
      field: 'cinOuRc',
      value: d.value,
      count: parseInt(d.count),
      ids: d.ids
    })));

    return duplicates;
  }

  private validateCinOuRc(cinOuRc: string, nature: string): boolean {
    if (nature === 'Physique') {
      // Format CIN marocaine : 1-2 lettres + 6-8 chiffres
      return /^[A-Z]{1,2}[0-9]{6,8}$/.test(cinOuRc);
    } else {
      // Format RC : chiffres uniquement
      return /^[0-9]+$/.test(cinOuRc);
    }
  }
}