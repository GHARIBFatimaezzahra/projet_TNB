import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ExportService, ExportColumn, ExportOptions } from './export.service';
import { ApiService } from '../api/api.service';
import { API_ENDPOINTS } from '../api/endpoints.constants';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'parcelles' | 'proprietaires' | 'fiches-fiscales' | 'revenue' | 'custom';
  columns: ExportColumn[];
  filters?: any;
  options?: ExportOptions;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in';
  value: any;
  value2?: any; // Pour l'opérateur 'between'
}

export interface ReportRequest {
  templateId?: string;
  title: string;
  subtitle?: string;
  filters?: ReportFilter[];
  columns?: ExportColumn[];
  format: 'excel' | 'pdf' | 'csv';
  options?: ExportOptions;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly apiService = inject(ApiService);
  private readonly exportService = inject(ExportService);

  // Templates prédéfinis
  private readonly predefinedTemplates: ReportTemplate[] = [
    {
      id: 'parcelles-summary',
      name: 'Résumé des Parcelles',
      description: 'Liste complète des parcelles avec informations fiscales',
      type: 'parcelles',
      columns: [
        { key: 'referenceFonciere', label: 'Référence Foncière', width: 20 },
        { key: 'surfaceTotale', label: 'Surface Totale (m²)', type: 'number', width: 15 },
        { key: 'surfaceImposable', label: 'Surface Imposable (m²)', type: 'number', width: 15 },
        { key: 'statutFoncier', label: 'Statut Foncier', width: 15 },
        { key: 'zonage', label: 'Zonage', width: 15 },
        { key: 'montantTotalTNB', label: 'Montant TNB (DH)', type: 'currency', width: 15 },
        { key: 'etatValidation', label: 'État', width: 12 }
      ]
    },
    {
      id: 'proprietaires-list',
      name: 'Liste des Propriétaires',
      description: 'Répertoire complet des propriétaires',
      type: 'proprietaires',
      columns: [
        { key: 'nom', label: 'Nom/Raison Sociale', width: 25 },
        { key: 'nature', label: 'Type', width: 15 },
        { key: 'cin_ou_rc', label: 'CIN/RC', width: 15 },
        { key: 'adresse', label: 'Adresse', width: 30 },
        { key: 'telephone', label: 'Téléphone', width: 15 },
        { key: 'parcellesCount', label: 'Nb Parcelles', type: 'number', width: 12 }
      ]
    },
    {
      id: 'revenue-analysis',
      name: 'Analyse des Revenus TNB',
      description: 'Analyse détaillée des revenus par zone et statut',
      type: 'revenue',
      columns: [
        { key: 'zonage', label: 'Zone', width: 15 },
        { key: 'nombreParcelles', label: 'Nb Parcelles', type: 'number', width: 12 },
        { key: 'surfaceTotale', label: 'Surface Totale (m²)', type: 'number', width: 15 },
        { key: 'revenuTotal', label: 'Revenu Total (DH)', type: 'currency', width: 18 },
        { key: 'revenuMoyen', label: 'Revenu Moyen (DH)', type: 'currency', width: 18 },
        { key: 'tauxRecouvrement', label: 'Taux Recouvrement (%)', type: 'number', width: 15 }
      ]
    }
  ];

