import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between, DataSource } from 'typeorm';
import { Parcelle } from './entities/parcelle.entity';
import { CreateParcelleDto } from './dto/create-parcelle.dto';
import { UpdateParcelleDto } from './dto/update-parcelle.dto';
import { SearchParcelleDto } from './dto/search-parcelle.dto';
import { GeometryUtils } from './utils/geometry.utils';
import { SpatialQueryUtils } from './utils/spatial-query.utils';
import { ParcelleProprietaire } from '../parcelle-proprietaire/entities/parcelle-proprietaire.entity';
import { Proprietaire } from '../proprietaire/entities/proprietaire.entity';

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
    @InjectRepository(ParcelleProprietaire)
    private parcelleProprietaireRepository: Repository<ParcelleProprietaire>,
    @InjectRepository(Proprietaire)
    private proprietaireRepository: Repository<Proprietaire>,
    private dataSource: DataSource,
  ) {}

  async create(createParcelleDto: CreateParcelleDto): Promise<Parcelle> {
    return await this.dataSource.transaction(async manager => {
      // Vérifier si la référence foncière existe déjà
      const existingParcelle = await manager.findOne(Parcelle, {
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

      // Calculer le montant TNB total
      const montantTotalTnb = createParcelleDto.surfaceImposable && createParcelleDto.prixUnitaireM2 
        ? createParcelleDto.surfaceImposable * createParcelleDto.prixUnitaireM2 
        : 0;

      // Créer la parcelle
      const parcelleData = { ...createParcelleDto, montantTotalTnb };
      const parcelle = manager.create(Parcelle, parcelleData);
      const savedParcelle = await manager.save(parcelle);

      // Gérer les propriétaires si fournis
      if (createParcelleDto.proprietaires && createParcelleDto.proprietaires.length > 0) {
        // Vérifier que la somme des quote-parts = 1
        const sommeQuoteParts = createParcelleDto.proprietaires.reduce((sum, p) => sum + p.quotePart, 0);
        if (Math.abs(sommeQuoteParts - 1) > 0.0001) {
          throw new ConflictException(
            `La somme des quotes-parts doit être égale à 1. Somme actuelle: ${sommeQuoteParts}`
          );
        }

        // Créer les relations parcelle-propriétaire
        for (const prop of createParcelleDto.proprietaires) {
          // Vérifier que le propriétaire existe
          const proprietaire = await manager.findOne(Proprietaire, {
            where: { id: prop.proprietaireId }
          });

          if (!proprietaire) {
            throw new ConflictException(`Propriétaire avec l'ID ${prop.proprietaireId} introuvable`);
          }

          const montantIndividuel = montantTotalTnb * prop.quotePart;
          
          // Vérifier si la relation existe déjà
          const existingRelation = await manager.findOne(ParcelleProprietaire, {
            where: {
              parcelleId: savedParcelle.id,
              proprietaireId: prop.proprietaireId,
              estActif: true
            }
          });

          if (!existingRelation) {
            const parcelleProprietaire = manager.create(ParcelleProprietaire, {
              parcelleId: savedParcelle.id,
              proprietaireId: prop.proprietaireId,
              quotePart: prop.quotePart,
              montantIndividuel,
              estActif: true,
              dateDebut: new Date()
            });

            await manager.save(parcelleProprietaire);
          } else {
            // Mettre à jour la relation existante
            existingRelation.quotePart = prop.quotePart;
            existingRelation.montantIndividuel = montantIndividuel;
            await manager.save(existingRelation);
          }
        }
      }

      return savedParcelle;
    });
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

    // Exclure les parcelles archivées si demandé
    if (filters.excludeArchived) {
      query.andWhere('parcelle.etatValidation != :archived', { 
        archived: 'Archive' 
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

    try {
      const [data, total] = await query.getManyAndCount();
      console.log('🔍 ParcelleService.findAll - Requête exécutée avec succès');
      console.log('🔍 ParcelleService.findAll - Résultats trouvés:', data.length, 'sur', total);
      
      // Charger les propriétaires séparément pour chaque parcelle
      for (const parcelle of data) {
        try {
          const proprietaires = await this.parcelleProprietaireRepository.find({
            where: { parcelleId: parcelle.id, estActif: true },
            relations: ['proprietaire'],
            order: { dateDebut: 'DESC' }
          });
          parcelle.proprietaires = proprietaires;
          console.log(`🔍 ParcelleService.findAll - Propriétaires pour parcelle ${parcelle.id}:`, proprietaires.length);
        } catch (propError) {
          console.error(`🔍 ParcelleService.findAll - Erreur lors du chargement des propriétaires pour parcelle ${parcelle.id}:`, propError);
          parcelle.proprietaires = [];
        }
      }
      
      if (data.length > 0) {
        console.log('🔍 ParcelleService.findAll - Première parcelle:', JSON.stringify(data[0], null, 2));
      }
      
      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('🔍 ParcelleService.findAll - Erreur lors de l\'exécution de la requête:', error);
      console.error('🔍 ParcelleService.findAll - Détails de l\'erreur:', error.message);
      console.error('🔍 ParcelleService.findAll - Stack trace:', error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<Parcelle> {
    const parcelle = await this.parcelleRepository.findOne({
      where: { id },
      relations: ['proprietaires', 'proprietaires.proprietaire'],
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