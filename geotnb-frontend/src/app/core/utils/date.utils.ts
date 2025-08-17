import { format, parse, isValid, differenceInDays, differenceInYears, addYears } from 'date-fns';
import { fr } from 'date-fns/locale';

export class DateUtils {
  static readonly DEFAULT_DATE_FORMAT = 'dd/MM/yyyy';
  static readonly DEFAULT_DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
  static readonly ISO_DATE_FORMAT = 'yyyy-MM-dd';
  static readonly ISO_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

  /**
   * Formate une date selon le format spécifié
   */
  static format(date: Date | string | number, dateFormat = DateUtils.DEFAULT_DATE_FORMAT): string {
    try {
      const dateObj = DateUtils.toDate(date);
      return format(dateObj, dateFormat, { locale: fr });
    } catch {
      return '';
    }
  }

  /**
   * Parse une chaîne de date vers un objet Date
   */
  static parse(dateString: string, dateFormat = DateUtils.DEFAULT_DATE_FORMAT): Date | null {
    try {
      const parsed = parse(dateString, dateFormat, new Date(), { locale: fr });
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  /**
   * Convertit une valeur vers un objet Date
   */
  static toDate(value: Date | string | number): Date {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string') {
      return new Date(value);
    }
    if (typeof value === 'number') {
      return new Date(value);
    }
    throw new Error('Invalid date value');
  }

  /**
   * Vérifie si une date est valide
   */
  static isValid(date: any): boolean {
    try {
      const dateObj = DateUtils.toDate(date);
      return isValid(dateObj);
    } catch {
      return false;
    }
  }

  /**
   * Calcule la différence en jours entre deux dates
   */
  static daysBetween(startDate: Date | string, endDate: Date | string): number {
    const start = DateUtils.toDate(startDate);
    const end = DateUtils.toDate(endDate);
    return differenceInDays(end, start);
  }

  /**
   * Calcule la différence en années entre deux dates
   */
  static yearsBetween(startDate: Date | string, endDate: Date | string): number {
    const start = DateUtils.toDate(startDate);
    const end = DateUtils.toDate(endDate);
    return differenceInYears(end, start);
  }

  /**
   * Ajoute des années à une date
   */
  static addYears(date: Date | string, years: number): Date {
    const dateObj = DateUtils.toDate(date);
    return addYears(dateObj, years);
  }

  /**
   * Retourne la date actuelle formatée
   */
  static today(dateFormat = DateUtils.DEFAULT_DATE_FORMAT): string {
    return DateUtils.format(new Date(), dateFormat);
  }

  /**
   * Retourne la date et l'heure actuelles formatées
   */
  static now(dateFormat = DateUtils.DEFAULT_DATETIME_FORMAT): string {
    return DateUtils.format(new Date(), dateFormat);
  }

  /**
   * Vérifie si une date est dans le futur
   */
  static isFuture(date: Date | string): boolean {
    const dateObj = DateUtils.toDate(date);
    return dateObj > new Date();
  }

  /**
   * Vérifie si une date est dans le passé
   */
  static isPast(date: Date | string): boolean {
    const dateObj = DateUtils.toDate(date);
    return dateObj < new Date();
  }

  /**
   * Retourne le début de la journée (00:00:00)
   */
  static startOfDay(date: Date | string): Date {
    const dateObj = DateUtils.toDate(date);
    dateObj.setHours(0, 0, 0, 0);
    return dateObj;
  }

  /**
   * Retourne la fin de la journée (23:59:59)
   */
  static endOfDay(date: Date | string): Date {
    const dateObj = DateUtils.toDate(date);
    dateObj.setHours(23, 59, 59, 999);
    return dateObj;
  }

  /**
   * Convertit une date au format ISO pour l'API
   */
  static toISOString(date: Date | string): string {
    const dateObj = DateUtils.toDate(date);
    return dateObj.toISOString();
  }

  /**
   * Retourne une date relative (il y a X jours, dans X jours)
   */
  static getRelativeTime(date: Date | string): string {
    const dateObj = DateUtils.toDate(date);
    const now = new Date();
    const days = differenceInDays(now, dateObj);

    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Hier';
    if (days === -1) return 'Demain';
    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    return `Dans ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}`;
  }
}