  /**
   * Générer un rapport
   */
  generateReport(request: ReportRequest): Observable<void> {
    return new Observable(observer => {
      this.fetchReportData(request).subscribe({
        next: (data) => {
          const columns = request.columns || this.getTemplateColumns(request.templateId);
          const options: ExportOptions = {
            filename: this.sanitizeFilename(request.title),
            title: request.title,
            subtitle: request.subtitle,
            includeTimestamp: true,
            ...request.options
          };

          let exportObservable: Observable<void>;

          switch (request.format) {
            case 'excel':
              exportObservable = this.exportService.exportToExcel(data, columns, options);
              break;
            case 'pdf':
              exportObservable = this.exportService.exportToPDF(data, columns, options);
              break;
            case 'csv':
              exportObservable = this.exportService.exportToCSV(data, columns, options);
              break;
            default:
              observer.error(new Error(`Format non supporté: ${request.format}`));
              return;
          }

          exportObservable.subscribe({
            next: () => observer.next(),
            error: (error) => observer.error(error),
            complete: () => observer.complete()
          });
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Générer un rapport multi-onglets
   */
  generateMultiSheetReport(
    sheets: Array<{
      name: string;
      request: ReportRequest;
    }>,
    filename: string
  ): Observable<void> {
    return new Observable(observer => {
      const sheetPromises = sheets.map(async sheet => {
        const data = await this.fetchReportData(sheet.request).toPromise();
        const columns = sheet.request.columns || this.getTemplateColumns(sheet.request.templateId);
        
        return {
          name: sheet.name,
          data: data || [],
          columns
        };
      });

      Promise.all(sheetPromises).then(sheetsData => {
        this.exportService.exportMultiSheetExcel(sheetsData, {
          filename: this.sanitizeFilename(filename),
          includeTimestamp: true
        }).subscribe({
          next: () => observer.next(),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      }).catch(error => observer.error(error));
    });
  }

  /**
   * Obtenir les templates disponibles
   */
  getAvailableTemplates(): ReportTemplate[] {
    return [...this.predefinedTemplates];
  }

  /**
   * Obtenir un template par ID
   */
  getTemplate(id: string): ReportTemplate | undefined {
    return this.predefinedTemplates.find(template => template.id === id);
  }

  /**
   * Générer un rapport de fiches fiscales
   */
  generateFiscalReport(
    filters: any = {},
    format: 'excel' | 'pdf' = 'pdf'
  ): Observable<void> {
    const request: ReportRequest = {
      templateId: 'fiches-fiscales',
      title: 'Rapport des Fiches Fiscales TNB',
      subtitle: `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
      filters: this.convertToReportFilters(filters),
      format,
      columns: [
        { key: 'codeUnique', label: 'Code Fiche', width: 15 },
        { key: 'parcelle.referenceFonciere', label: 'Référence Foncière', width: 20 },
        { key: 'proprietaire.nom', label: 'Propriétaire', width: 25 },
        { key: 'montantTNB', label: 'Montant TNB (DH)', type: 'currency', width: 15 },
        { key: 'dateGeneration', label: 'Date Génération', type: 'date', width: 15 },
        { key: 'statut', label: 'Statut', width: 12 }
      ]
    };

    return this.generateReport(request);
  }

  private fetchReportData(request: ReportRequest): Observable<any[]> {
    let endpoint = '';
    const params = this.buildQueryParams(request.filters);

    switch (request.templateId) {
      case 'parcelles-summary':
        endpoint = API_ENDPOINTS.PARCELLES.BASE;
        break;
      case 'proprietaires-list':
        endpoint = API_ENDPOINTS.PROPRIETAIRES.BASE;
        break;
      case 'revenue-analysis':
        endpoint = API_ENDPOINTS.DASHBOARD.REVENUE_EVOLUTION;
        break;
      case 'fiches-fiscales':
        endpoint = API_ENDPOINTS.FICHES_FISCALES.BASE;
        break;
      default:
        endpoint = API_ENDPOINTS.PARCELLES.BASE;
    }

    return this.apiService.get<any[]>(endpoint, params);
  }

  private getTemplateColumns(templateId?: string): ExportColumn[] {
    if (!templateId) {
      return [];
    }
    const template = this.getTemplate(templateId);
    return template?.columns || [];
  }

  private buildQueryParams(filters?: ReportFilter[]): any {
    if (!filters || filters.length === 0) {
      return {};
    }

    const params: any = {};
    filters.forEach(filter => {
      const key = filter.field;
      switch (filter.operator) {
        case 'equals':
          params[key] = filter.value;
          break;
        case 'contains':
          params[`${key}_like`] = filter.value;
          break;
        case 'gt':
          params[`${key}_gt`] = filter.value;
          break;
        case 'gte':
          params[`${key}_gte`] = filter.value;
          break;
        case 'lt':
          params[`${key}_lt`] = filter.value;
          break;
        case 'lte':
          params[`${key}_lte`] = filter.value;
          break;
        case 'between':
          params[`${key}_gte`] = filter.value;
          params[`${key}_lte`] = filter.value2;
          break;
        case 'in':
          params[`${key}_in`] = Array.isArray(filter.value) ? filter.value.join(',') : filter.value;
          break;
      }
    });

    return params;
  }

  private convertToReportFilters(filters: any): ReportFilter[] {
    const reportFilters: ReportFilter[] = [];
    
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        reportFilters.push({
          field: key,
          operator: 'equals',
          value
        });
      }
    });

    return reportFilters;
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9\s-_]/gi, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .toLowerCase();
  }
}
