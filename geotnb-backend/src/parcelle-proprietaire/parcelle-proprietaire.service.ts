import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ParcelleProprietaire } from './entities/parcelle-proprietaire.entity';
import { CreateParcelleProprietaireDto } from './dto/create-parcelle-proprietaire.dto';
import { UpdateParcelleProprietaireDto } from './dto/update-parcelle-proprietaire.dto';
import { QuotePartDto } from './dto/quote-part.dto';
import { SearchParcelleProprietaireDto } from './dto/search-parcelle-proprietaire.dto';
import { ParcelleService } from '../parcelle/parcelle.service';
import { ProprietaireService } from '../proprietaire/proprietaire.service';

export interface PaginatedParcelleProprietaires {
  data: ParcelleProprietaire[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ParcelleProprietaireService {
  constructor(
    @InjectRepository(ParcelleProprietaire)
    private parcelleProprietaireRepository: Repository<ParcelleProprietaire>,
    private parcelleService: ParcelleService,
    private proprietaireService: ProprietaireService,
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateParcelleProprietaireDto): Promise<ParcelleProprietaire> {
    // Vérifier que la parcelle existe
    const parcelle = await this.parcelleService.findOne(createDto.parcelleId);
    
    // Vérifier que le propriétaire existe
    const proprietaire = await this.proprietaireService.findOne(createDto.proprietaireId);

    // Vérifier qu'il n'y a pas déjà une relation active
    const relationExistante = await this.parcelleProprietaireRepository.findOne({
      where: {
        parcelleId: createDto.parcelleId,
        proprietaireId: createDto.proprietaireId,
        estActif: true,
        dateFin: null
      }
    });

    if (relationExistante) {
      throw new ConflictException(
        'Une relation active existe déjà entre cette parcelle et ce propriétaire'
      );
    }

    // Vérifier que la somme des quotes-parts ne dépasse pas 1
    await this.validateQuotePartsSum(createDto.parcelleId, createDto.quotePart);

    // Calculer le montant individuel si non fourni
    if (!createDto.montantIndividuel) {
      createDto.montantIndividuel = parcelle.montantTotalTnb * createDto.quotePart;
    }

    const parcelleProprietaire = this.parcelleProprietaireRepository.create(createDto);
    return await this.parcelleProprietaireRepository.save(parcelleProprietaire);
  }

  async findAll(searchDto: SearchParcelleProprietaireDto = {}): Promise<PaginatedParcelleProprietaires> {
    const { page = 1, limit = 10, ...filters } = searchDto;
    const skip = (page - 1) * limit;

    const query = this.parcelleProprietaireRepository.createQueryBuilder('pp')
      .leftJoinAndSelect('pp.parcelle', 'parcelle')
      .leftJoinAndSelect('pp.proprietaire', 'proprietaire');

    // Filtres
    if (filters.parcelleId) {
      query.andWhere('pp.parcelleId = :parcelleId', { parcelleId: filters.parcelleId });
    }

    if (filters.proprietaireId) {
      query.andWhere('pp.proprietaireId = :proprietaireId', { proprietaireId: filters.proprietaireId });
    }

    if (filters.estActif !== undefined) {
      query.andWhere('pp.estActif = :estActif', { estActif: filters.estActif });
    }

    // Filtre par date de référence
    if (filters.dateReference) {
      const dateRef = new Date(filters.dateReference);
      query.andWhere('pp.dateDebut <= :dateRef', { dateRef });
      query.andWhere('(pp.dateFin IS NULL OR pp.dateFin >= :dateRef)', { dateRef });
    }

    // Pagination
    query.skip(skip).take(limit);
    query.orderBy('pp.dateCreation', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<ParcelleProprietaire> {
    const parcelleProprietaire = await this.parcelleProprietaireRepository.findOne({
      where: { id },
      relations: ['parcelle', 'proprietaire']
    });

    if (!parcelleProprietaire) {
      throw new NotFoundException(`Relation parcelle-propriétaire avec l'ID ${id} introuvable`);
    }

    return parcelleProprietaire;
  }

  async update(id: number, updateDto: UpdateParcelleProprietaireDto): Promise<ParcelleProprietaire> {
    const parcelleProprietaire = await this.findOne(id);

    // Si on modifie la quote-part, vérifier la somme
    if (updateDto.quotePart && updateDto.quotePart !== parcelleProprietaire.quotePart) {
      await this.validateQuotePartsSum(
        parcelleProprietaire.parcelleId, 
        updateDto.quotePart, 
        id
      );
    }

    // Recalculer le montant individuel si nécessaire
    if (updateDto.quotePart && !updateDto.montantIndividuel) {
      const parcelle = await this.parcelleService.findOne(parcelleProprietaire.parcelleId);
      updateDto.montantIndividuel = parcelle.montantTotalTnb * updateDto.quotePart;
    }

    await this.parcelleProprietaireRepository.update(id, updateDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const parcelleProprietaire = await this.findOne(id);
    
    // Soft delete
    await this.parcelleProprietaireRepository.update(id, { 
      estActif: false,
      dateFin: new Date()
    });
  }

  // Gestion des quotes-parts pour une parcelle
  async updateQuoteParts(quotePartDto: QuotePartDto): Promise<ParcelleProprietaire[]> {
    return await this.dataSource.transaction(async manager => {
      const { parcelleId, proprietaires } = quotePartDto;

      // Vérifier que la parcelle existe
      const parcelle = await this.parcelleService.findOne(parcelleId);

      // Vérifier que la somme des quotes-parts = 1
      const sommeQuoteParts = proprietaires.reduce((sum, p) => sum + p.quotePart, 0);
      if (Math.abs(sommeQuoteParts - 1) > 0.0001) {
        throw new BadRequestException(
          `La somme des quotes-parts doit être égale à 1. Somme actuelle: ${sommeQuoteParts}`
        );
      }

      // Désactiver toutes les relations existantes pour cette parcelle
      await manager.update(ParcelleProprietaire, 
        { parcelleId, estActif: true },
        { estActif: false, dateFin: new Date() }
      );

      // Créer les nouvelles relations
      const nouveauxProprietaires = [];
      for (const prop of proprietaires) {
        // Vérifier que le propriétaire existe
        await this.proprietaireService.findOne(prop.proprietaireId);

        const montantIndividuel = parcelle.montantTotalTnb * prop.quotePart;
        
        const parcelleProprietaire = manager.create(ParcelleProprietaire, {
          parcelleId,
          proprietaireId: prop.proprietaireId,
          quotePart: prop.quotePart,
          montantIndividuel,
          estActif: true
        });

        nouveauxProprietaires.push(await manager.save(parcelleProprietaire));
      }

      return nouveauxProprietaires;
    });
  }

  // Méthodes utilitaires
  async getProprietairesByParcelle(parcelleId: number, dateReference?: Date): Promise<ParcelleProprietaire[]> {
    const query = this.parcelleProprietaireRepository.createQueryBuilder('pp')
      .leftJoinAndSelect('pp.proprietaire', 'proprietaire')
      .where('pp.parcelleId = :parcelleId', { parcelleId })
      .andWhere('pp.estActif = :actif', { actif: true });

    if (dateReference) {
      query.andWhere('pp.dateDebut <= :dateRef', { dateRef: dateReference });
      query.andWhere('(pp.dateFin IS NULL OR pp.dateFin >= :dateRef)', { dateRef: dateReference });
    } else {
      query.andWhere('pp.dateFin IS NULL');
    }

    return await query.orderBy('pp.quotePart', 'DESC').getMany();
  }

  async getParcellesByProprietaire(proprietaireId: number, dateReference?: Date): Promise<ParcelleProprietaire[]> {
    const query = this.parcelleProprietaireRepository.createQueryBuilder('pp')
      .leftJoinAndSelect('pp.parcelle', 'parcelle')
      .where('pp.proprietaireId = :proprietaireId', { proprietaireId })
      .andWhere('pp.estActif = :actif', { actif: true });

    if (dateReference) {
      query.andWhere('pp.dateDebut <= :dateRef', { dateRef: dateReference });
      query.andWhere('(pp.dateFin IS NULL OR pp.dateFin >= :dateRef)', { dateRef: dateReference });
    } else {
      query.andWhere('pp.dateFin IS NULL');
    }

    return await query.orderBy('parcelle.referenceFonciere', 'ASC').getMany();
  }

  async getStatistics() {
    const total = await this.parcelleProprietaireRepository.count({ 
      where: { estActif: true } 
    });

    // Parcelles en indivision
    const parcellesEnIndivision = await this.parcelleProprietaireRepository
      .createQueryBuilder('pp')
      .select('pp.parcelleId')
      .where('pp.estActif = :actif', { actif: true })
      .groupBy('pp.parcelleId')
      .having('COUNT(*) > 1')
      .getCount();

    // Quote-parts moyennes
    const quotePartStats = await this.parcelleProprietaireRepository
      .createQueryBuilder('pp')
      .select('AVG(pp.quotePart)', 'moyenne')
      .addSelect('MIN(pp.quotePart)', 'minimum')
      .addSelect('MAX(pp.quotePart)', 'maximum')
      .where('pp.estActif = :actif', { actif: true })
      .getRawOne();

    // Propriétaires avec le plus de parcelles
    const proprietairesActifs = await this.parcelleProprietaireRepository
      .createQueryBuilder('pp')
      .select('COUNT(DISTINCT pp.parcelleId)', 'nombreParcelles')
      .where('pp.estActif = :actif', { actif: true })
      .groupBy('pp.proprietaireId')
      .orderBy('nombreParcelles', 'DESC')
      .limit(5)
      .getCount();

    return {
      total,
      parcellesEnIndivision,
      tauxIndivision: total > 0 ? Math.round((parcellesEnIndivision / total) * 100) : 0,
      quotePartMoyenne: parseFloat(quotePartStats?.moyenne || '0'),
      quotePartMin: parseFloat(quotePartStats?.minimum || '0'),
      quotePartMax: parseFloat(quotePartStats?.maximum || '0'),
      proprietairesActifs
    };
  }

  private async validateQuotePartsSum(parcelleId: number, nouvelleQuotePart: number, excludeId?: number): Promise<void> {
    const query = this.parcelleProprietaireRepository.createQueryBuilder('pp')
      .select('SUM(pp.quotePart)', 'somme')
      .where('pp.parcelleId = :parcelleId', { parcelleId })
      .andWhere('pp.estActif = :actif', { actif: true })
      .andWhere('pp.dateFin IS NULL');

    if (excludeId) {
      query.andWhere('pp.id != :excludeId', { excludeId });
    }

    const result = await query.getRawOne();
    const sommeCourante = parseFloat(result?.somme || '0');
    const sommeTotal = sommeCourante + nouvelleQuotePart;

    if (sommeTotal > 1.0001) { // Tolérance pour les erreurs d'arrondi
      throw new BadRequestException(
        `La somme des quotes-parts dépasse 1 (100%). Somme actuelle: ${sommeCourante}, ` +
        `nouvelle quote-part: ${nouvelleQuotePart}, total: ${sommeTotal}`
      );
    }
  }
}