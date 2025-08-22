import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parcelle } from '../parcelle/entities/parcelle.entity';
import { Proprietaire } from '../proprietaire/entities/proprietaire.entity';
import { User } from '../user/entities/user.entity';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import { KpiRequestDto } from './dto/kpi-request.dto';
import { StatisticsUtils } from './utils/statistics.utils';
import { ChartDataUtils } from './utils/chart-data.utils';

export interface DashboardKPI {
  key: string;
  label: string;
  value: number;
  formattedValue: string;
  variation?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: string;
  color?: string;
}

export interface DashboardStats {
  kpis: DashboardKPI[];
  charts: {
    parcellesParZone: any;
    recettesParMois: any;
    repartitionStatuts: any;
    evolutionTNB: any;
  };
  summary: {
    totalParcelles: number;
    totalRecettes: number;
    totalSurface: number;
    tauxValidation: number;
    derniereMiseAJour: Date;
  };
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Parcelle)
    private parcelleRepository: Repository<Parcelle>,
    @InjectRepository(Proprietaire)
    private proprietaireRepository: Repository<Proprietaire>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDashboardStats(filters: DashboardFilterDto = {}): Promise<DashboardStats> {
    const [kpis, charts, summary] = await Promise.all([
      this.getKPIs(filters),
      this.getChartData(filters),
      this.getSummary(filters)
    ]);

    return {
      kpis,
      charts,
      summary
    };
  }

  async getKPIs(filters: DashboardFilterDto, kpiRequest?: KpiRequestDto): Promise<DashboardKPI[]> {
    const query = this.buildBaseQuery(filters);
    
    // Récupérer les données actuelles
    const currentStats = await this.calculateStats(query);
    
    // Récupérer les données de l'année précédente pour comparaison
    const previousYear = (filters.annee || new Date().getFullYear()) - 1;
    const previousQuery = this.buildBaseQuery({ ...filters, annee: previousYear });
    const previousStats = await this.calculateStats(previousQuery);

    const kpis: DashboardKPI[] = [
      {
        key: 'total_parcelles',
        label: 'Total Parcelles',
        value: currentStats.totalParcelles,
        formattedValue: currentStats.totalParcelles.toLocaleString(),
        variation: StatisticsUtils.calculateVariation(currentStats.totalParcelles, previousStats.totalParcelles),
        trend: this.getTrend(currentStats.totalParcelles, previousStats.totalParcelles),
        icon: 'map',
        color: '#36A2EB'
      },
      {
        key: 'parcelles_imposables',
        label: 'Parcelles Imposables',
        value: currentStats.parcellesImposables,
        formattedValue: currentStats.parcellesImposables.toLocaleString(),
        variation: StatisticsUtils.calculateVariation(currentStats.parcellesImposables, previousStats.parcellesImposables),
        trend: this.getTrend(currentStats.parcellesImposables, previousStats.parcellesImposables),
        icon: 'calculator',
        color: '#4BC0C0'
      },
      {
        key: 'recettes_prevues',
        label: 'Recettes Prévues',
        value: currentStats.recettesPrevues,
        formattedValue: StatisticsUtils.formatCurrency(currentStats.recettesPrevues),
        variation: StatisticsUtils.calculateVariation(currentStats.recettesPrevues, previousStats.recettesPrevues),
        trend: this.getTrend(currentStats.recettesPrevues, previousStats.recettesPrevues),
        icon: 'dollar-sign',
        color: '#FFCE56'
      },
      {
        key: 'surface_totale',
        label: 'Surface Totale',
        value: currentStats.surfaceTotale,
        formattedValue: StatisticsUtils.formatSurface(currentStats.surfaceTotale),
        variation: StatisticsUtils.calculateVariation(currentStats.surfaceTotale, previousStats.surfaceTotale),
        trend: this.getTrend(currentStats.surfaceTotale, previousStats.surfaceTotale),
        icon: 'maximize',
        color: '#9966FF'
      },
      {
        key: 'prix_moyen_m2',
        label: 'Prix Moyen/m²',
        value: currentStats.prixMoyenM2,
        formattedValue: `${currentStats.prixMoyenM2.toFixed(2)} DH/m²`,
        variation: StatisticsUtils.calculateVariation(currentStats.prixMoyenM2, previousStats.prixMoyenM2),
        trend: this.getTrend(currentStats.prixMoyenM2, previousStats.prixMoyenM2),
        icon: 'trending-up',
        color: '#FF6384'
      },
      {
        key: 'taux_validation',
        label: 'Taux de Validation',
        value: currentStats.tauxValidation,
        formattedValue: `${currentStats.tauxValidation.toFixed(1)}%`,
        variation: StatisticsUtils.calculateVariation(currentStats.tauxValidation, previousStats.tauxValidation),
        trend: this.getTrend(currentStats.tauxValidation, previousStats.tauxValidation),
        icon: 'check-circle',
        color: '#FF9F40'
      }
    ];

    // Filtrer les KPIs demandés si spécifié
    if (kpiRequest?.kpis?.length) {
      return kpis.filter(kpi => kpiRequest.kpis.includes(kpi.key));
    }

    return kpis;
  }

  async getChartData(filters: DashboardFilterDto) {
    const [
      parcellesParZone,
      recettesParMois,
      repartitionStatuts,
      evolutionTNB
    ] = await Promise.all([
      this.getParcellesParZone(filters),
      this.getRecettesParMois(filters),
      this.getRepartitionStatuts(filters),
      this.getEvolutionTNB(filters)
    ]);

    return {
      parcellesParZone: ChartDataUtils.prepareBarChart(
        parcellesParZone, 
        'zonage', 
        'count', 
        'Nombre de Parcelles'
      ),
      recettesParMois: ChartDataUtils.prepareLineChart(
        recettesParMois,
        'mois',
        'recettes',
        'Recettes TNB'
      ),
      repartitionStatuts: ChartDataUtils.preparePieChart(
        repartitionStatuts,
        'statut',
        'count'
      ),
      evolutionTNB: ChartDataUtils.prepareMultiSeriesChart(
        evolutionTNB,
        'annee',
        [
          { field: 'parcelles', label: 'Parcelles', color: '#36A2EB' },
          { field: 'recettes', label: 'Recettes (K DH)', color: '#FFCE56' }
        ]
      )
    };
  }

  async getSummary(filters: DashboardFilterDto) {
    const stats = await this.calculateStats(this.buildBaseQuery(filters));
    
    return {
      totalParcelles: stats.totalParcelles,
      totalRecettes: stats.recettesPrevues,
      totalSurface: stats.surfaceTotale,
      tauxValidation: stats.tauxValidation,
      derniereMiseAJour: new Date()
    };
  }

  // Méthodes avancées pour analyses spécifiques
  async getAnalyseComparative(filters: DashboardFilterDto) {
    const anneeActuelle = filters.annee || new Date().getFullYear();
    const anneePrecedente = anneeActuelle - 1;

    const [current, previous] = await Promise.all([
      this.calculateStats(this.buildBaseQuery({ ...filters, annee: anneeActuelle })),
      this.calculateStats(this.buildBaseQuery({ ...filters, annee: anneePrecedente }))
    ]);

    return {
      anneeActuelle: {
        annee: anneeActuelle,
        ...current
      },
      anneePrecedente: {
        annee: anneePrecedente,
        ...previous
      },
      variations: {
        parcelles: StatisticsUtils.calculateVariation(current.totalParcelles, previous.totalParcelles),
        recettes: StatisticsUtils.calculateVariation(current.recettesPrevues, previous.recettesPrevues),
        surface: StatisticsUtils.calculateVariation(current.surfaceTotale, previous.surfaceTotale)
      }
    };
  }

  async getTopZones(limit: number = 10) {
    return await this.parcelleRepository
      .createQueryBuilder('parcelle')
      .select('parcelle.zonage', 'zonage')
      .addSelect('COUNT(*)', 'nombreParcelles')
      .addSelect('SUM(parcelle.surface_totale)', 'surfaceTotale')
      .addSelect('SUM(parcelle.montant_total_tnb)', 'recettesTotales')
      .addSelect('AVG(parcelle.prix_unitaire_m2)', 'prixMoyenM2')
      .where('parcelle.etat_validation != :archive', { archive: 'Archive' })
      .andWhere('parcelle.zonage IS NOT NULL')
      .groupBy('parcelle.zonage')
      .orderBy('SUM(parcelle.montant_total_tnb)', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  // Méthodes privées
  private buildBaseQuery(filters: DashboardFilterDto) {
    let query = this.parcelleRepository.createQueryBuilder('parcelle')
      .where('parcelle.etat_validation != :archive', { archive: 'Archive' });

    if (filters.zonage) {
      query = query.andWhere('parcelle.zonage = :zonage', { zonage: filters.zonage });
    }

    if (filters.statutFoncier) {
      query = query.andWhere('parcelle.statut_foncier = :statutFoncier', { 
        statutFoncier: filters.statutFoncier 
      });
    }

    if (filters.etatValidation) {
      query = query.andWhere('parcelle.etat_validation = :etatValidation', { 
        etatValidation: filters.etatValidation 
      });
    }

    if (filters.dateDebut) {
      query = query.andWhere('parcelle.date_creation >= :dateDebut', { 
        dateDebut: filters.dateDebut 
      });
    }

    if (filters.dateFin) {
      query = query.andWhere('parcelle.date_creation <= :dateFin', { 
        dateFin: filters.dateFin 
      });
    }

    if (filters.annee) {
      query = query.andWhere('EXTRACT(YEAR FROM parcelle.date_creation) = :annee', { 
        annee: filters.annee 
      });
    }

    return query;
  }

  private async calculateStats(query: any) {
    const [
      totalResult,
      imposablesResult,
      recettesResult,
      surfaceResult,
      validationResult
    ] = await Promise.all([
      query.clone().getCount(),
      query.clone().andWhere('parcelle.exonere_tnb = :exonere', { exonere: false }).getCount(),
      query.clone().select('SUM(parcelle.montant_total_tnb)', 'total').getRawOne(),
      query.clone().select('SUM(parcelle.surface_totale)', 'total').getRawOne(),
      query.clone().andWhere('parcelle.etat_validation = :valide', { valide: 'Valide' }).getCount()
    ]);

    const totalParcelles = totalResult || 0;
    const recettesPrevues = parseFloat(recettesResult?.total || '0');
    const surfaceTotale = parseFloat(surfaceResult?.total || '0');
    const parcellesValidees = validationResult || 0;

    return {
      totalParcelles,
      parcellesImposables: imposablesResult || 0,
      recettesPrevues,
      surfaceTotale,
      prixMoyenM2: surfaceTotale > 0 ? recettesPrevues / surfaceTotale : 0,
      tauxValidation: totalParcelles > 0 ? (parcellesValidees / totalParcelles) * 100 : 0
    };
  }

  private async getParcellesParZone(filters: DashboardFilterDto) {
    return await this.buildBaseQuery(filters)
      .select('parcelle.zonage', 'zonage')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(parcelle.montant_total_tnb)', 'recettes')
      .groupBy('parcelle.zonage')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  private async getRecettesParMois(filters: DashboardFilterDto) {
    const annee = filters.annee || new Date().getFullYear();
    
    return await this.parcelleRepository
      .createQueryBuilder('parcelle')
      .select('EXTRACT(MONTH FROM parcelle.date_creation)', 'mois')
      .addSelect('SUM(parcelle.montant_total_tnb)', 'recettes')
      .where('EXTRACT(YEAR FROM parcelle.date_creation) = :annee', { annee })
      .andWhere('parcelle.etat_validation != :archive', { archive: 'Archive' })
      .groupBy('EXTRACT(MONTH FROM parcelle.date_creation)')
      .orderBy('mois', 'ASC')
      .getRawMany();
  }

  private async getRepartitionStatuts(filters: DashboardFilterDto) {
    return await this.buildBaseQuery(filters)
      .select('parcelle.etat_validation', 'statut')
      .addSelect('COUNT(*)', 'count')
      .groupBy('parcelle.etat_validation')
      .getRawMany();
  }

  private async getEvolutionTNB(filters: DashboardFilterDto) {
    const anneeActuelle = filters.annee || new Date().getFullYear();
    const annees = Array.from({ length: 5 }, (_, i) => anneeActuelle - 4 + i);

    const results = await Promise.all(
      annees.map(async (annee) => {
        const stats = await this.calculateStats(
          this.buildBaseQuery({ ...filters, annee })
        );
        return {
          annee: annee.toString(),
          parcelles: stats.totalParcelles,
          recettes: Math.round(stats.recettesPrevues / 1000) // En milliers de DH
        };
      })
    );

    return results;
  }

  private getTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    const variation = StatisticsUtils.calculateVariation(current, previous);
    if (variation > 2) return 'up';
    if (variation < -2) return 'down';
    return 'stable';
  }
}