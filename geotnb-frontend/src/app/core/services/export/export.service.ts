import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
  type?: 'text' | 'number' | 'date' | 'currency' | 'boolean';
  format?: (value: any) => string;
}

export interface ExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  includeTimestamp?: boolean;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'a3' | 'letter';
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Export vers Excel
   */
  exportToExcel<T>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions = {}
  ): Observable<void> {
    return from(this.performExcelExport(data, columns, options));
  }

  /**
   * Export vers PDF
   */
  exportToPDF<T>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions = {}
  ): Observable<void> {
    return from(this.performPDFExport(data, columns, options));
  }

  /**
   * Export vers CSV
   */
  exportToCSV<T>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions = {}
  ): Observable<void> {
    return from(this.performCSVExport(data, columns, options));
  }

  /**
   * Export multiple sheets Excel
   */
  exportMultiSheetExcel(
    sheets: Array<{
      name: string;
      data: any[];
      columns: ExportColumn[];
    }>,
    options: ExportOptions = {}
  ): Observable<void> {
    return from(this.performMultiSheetExport(sheets, options));
  }

  private async performExcelExport<T>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions
  ): Promise<void> {
    const workbook = XLSX.utils.book_new();
    const worksheet = this.createWorksheet(data, columns);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');
    
    const filename = this.generateFilename(options.filename || 'export', 'xlsx', options.includeTimestamp);
    XLSX.writeFile(workbook, filename);
  }

  private async performPDFExport<T>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions
  ): Promise<void> {
    const pdf = new jsPDF({
      orientation: options.orientation || 'landscape',
      unit: 'mm',
      format: options.pageSize || 'a4'
    });

    // Configuration des polices pour supporter les caractères spéciaux
    pdf.setFont('helvetica');

    // Titre et informations d'en-tête
    if (options.title) {
      pdf.setFontSize(16);
      pdf.text(options.title, 20, 20);
    }

    if (options.subtitle) {
      pdf.setFontSize(12);
      pdf.text(options.subtitle, 20, 30);
    }

    // Date d'export
    if (options.includeTimestamp) {
      const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr });
      pdf.setFontSize(10);
      pdf.text(`Exporté le: ${timestamp}`, 20, options.title ? 40 : 20);
    }

    // Préparation des données pour le tableau
    const tableData = this.prepareTableData(data, columns);
    const headers = columns.map(col => col.label);

    // Génération du tableau
    autoTable(pdf, {
      head: [headers],
      body: tableData,
      startY: options.title ? 50 : 30,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: this.getColumnStyles(columns),
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      didDrawPage: (data) => {
        // Pied de page
        const pageCount = (pdf as any).internal.getNumberOfPages();
        pdf.setFontSize(8);
        pdf.text(
          `Page ${data.pageNumber} sur ${pageCount}`,
          data.settings.margin.left,
          pdf.internal.pageSize.height - 10
        );
      }
    });

    const filename = this.generateFilename(options.filename || 'export', 'pdf', options.includeTimestamp);
    pdf.save(filename);
  }

  private async performCSVExport<T>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions
  ): Promise<void> {
    const worksheet = this.createWorksheet(data, columns);
    const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' }); // Utiliser ; comme séparateur
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM pour Excel
    const filename = this.generateFilename(options.filename || 'export', 'csv', options.includeTimestamp);
    saveAs(blob, filename);
  }

  private async performMultiSheetExport(
    sheets: Array<{
      name: string;
      data: any[];
      columns: ExportColumn[];
    }>,
    options: ExportOptions
  ): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    sheets.forEach(sheet => {
      const worksheet = this.createWorksheet(sheet.data, sheet.columns);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });
    
    const filename = this.generateFilename(options.filename || 'export-multi', 'xlsx', options.includeTimestamp);
    XLSX.writeFile(workbook, filename);
  }

  private createWorksheet<T>(data: T[], columns: ExportColumn[]): XLSX.WorkSheet {
    // Préparation des en-têtes
    const headers = columns.map(col => col.label);
    
    // Préparation des données
    const worksheetData = [
      headers,
      ...this.prepareTableData(data, columns)
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Définition des largeurs de colonnes
    const columnWidths = columns.map(col => ({
      wch: col.width || 15
    }));
    worksheet['!cols'] = columnWidths;
    
    return worksheet;
  }

  private prepareTableData<T>(data: T[], columns: ExportColumn[]): any[][] {
    return data.map(item => 
      columns.map(column => {
        const value = this.getNestedValue(item, column.key);
        return this.formatValue(value, column);
      })
    );
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private formatValue(value: any, column: ExportColumn): any {
    if (value === null || value === undefined) {
      return '';
    }

    if (column.format) {
      return column.format(value);
    }

    switch (column.type) {
      case 'date':
        return value instanceof Date ? format(value, 'dd/MM/yyyy', { locale: fr }) : value;
      case 'currency':
        return typeof value === 'number' ? `${value.toFixed(2)} DH` : value;
      case 'number':
        return typeof value === 'number' ? value.toLocaleString('fr-FR') : value;
      case 'boolean':
        return value ? 'Oui' : 'Non';
      default:
        return value;
    }
  }

  private getColumnStyles(columns: ExportColumn[]): any {
    const styles: any = {};
    columns.forEach((column, index) => {
      if (column.type === 'number' || column.type === 'currency') {
        styles[index] = { halign: 'right' };
      } else if (column.type === 'date') {
        styles[index] = { halign: 'center' };
      }
    });
    return styles;
  }

  private generateFilename(base: string, extension: string, includeTimestamp = true): string {
    const timestamp = includeTimestamp 
      ? `_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`
      : '';
    return `${base}${timestamp}.${extension}`;
  }
}