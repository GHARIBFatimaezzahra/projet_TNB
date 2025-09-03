import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between } from 'typeorm';
import { Parcelle } from './entities/parcelle.entity';
import { CreateParcelleDto } from './dto/create-parcelle.dto';
import { UpdateParcelleDto } from './dto/update-parcelle.dto';
import { SearchParcelleDto } from './dto/search-parcelle.dto';
import { GeometryUtils } from './utils/geometry.utils';
import { SpatialQueryUtils } from './utils/spatial-query.utils';

export interface PaginatedParcelles {
  data: Parcelle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ParcelleService {
  constructor(
    @InjectRepository(Parcelle)
    private parcelleRepository: Repository<Parcelle>,
  ) {}

  async create(createParcelleDto: CreateParcelleDto): Promise<Parcelle> {
    // Vérifier si la référence foncière existe déjà
    const existingParcelle = await this.parcelleRepository.findOne({
      where: { referenceFonciere: createParcelleDto.referenceFonciere },
    });

    if (existingParcelle) {
      throw new ConflictException('Référence foncière déjà utilisée');
    }

    // Valider la géométrie si fournie
    if (createParcelleDto.geometry && !GeometryUtils.isValidPolygon(createParcelleDto.geometry)) {
      throw new ConflictException('Géométrie invalide');
    }

    // Calculer la surface à partir de la géométrie si pas fournie
    if (createParcelleDto.geometry && !createParcelleDto.surfaceTotale) {
      createParcelleDto.surfaceTotale = GeometryUtils.calculateArea(createParcelleDto.geometry);
    }

    // Surface imposable par défaut = surface totale
    if (!createParcelleDto.surfaceImposable && createParcelleDto.surfaceTotale) {
      createParcelleDto.surfaceImposable = createParcelleDto.surfaceTotale;
    }

    const parcelle = this.parcelleRepository.create(createParcelleDto);
    return await this.parcelleRepository.save(parcelle);
  }

  async findAll(searchDto: SearchParcelleDto = {}): Promise<PaginatedParcelles> {
    console.log('🔍 ParcelleService.findAll - Paramètres reçus:', searchDto);
    const { page = 1, limit = 10, sortBy = 'dateCreation', sortOrder = 'DESC', ...filters } = searchDto;
    const skip = (page - 1) * limit;

    console.log('🔍 ParcelleService.findAll - Filtres extraits:', filters);
    console.log('🔍 ParcelleService.findAll - Page:', page, 'Limit:', limit, 'Skip:', skip);

    const query = this.parcelleRepository.createQueryBuilder('parcelle');

    // Filtres de recherche
    if (filters.referenceFonciere) {
      query.andWhere('parcelle.referenceFonciere ILIKE :ref', { 
        ref: `%${filters.referenceFonciere}%` 
      });
    }

    if (filters.zonage) {
      query.andWhere('parcelle.zonage = :zonage', { zonage: filters.zonage });
    }

    if (filters.statutFoncier) {
      query.andWhere('parcelle.statutFoncier = :statutFoncier', { 
        statutFoncier: filters.statutFoncier 
      });
    }

    if (filters.statutOccupation) {
      query.andWhere('parcelle.statutOccupation = :statutOccupation', { 
        statutOccupation: filters.statutOccupation 
      });
    }

    if (filters.etatValidation) {
      query.andWhere('parcelle.etatValidation = :etatValidation', { 
        etatValidation: filters.etatValidation 
      });
    }

    if (filters.exonereTnb !== undefined) {
      query.andWhere('parcelle.exonereTnb = :exonereTnb', { 
        exonereTnb: filters.exonereTnb 
      });
    }

    // Tri - convertir camelCase en snake_case
    const sortColumn = sortBy === 'referenceFonciere' ? 'reference_fonciere' :
                      sortBy === 'surfaceTotale' ? 'surface_totale' :
                      sortBy === 'surfaceImposable' ? 'surface_imposable' :
                      sortBy === 'statutFoncier' ? 'statut_foncier' :
                      sortBy === 'statutOccupation' ? 'statut_occupation' :
                      sortBy === 'etatValidation' ? 'etat_validation' :
                      sortBy === 'dateCreation' ? 'date_creation' :
                      sortBy === 'dateModification' ? 'date_modification' :
                      sortBy === 'tnb' ? 'montant_total_tnb' :
                      sortBy === 'derniere_maj' ? 'derniere_mise_a_jour' :
                      sortBy === 'zone' ? 'zonage' :
                      sortBy; // garder tel quel si déjà en snake_case
    
    query.orderBy(`parcelle.${sortColumn}`, sortOrder);

    // Pagination
    query.skip(skip).take(limit);

    console.log('🔍 ParcelleService.findAll - Requête SQL générée:', query.getSql());
    console.log('🔍 ParcelleService.findAll - Paramètres de la requête:', query.getParameters());

    const [data, total] = await query.getManyAndCount();

    console.log('🔍 ParcelleService.findAll - Résultats trouvés:', data.length, 'sur', total);
    if (data.length > 0) {
      console.log('🔍 ParcelleService.findAll - Première parcelle:', data[0]);
    }

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Parcelle> {
    const parcelle = await this.parcelleRepository.findOne({
      where: { id },
      // relations: ['proprietaires', 'documents'], // À ajouter plus tard
    });

    if (!parcelle) {
      throw new NotFoundException(`Parcelle avec l'ID ${id} introuvable`);
    }

    return parcelle;
  }

  async findByReference(referenceFonciere: string): Promise<Parcelle | null> {
    return await this.parcelleRepository.findOne({
      where: { referenceFonciere },
    });
  }

  async update(id: number, updateParcelleDto: UpdateParcelleDto): Promise<Parcelle> {
    const parcelle = await this.findOne(id);

    // Vérifier les conflits de référence foncière
    if (updateParcelleDto.referenceFonciere) {
      const existingParcelle = await this.parcelleRepository.findOne({
        where: { referenceFonciere: updateParcelleDto.referenceFonciere },
      });

      if (existingParcelle && existingParcelle.id !== id) {
        throw new ConflictException('Référence foncière déjà utilisée');
      }
    }

    // Valider la géométrie si modifiée
    if (updateParcelleDto.geometry && !GeometryUtils.isValidPolygon(updateParcelleDto.geometry)) {
      throw new ConflictException('Géométrie invalide');
    }

    await this.parcelleRepository.update(id, updateParcelleDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const parcelle = await this.findOne(id);
    
    // Soft delete : archiver au lieu de supprimer
    await this.parcelleRepository.update(id, { 
      etatValidation: 'Archive' as any 
    });
  }

  async getStatistics() {
    const query = this.parcelleRepository.createQueryBuilder('parcelle')
      .where('parcelle.etatValidation != :archive', { archive: 'Archive' });

    const total = await query.getCount();
    
    const byStatus = await query
      .select('parcelle.etatValidation', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('parcelle.etatValidation')
      .getRawMany();

    const byZone = await query
      .select('parcelle.zonage', 'zone')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(parcelle.surfaceTotale)', 'totalSurface')
      .addSelect('SUM(parcelle.montantTotalTnb)', 'totalRevenue')
      .groupBy('parcelle.zonage')
      .getRawMany();

    const totalSurface = await query
      .select('SUM(parcelle.surfaceTotale)', 'total')
      .getRawOne();

    const totalRevenue = await query
      .select('SUM(parcelle.montantTotalTnb)', 'total')
      .getRawOne();

    return {
      total,
      totalSurface: parseFloat(totalSurface?.total || '0'),
      totalRevenue: parseFloat(totalRevenue?.total || '0'),
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: parseInt(item.count),
      })),
      byZone: byZone.map(item => ({
        zone: item.zone || 'Non défini',
        count: parseInt(item.count),
        totalSurface: parseFloat(item.totalSurface || '0'),
        totalRevenue: parseFloat(item.totalRevenue || '0'),
      })),
    };
  }

  // Méthodes spatiales
  async findByDistance(longitude: number, latitude: number, distance: number): Promise<Parcelle[]> {
    const query = this.parcelleRepository.createQueryBuilder('parcelle');
    SpatialQueryUtils.addDistanceQuery(query, [longitude, latitude], distance);
    return await query.getMany();
  }

  async findByBoundingBox(bbox: [number, number, number, number]): Promise<Parcelle[]> {
    const query = this.parcelleRepository.createQueryBuilder('parcelle');
    SpatialQueryUtils.addBboxQuery(query, bbox);
    return await query.getMany();
  }
}