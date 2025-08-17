import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { LoadingService } from './loading.service';
import { NotificationService } from './notification.service';

export interface ExportOptions {
  filename?: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  title?: string;
  columns?: ExportColumn[];
  data: any[];
}

export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
  type?: 'string' | 'number' | 'date' | 'currency';
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private http = inject(HttpClient);
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);

  // =================== MÉTHODES PUBLIQUES ===================
  async exportData(options: ExportOptions): Promise<void> {
    this.loadingService.show('Préparation de l\'export...');

    try {
      switch (options.format) {
        case 'pdf':
          await this.exportToPDF(options);
          break;
        case 'excel':
          await this.exportToExcel(options);
          break;
        case 'csv':
          await this.exportToCSV(options);
          break;
        case 'json':
          await this.exportToJSON(options);
          break;
        default:
          throw new Error('Format d\'export non supporté');
      }

      this.notificationService.showSuccess(
        'Export réussi',
        `Fichier ${options.format.toUpperCase()} téléchargé avec succès`
      );
    } catch (error) {
      this.notificationService.showError(
        'Erreur d\'export',
        'Impossible d\'exporter les données'
      );
      throw error;
    } finally {
      this.loadingService.hide();
    }
  }

  // =================== EXPORT PDF ===================
  private async exportToPDF(options: ExportOptions): Promise<void> {
    const doc = new jsPDF();
    const filename = options.filename || `export-${Date.now()}.pdf`;

    // Titre
    if (options.title) {
      doc.setFontSize(16);
      doc.text(options.title, 20, 20);
    }

    // Préparer les données pour le tableau
    const headers = options.columns?.map(col => col.label) || Object.keys(options.data[0] || {});
    const rows = options.data.map(item => 
      options.columns?.map(col => this.formatCellValue(item[col.key], col.type)) || 
      Object.values(item)
    );

    // Générer le tableau
    (doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: options.title ? 30 : 20,
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255
      },
      columnStyles: this.getPDFColumnStyles(options.columns)
    });

    // Ajouter pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} sur ${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')}`,
        20,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(filename);
  }

  // =================== EXPORT EXCEL ===================
  private async exportToExcel(options: ExportOptions): Promise<void> {
    const filename = options.filename || `export-${Date.now()}.xlsx`;
    
    // Créer un nouveau workbook
    const wb = XLSX.utils.book_new();
    
    // Préparer les données
    const worksheetData = this.prepareExcelData(options);
    
    // Créer la feuille de calcul
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Appliquer le style aux en-têtes
    if (options.columns) {
      const headerRange = XLSX.utils.encode_range({
        s: { c: 0, r: 0 },
        e: { c: options.columns.length - 1, r: 0 }
      });
      
      ws['!ref'] = headerRange;
      
      // Définir les largeurs de colonnes
      ws['!cols'] = options.columns.map(col => ({
        wch: col.width || 15
      }));
    }
    
    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Données');
    
    // Écrire le fichier
    XLSX.writeFile(wb, filename);
  }

  // =================== EXPORT CSV ===================
  private async exportToCSV(options: ExportOptions): Promise<void> {
    const filename = options.filename || `export-${Date.now()}.csv`;
    
    // Préparer les en-têtes
    const headers = options.columns?.map(col => col.label) || Object.keys(options.data[0] || {});
    
    // Préparer les lignes de données
    const rows = options.data.map(item => 
      options.columns?.map(col => this.formatCellValue(item[col.key], col.type)) || 
      Object.values(item)
    );
    
    // Combiner en-têtes et données
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => this.escapeCsvCell(cell)).join(';'))
      .join('\n');
    
    // Ajouter BOM pour l'UTF-8
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }

  // =================== EXPORT JSON ===================
  private async exportToJSON(options: ExportOptions): Promise<void> {
    const filename = options.filename || `export-${Date.now()}.json`;
    
    const jsonData = {
      exportedAt: new Date().toISOString(),
      title: options.title || 'Export de données',
      totalRecords: options.data.length,
      data: options.data
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
      type: 'application/json' 
    });
    saveAs(blob, filename);
  }

  // =================== MÉTHODES UTILITAIRES ===================
  private prepareExcelData(options: ExportOptions): any[][] {
    const headers = options.columns?.map(col => col.label) || Object.keys(options.data[0] || {});
    const rows = options.data.map(item => 
      options.columns?.map(col => this.formatCellValue(item[col.key], col.type)) || 
      Object.values(item)
    );
    
    return [headers, ...rows];
  }

  private formatCellValue(value: any, type?: string): any {
    if (value === null || value === undefined) {
      return '';
    }
    
    switch (type) {
      case 'date':
        return value instanceof Date ? value.toLocaleDateString('fr-FR') : value;
      case 'currency':
        return typeof value === 'number' ? `${value.toFixed(2)} MAD` : value;
      case 'number':
        return typeof value === 'number' ? value.toLocaleString('fr-FR') : value;
      default:
        return value.toString();
    }
  }

  private escapeCsvCell(value: any): string {
    const str = value?.toString() || '';
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private getPDFColumnStyles(columns?: ExportColumn[]): any {
    if (!columns) return {};
    
    const styles: any = {};
    columns.forEach((col, index) => {
      if (col.type === 'number' || col.type === 'currency') {
        styles[index] = { halign: 'right' };
      } else if (col.type === 'date') {
        styles[index] = { halign: 'center' };
      }
    });
    
    return styles;
  }

  // =================== DOWNLOAD DE FICHIERS DEPUIS API ===================
  downloadFromApi(endpoint: string, filename?: string): Observable<void> {
    return this.http.get(endpoint, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      tap(response => {
        const blob = response.body!;
        const finalFilename = filename || this.extractFilenameFromHeaders(response.headers);
        saveAs(blob, finalFilename);
        
        this.notificationService.showSuccess(
          'Téléchargement réussi',
          `Fichier ${finalFilename} téléchargé`
        );
      }),
      map(() => void 0)
    );
  }

  private extractFilenameFromHeaders(headers: any): string {
    const contentDisposition = headers.get('content-disposition');
    if (contentDisposition) {
      const matches = /filename="([^"]*)"/.exec(contentDisposition);
      if (matches && matches[1]) {
        return matches[1];
      }
    }
    return `download-${Date.now()}`;
  }
}