// core/utils/helpers.ts (CORRIGÉ - Version navigateur)
import { APP_CONSTANTS } from './constants';

export class HelperUtils {
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat(APP_CONSTANTS.CURRENCY.LOCALE, {
      style: 'currency',
      currency: APP_CONSTANTS.CURRENCY.CODE,
      minimumFractionDigits: 2
    }).format(amount);
  }

  static formatArea(area: number, unit = 'm²'): string {
    if (area < 1) {
      return `${(area * 10000).toFixed(0)} cm²`;
    } else if (area < 10000) {
      return `${area.toFixed(2)} ${unit}`;
    } else {
      return `${(area / 10000).toFixed(2)} ha`;
    }
  }

  static formatDate(date: Date | string, format = APP_CONSTANTS.DATE_FORMATS.DISPLAY): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Simple format implementation (in real app, use date-fns or similar)
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    switch (format) {
      case APP_CONSTANTS.DATE_FORMATS.DISPLAY:
        return `${day}/${month}/${year}`;
      case APP_CONSTANTS.DATE_FORMATS.API:
        return `${year}-${month}-${day}`;
      default:
        return dateObj.toLocaleDateString('fr-FR');
    }
  }

  static generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  static copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }

  // Version navigateur du debounce - utilise number au lieu de NodeJS.Timeout
  static debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func(...args), delay);
    };
  }

  // Version navigateur du throttle
  static throttle<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }

  static isValidGeometry(geometry: any): boolean {
    if (!geometry || !geometry.type || !geometry.coordinates) {
      return false;
    }

    const validTypes = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'];
    return validTypes.includes(geometry.type) && Array.isArray(geometry.coordinates);
  }

  static calculateDistance(
    point1: [number, number],
    point2: [number, number]
  ): number {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2[1] - point1[1]);
    const dLon = this.toRadians(point2[0] - point1[0]);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1[1])) * Math.cos(this.toRadians(point2[1])) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Utilitaires spécifiques au projet TNB
  static formatReference(ref: string): string {
    // Formate les références foncières (TF/123/A, R/456/B, etc.)
    return ref.toUpperCase().replace(/\s+/g, '');
  }

  static validateCIN(cin: string): boolean {
    // Validation simple du CIN marocain
    const cleanCin = cin.replace(/\s+/g, '').toUpperCase();
    const cinPattern = /^[A-Z]{1,2}[0-9]{1,6}$/;
    return cinPattern.test(cleanCin);
  }

  static validateRC(rc: string): boolean {
    // Validation simple du RC marocain
    const cleanRc = rc.replace(/\s+/g, '');
    const rcPattern = /^[0-9]{1,6}$/;
    return rcPattern.test(cleanRc);
  }

  static formatPhoneNumber(phone: string): string {
    // Formate les numéros de téléphone marocains
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    }
    return phone;
  }

  static calculateQuotePart(quoteParts: number[]): boolean {
    // Vérifie que la somme des quotes-parts = 1
    const total = quoteParts.reduce((sum, part) => sum + part, 0);
    return Math.abs(total - 1) < 0.001; // Tolérance pour les erreurs de précision
  }

  static generateFicheCode(parcelleId: number, year: number): string {
    // Génère un code unique pour les fiches fiscales
    const timestamp = Date.now().toString().slice(-6);
    return `TNB-${year}-${parcelleId.toString().padStart(6, '0')}-${timestamp}`;
  }

  // Utilitaires pour les couleurs de la carte
  static getColorByZone(zone: string): string {
    const zoneColors: Record<string, string> = {
      'R1': '#e3f2fd',
      'R2': '#bbdefb', 
      'R3': '#90caf9',
      'R4': '#64b5f6',
      'I1': '#fff3e0',
      'I2': '#ffe0b2',
      'I3': '#ffcc02',
      'C': '#f3e5f5',
      'E': '#e8f5e8'
    };
    return zoneColors[zone] || '#f5f5f5';
  }

  static getColorByStatus(status: string): string {
    const statusColors: Record<string, string> = {
      'nu': '#007bff',
      'construit': '#28a745',
      'partiellement_construit': '#ffc107',
      'en_construction': '#fd7e14'
    };
    return statusColors[status] || '#6c757d';
  }

  // Utilitaires pour les exports
  static exportToCSV(data: any[], filename: string): void {
    const csvContent = this.arrayToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  private static arrayToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Échapper les virgules et guillemets dans les valeurs
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  // Utilitaires pour la validation des données
  static isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  static isValidPostalCode(postalCode: string): boolean {
    // Code postal marocain (5 chiffres)
    const postalPattern = /^[0-9]{5}$/;
    return postalPattern.test(postalCode);
  }

  static sanitizeString(str: string): string {
    // Nettoie les chaînes pour éviter les injections
    return str.replace(/[<>\"']/g, '');
  }

  // Utilitaires pour les calculs TNB
  static calculateTNBAmount(surface: number, tarif: number, quotePart: number = 1): number {
    return Math.round((surface * tarif * quotePart) * 100) / 100;
  }

  static getExemptionDuration(surface: number): number {
    // Durée d'exonération selon la surface (loi 47-06)
    if (surface <= 500) return 3;
    if (surface <= 1000) return 5;
    return 7;
  }

  // Utilitaires pour les dates
  static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  static isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  static formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} ans`;
  }
}