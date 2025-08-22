import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { JournalAction } from './entities/journal-action.entity';
import { CreateJournalDto } from './dto/create-journal.dto';
import { SearchJournalDto } from './dto/search-journal.dto';

export interface PaginatedJournalActions {
  data: JournalAction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivitySummary {
  totalActions: number;
  actionsByType: { action: string; count: number }[];
  actionsByTable: { table: string; count: number }[];
  actionsByUser: { userId: number; username: string; count: number }[];
  recentActivity: JournalAction[];
}

@Injectable()
export class JournalActionService {
  constructor(
    @InjectRepository(JournalAction)
    private journalRepository: Repository<JournalAction>,
  ) {}

  async create(createJournalDto: CreateJournalDto): Promise<JournalAction> {
    const journal = this.journalRepository.create(createJournalDto);
    return await this.journalRepository.save(journal);
  }

  async log(
    action: string,
    tableCible: string,
    idCible?: number,
    utilisateurId?: number,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<JournalAction> {
    return await this.create({
      action: action as any,
      tableCible,
      idCible,
      utilisateurId,
      details,
      ipAddress,
      userAgent
    });
  }

  async findAll(searchDto: SearchJournalDto = {}): Promise<PaginatedJournalActions> {
    const { 
      page = 1, 
      limit = 50, 
      sortBy = 'dateHeure', 
      sortOrder = 'DESC',
      dateDebut,
      dateFin,
      ...filters 
    } = searchDto;
    
    const skip = (page - 1) * limit;

    const query = this.journalRepository.createQueryBuilder('journal')
      .leftJoinAndSelect('journal.utilisateur', 'user');

    // Filtres de recherche
    if (filters.utilisateurId) {
      query.andWhere('journal.utilisateurId = :userId', { userId: filters.utilisateurId });
    }

    if (filters.action) {
      query.andWhere('journal.action = :action', { action: filters.action });
    }

    if (filters.tableCible) {
      query.andWhere('journal.tableCible = :table', { table: filters.tableCible });
    }

    if (filters.idCible) {
      query.andWhere('journal.idCible = :idCible', { idCible: filters.idCible });
    }

    if (filters.ipAddress) {
      query.andWhere('journal.ipAddress = :ip', { ip: filters.ipAddress });
    }

    // Filtres de date
    if (dateDebut && dateFin) {
      query.andWhere('journal.dateHeure BETWEEN :start AND :end', {
        start: new Date(dateDebut),
        end: new Date(dateFin + 'T23:59:59.999Z')
      });
    } else if (dateDebut) {
      query.andWhere('journal.dateHeure >= :start', { start: new Date(dateDebut) });
    } else if (dateFin) {
      query.andWhere('journal.dateHeure <= :end', { end: new Date(dateFin + 'T23:59:59.999Z') });
    }

    // Tri et pagination
    query.orderBy(`journal.${sortBy}`, sortOrder);
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

  async getActivitySummary(days: number = 30): Promise<ActivitySummary> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const query = this.journalRepository.createQueryBuilder('journal')
      .where('journal.dateHeure >= :date', { date: cutoffDate });

    // Total des actions
    const totalActions = await query.getCount();

    // Actions par type
    const actionsByType = await query
      .select('journal.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('journal.action')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Actions par table
    const actionsByTable = await query
      .select('journal.tableCible', 'table')
      .addSelect('COUNT(*)', 'count')
      .groupBy('journal.tableCible')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Actions par utilisateur
    const actionsByUser = await query
      .leftJoin('journal.utilisateur', 'user')
      .select('journal.utilisateurId', 'userId')
      .addSelect('user.username', 'username')
      .addSelect('COUNT(*)', 'count')
      .where('journal.utilisateurId IS NOT NULL')
      .groupBy('journal.utilisateurId, user.username')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Activité récente
    const recentActivity = await this.journalRepository
      .createQueryBuilder('journal')
      .leftJoinAndSelect('journal.utilisateur', 'user')
      .orderBy('journal.dateHeure', 'DESC')
      .limit(20)
      .getMany();

    return {
      totalActions,
      actionsByType: actionsByType.map(item => ({
        action: item.action,
        count: parseInt(item.count)
      })),
      actionsByTable: actionsByTable.map(item => ({
        table: item.table,
        count: parseInt(item.count)
      })),
      actionsByUser: actionsByUser.map(item => ({
        userId: item.userId,
        username: item.username || 'Utilisateur supprimé',
        count: parseInt(item.count)
      })),
      recentActivity
    };
  }

  async getActionsByEntity(tableCible: string, idCible: number): Promise<JournalAction[]> {
    return await this.journalRepository.find({
      where: { tableCible, idCible },
      relations: ['utilisateur'],
      order: { dateHeure: 'DESC' }
    });
  }

  async getUserActivity(utilisateurId: number, days: number = 30): Promise<JournalAction[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await this.journalRepository.find({
      where: {
        utilisateurId,
        dateHeure: MoreThanOrEqual(cutoffDate)
      },
      order: { dateHeure: 'DESC' },
      take: 100
    });
  }

  async getStatistics() {
    const total = await this.journalRepository.count();

    // Dernières 24h
    const derniere24h = new Date();
    derniere24h.setHours(derniere24h.getHours() - 24);
    const actions24h = await this.journalRepository.count({
      where: { dateHeure: MoreThanOrEqual(derniere24h) }
    });

    // Dernière semaine
    const derniereSeamaine = new Date();
    derniereSeamaine.setDate(derniereSeamaine.getDate() - 7);
    const actionsSeamaine = await this.journalRepository.count({
      where: { dateHeure: MoreThanOrEqual(derniereSeamaine) }
    });

    // Actions critiques récentes (dernières 24h)
    const actionsCritiques = await this.journalRepository.count({
      where: {
        action: 'DELETE',
        dateHeure: MoreThanOrEqual(derniere24h)
      }
    });

    // Utilisateurs actifs (dernières 24h)
    const utilisateursActifs = await this.journalRepository
      .createQueryBuilder('journal')
      .select('COUNT(DISTINCT journal.utilisateurId)', 'count')
      .where('journal.dateHeure >= :date', { date: derniere24h })
      .andWhere('journal.utilisateurId IS NOT NULL')
      .getRawOne();

    return {
      total,
      actions24h,
      actionsSeamaine,
      actionsCritiques,
      utilisateursActifs: parseInt(utilisateursActifs?.count || '0'),
      moyenneParJour: Math.round(actionsSeamaine / 7)
    };
  }

  // Méthodes de nettoyage
  async cleanOldEntries(days: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.journalRepository
      .createQueryBuilder()
      .delete()
      .where('dateHeure < :date', { date: cutoffDate })
      .execute();

    return result.affected || 0;
  }

  async archiveOldEntries(days: number = 90): Promise<JournalAction[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await this.journalRepository.find({
      where: { dateHeure: LessThanOrEqual(cutoffDate) },
      order: { dateHeure: 'ASC' }
    });
  }
}