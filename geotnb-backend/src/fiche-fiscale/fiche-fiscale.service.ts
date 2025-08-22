import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FicheFiscale } from './entities/fiche-fiscale.entity';
import { CreateFicheDto } from './dto/create-fiche.dto';
import { UpdateFicheDto } from './dto/update-fiche.dto';
import { GenerateFicheDto } from './dto/generate-fiche.dto';
import { SearchFicheDto } from './dto/search-fiche.dto';
import { FiscalCalculatorUtils } from './utils/fiscal-calculator.utils';
import { CodeUniqueUtils } from './utils/code-unique.utils';

export interface PaginatedFiches {
  data: FicheFiscale[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class FicheFiscaleService {
  constructor(
    @InjectRepository(FicheFiscale)
    private ficheRepository: Repository<FicheFiscale>,
  ) {}

  async create(createFicheDto: CreateFicheDto, userId: number): Promise<FicheFiscale> {
    // Vérifier si une fiche existe déjà pour cette année et ce parcelle-propriétaire
    const existingFiche = await this.ficheRepository.findOne({
      where: {
        parcelleProprietaireId: createFicheDto.parcelleProprietaireId,
        annee: createFicheDto.annee
      }
    });

    if (existingFiche) {
      throw new ConflictException('Une fiche fiscale existe déjà pour cette année et ce propriétaire');
    }

    // Générer un code unique
    const sequence = await this.getNextSequence();
    // Note: Dans une implémentation complète, il faudrait récupérer parcelleId et proprietaireId
    // depuis la relation ParcelleProprietaire
    const codeUnique = CodeUniqueUtils.generateCodeUnique(
      createFicheDto.annee,
      1, // temporaire - à récupérer depuis ParcelleProprietaire
      1, // temporaire - à récupérer depuis ParcelleProprietaire
      sequence
    );

    // Calculer la date limite si non fournie
    const dateLimitePayment = createFicheDto.dateLimitePayment 
      ? new Date(createFicheDto.dateLimitePayment)
      : FiscalCalculatorUtils.calculateDateLimitePayment(createFicheDto.annee);

    const fiche = this.ficheRepository.create({
      ...createFicheDto,
      codeUnique,
      dateLimitePayment,
      genereParId: userId
    });

    return await this.ficheRepository.save(fiche);
  }

  async generateBulk(generateDto: GenerateFicheDto, userId: number): Promise<FicheFiscale[]> {
    const fiches: FicheFiscale[] = [];

    for (const parcelleProprietaireId of generateDto.parcelleProprietaireIds) {
      // Vérifier si une fiche existe déjà
      const existingFiche = await this.ficheRepository.findOne({
        where: {
          parcelleProprietaireId,
          annee: generateDto.annee
        }
      });

      if (existingFiche) {
        continue; // Ignorer si déjà existante
      }

      // TODO: Récupérer les données depuis ParcelleProprietaire pour calculer le montant
      // const parcelleProprietaire = await this.parcelleProprietaireService.findOne(parcelleProprietaireId);
      // const montantTnb = FiscalCalculatorUtils.calculateMontantIndividuel(
      //   parcelleProprietaire.parcelle.montantTotalTnb,
      //   parcelleProprietaire.quotePart
      // );

      const createDto: CreateFicheDto = {
        parcelleProprietaireId,
        annee: generateDto.annee,
        montantTnb: 1000, // Temporaire - à calculer selon la logique métier
      };

      const fiche = await this.create(createDto, userId);
      fiches.push(fiche);
    }

    return fiches;
  }

  async findAll(searchDto: SearchFicheDto = {}): Promise<PaginatedFiches> {
    const { page = 1, limit = 10, sortBy = 'dateGeneration', sortOrder = 'DESC', ...filters } = searchDto;
    const skip = (page - 1) * limit;

    const query = this.ficheRepository.createQueryBuilder('fiche');

    // Filtres de recherche
    if (filters.codeUnique) {
      query.andWhere('fiche.codeUnique ILIKE :codeUnique', { 
        codeUnique: `%${filters.codeUnique}%` 
      });
    }

    if (filters.annee) {
      query.andWhere('fiche.annee = :annee', { annee: filters.annee });
    }

    if (filters.statutPayment) {
      query.andWhere('fiche.statutPayment = :statut', { statut: filters.statutPayment });
    }

    if (filters.dateGenerationDebut && filters.dateGenerationFin) {
      query.andWhere('fiche.dateGeneration BETWEEN :debut AND :fin', {
        debut: filters.dateGenerationDebut,
        fin: filters.dateGenerationFin
      });
    }

    // Tri
    query.orderBy(`fiche.${sortBy}`, sortOrder);

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

  async findOne(id: number): Promise<FicheFiscale> {
    const fiche = await this.ficheRepository.findOne({
      where: { id },
      // relations: ['parcelleProprietaire', 'genereParUtilisateur'],
    });

    if (!fiche) {
      throw new NotFoundException(`Fiche fiscale avec l'ID ${id} introuvable`);
    }

    return fiche;
  }

  async findByCodeUnique(codeUnique: string): Promise<FicheFiscale | null> {
    return await this.ficheRepository.findOne({
      where: { codeUnique },
    });
  }

  async update(id: number, updateFicheDto: UpdateFicheDto): Promise<FicheFiscale> {
    const fiche = await this.findOne(id);

    // Valider les montants
    if (updateFicheDto.montantPaye !== undefined && updateFicheDto.montantPaye > fiche.montantTnb) {
      throw new BadRequestException('Le montant payé ne peut pas dépasser le montant dû');
    }

    await this.ficheRepository.update(id, updateFicheDto);
    return await this.findOne(id);
  }

  async updateStatutPayment(id: number, nouveauStatut: string): Promise<FicheFiscale> {
    const fiche = await this.findOne(id);
    
    await this.ficheRepository.update(id, { 
      statutPayment: nouveauStatut as any 
    });
    
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const fiche = await this.findOne(id);
    await this.ficheRepository.remove(fiche);
  }

  async getStatistics(annee?: number) {
    const query = this.ficheRepository.createQueryBuilder('fiche');
    
    if (annee) {
      query.where('fiche.annee = :annee', { annee });
    }

    const total = await query.getCount();
    
    const byStatut = await query
      .select('fiche.statutPayment', 'statut')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(fiche.montantTnb)', 'montantTotal')
      .addSelect('SUM(fiche.montantPaye)', 'montantPaye')
      .groupBy('fiche.statutPayment')
      .getRawMany();

    const montantTotal = await query
      .select('SUM(fiche.montantTnb)', 'total')
      .getRawOne();

    const montantTotalPaye = await query
      .select('SUM(fiche.montantPaye)', 'total')
      .getRawOne();

    const fichesEnRetard = await this.ficheRepository
      .createQueryBuilder('fiche')
      .where('fiche.dateLimitePayment < :aujourdhui', { aujourdhui: new Date() })
      .andWhere('fiche.statutPayment != :paye', { paye: 'Paye' })
      .getCount();

    return {
      total,
      fichesEnRetard,
      montantTotal: parseFloat(montantTotal?.total || '0'),
      montantTotalPaye: parseFloat(montantTotalPaye?.total || '0'),
      tauxRecouvrement: montantTotal?.total > 0 
        ? Math.round((parseFloat(montantTotalPaye?.total || '0') / parseFloat(montantTotal.total)) * 100)
        : 0,
      byStatut: byStatut.map(item => ({
        statut: item.statut,
        count: parseInt(item.count),
        montantTotal: parseFloat(item.montantTotal || '0'),
        montantPaye: parseFloat(item.montantPaye || '0'),
      })),
    };
  }

  private async getNextSequence(): Promise<number> {
    const lastFiche = await this.ficheRepository
      .createQueryBuilder('fiche')
      .orderBy('fiche.id', 'DESC')
      .getOne();
    
    return lastFiche ? lastFiche.id + 1 : 1;
  }
}