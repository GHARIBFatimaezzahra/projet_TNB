import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { Observable, tap } from 'rxjs';

export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv' | 'geojson';
  filters?: any;
  columns?: string[];
  filename?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  exportParcelles(options: ExportOptions): Observable<Blob> {
    return this.apiService.downloadFile(`parcelles/export?format=${options.format}`, options.filename)
      .pipe(
        tap(() => {
          this.notificationService.success('Export terminé avec succès');
        })
      );
  }

  exportFiscalFiles(parcelleIds: number[], options: ExportOptions): Observable<Blob> {
    return this.apiService.downloadFile(
      `fiches-fiscales/export?format=${options.format}&ids=${parcelleIds.join(',')}`, 
      options.filename
    );
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  generateFilename(type: string, format: string): string {
    const date = new Date().toISOString().split('T')[0];
    return `${type}_${date}.${format}`;
  }
}