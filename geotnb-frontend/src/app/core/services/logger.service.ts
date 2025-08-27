import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  category: string;
  data?: any;
  error?: Error;
  userId?: number;
  username?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  categories: string[];
  maxEntries: number;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private config: LoggerConfig = {
    level: LogLevel.INFO,
    categories: [],
    maxEntries: 1000,
    enableConsole: true,
    enableStorage: true,
    enableRemote: false
  };

  private logs = new BehaviorSubject<LogEntry[]>([]);
  private sessionId = this.generateSessionId();
  
  public logs$ = this.logs.asObservable();

  constructor(private authService: AuthService) {
    this.loadConfig();
    this.info('Logger', 'Service de logging initialisé', { sessionId: this.sessionId });
  }

  // Configuration du logger
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();
    this.info('Logger', 'Configuration mise à jour', this.config);
  }

  // Log niveau TRACE
  trace(category: string, message: string, data?: any): void {
    this.log(LogLevel.TRACE, category, message, data);
  }

  // Log niveau DEBUG
  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  // Log niveau INFO
  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  // Log niveau WARN
  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  // Log niveau ERROR
  error(category: string, message: string, error?: Error | any, data?: any): void {
    if (error instanceof Error) {
      this.log(LogLevel.ERROR, category, message, data, error);
    } else {
      this.log(LogLevel.ERROR, category, message, { error, ...data });
    }
  }

  // Log niveau FATAL
  fatal(category: string, message: string, error?: Error | any, data?: any): void {
    if (error instanceof Error) {
      this.log(LogLevel.FATAL, category, message, data, error);
    } else {
      this.log(LogLevel.FATAL, category, message, { error, ...data });
    }
  }

  // Méthode principale de logging
  private log(level: LogLevel, category: string, message: string, data?: any, error?: Error): void {
    // Vérifier si le niveau de log est autorisé
    if (level < this.config.level) {
      return;
    }

    // Vérifier si la catégorie est autorisée (si des catégories sont spécifiées)
    if (this.config.categories.length > 0 && !this.config.categories.includes(category)) {
      return;
    }

    const user = this.authService.currentUser;
    
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      message,
      category,
      data,
      error,
      userId: user?.id,
      username: user?.username,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Ajouter à la liste des logs
    this.addLogEntry(logEntry);

    // Log vers la console si activé
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Sauvegarder dans le storage local si activé
    if (this.config.enableStorage) {
      this.logToStorage(logEntry);
    }

    // Envoyer vers le serveur si activé
    if (this.config.enableRemote) {
      this.logToRemote(logEntry);
    }
  }

  // Ajouter une entrée de log à la liste
  private addLogEntry(entry: LogEntry): void {
    const currentLogs = this.logs.value;
    const updatedLogs = [entry, ...currentLogs].slice(0, this.config.maxEntries);
    this.logs.next(updatedLogs);
  }

  // Logger vers la console
  private logToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const message = `[${entry.timestamp.toISOString()}] [${levelName}] [${entry.category}] ${entry.message}`;
    
    const consoleData = {
      data: entry.data,
      error: entry.error,
      user: entry.username,
      session: entry.sessionId
    };

    switch (entry.level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(message, consoleData);
        break;
      case LogLevel.INFO:
        console.info(message, consoleData);
        break;
      case LogLevel.WARN:
        console.warn(message, consoleData);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, consoleData);
        if (entry.error) {
          console.error('Stack trace:', entry.error.stack);
        }
        break;
    }
  }

  // Sauvegarder dans le localStorage
  private logToStorage(entry: LogEntry): void {
    try {
      const storageKey = `logs_${new Date().toISOString().split('T')[0]}`;
      const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const serializedEntry = {
        ...entry,
        timestamp: entry.timestamp.toISOString(),
        error: entry.error ? {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack
        } : undefined
      };
      
      existingLogs.push(serializedEntry);
      
      // Garder seulement les 500 derniers logs par jour
      const limitedLogs = existingLogs.slice(-500);
      localStorage.setItem(storageKey, JSON.stringify(limitedLogs));
    } catch (error) {
      console.error('Erreur sauvegarde logs:', error);
    }
  }

  // Envoyer vers le serveur distant
  private logToRemote(entry: LogEntry): void {
    if (!this.config.remoteEndpoint) return;

    const payload = {
      ...entry,
      timestamp: entry.timestamp.toISOString(),
      error: entry.error ? {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack
      } : undefined
    };

    // Envoyer de manière asynchrone sans bloquer l'application
    setTimeout(() => {
      fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }).catch(error => {
        console.error('Erreur envoi logs distants:', error);
      });
    }, 0);
  }

  // Obtenir les logs filtrés
  getLogs(filter?: {
    level?: LogLevel;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    userId?: number;
  }): LogEntry[] {
    let filteredLogs = this.logs.value;

    if (filter) {
      filteredLogs = filteredLogs.filter(log => {
        if (filter.level !== undefined && log.level < filter.level) {
          return false;
        }
        if (filter.category && log.category !== filter.category) {
          return false;
        }
        if (filter.startDate && log.timestamp < filter.startDate) {
          return false;
        }
        if (filter.endDate && log.timestamp > filter.endDate) {
          return false;
        }
        if (filter.userId && log.userId !== filter.userId) {
          return false;
        }
        return true;
      });
    }

    return filteredLogs;
  }

  // Obtenir les catégories disponibles
  getCategories(): string[] {
    const logs = this.logs.value;
    const categories = new Set(logs.map(log => log.category));
    return Array.from(categories).sort();
  }

  // Obtenir les statistiques
  getStats(): {
    totalLogs: number;
    logsByLevel: { [key: string]: number };
    logsByCategory: { [key: string]: number };
    errorRate: number;
    oldestLog?: Date;
    newestLog?: Date;
  } {
    const logs = this.logs.value;
    
    const logsByLevel: { [key: string]: number } = {};
    const logsByCategory: { [key: string]: number } = {};
    
    logs.forEach(log => {
      const levelName = LogLevel[log.level];
      logsByLevel[levelName] = (logsByLevel[levelName] || 0) + 1;
      logsByCategory[log.category] = (logsByCategory[log.category] || 0) + 1;
    });

    const errorLogs = logs.filter(log => log.level >= LogLevel.ERROR).length;
    const errorRate = logs.length > 0 ? (errorLogs / logs.length) * 100 : 0;

    const timestamps = logs.map(log => log.timestamp).sort((a, b) => a.getTime() - b.getTime());

    return {
      totalLogs: logs.length,
      logsByLevel,
      logsByCategory,
      errorRate: Math.round(errorRate * 100) / 100,
      oldestLog: timestamps[0],
      newestLog: timestamps[timestamps.length - 1]
    };
  }

  // Exporter les logs
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.logs.value;
    
    if (format === 'csv') {
      const headers = ['Timestamp', 'Level', 'Category', 'Message', 'User', 'URL'];
      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          log.timestamp.toISOString(),
          LogLevel[log.level],
          log.category,
          `"${log.message.replace(/"/g, '""')}"`,
          log.username || '',
          log.url || ''
        ].join(','))
      ];
      return csvRows.join('\n');
    }
    
    return JSON.stringify(logs, null, 2);
  }

  // Effacer les logs
  clearLogs(): void {
    this.logs.next([]);
    this.info('Logger', 'Logs effacés');
  }

  // Effacer les logs du localStorage
  clearStoredLogs(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('logs_')) {
          localStorage.removeItem(key);
        }
      });
      this.info('Logger', 'Logs stockés effacés');
    } catch (error) {
      this.error('Logger', 'Erreur lors de l\'effacement des logs stockés', error);
    }
  }

  // Charger les logs depuis le localStorage
  loadStoredLogs(date?: string): LogEntry[] {
    try {
      const storageKey = `logs_${date || new Date().toISOString().split('T')[0]}`;
      const storedLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      return storedLogs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
        level: typeof log.level === 'string' ? LogLevel[log.level as keyof typeof LogLevel] : log.level
      }));
    } catch (error) {
      this.error('Logger', 'Erreur lors du chargement des logs stockés', error);
      return [];
    }
  }

  // Obtenir les dates disponibles dans le localStorage
  getAvailableLogDates(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith('logs_'))
        .map(key => key.replace('logs_', ''))
        .sort()
        .reverse();
    } catch (error) {
      this.error('Logger', 'Erreur lors de la récupération des dates de logs', error);
      return [];
    }
  }

  // Générer un ID de session
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Générer un ID de log
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Sauvegarder la configuration
  private saveConfig(): void {
    try {
      localStorage.setItem('logger_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Erreur sauvegarde config logger:', error);
    }
  }

  // Charger la configuration
  private loadConfig(): void {
    try {
      const savedConfig = localStorage.getItem('logger_config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Erreur chargement config logger:', error);
    }
  }

  // Méthodes de convenance pour des catégories spécifiques
  
  // Logs d'authentification
  logAuth(message: string, data?: any): void {
    this.info('Auth', message, data);
  }

  // Logs d'API
  logApi(message: string, data?: any): void {
    this.info('API', message, data);
  }

  // Logs d'interface utilisateur
  logUI(message: string, data?: any): void {
    this.debug('UI', message, data);
  }

  // Logs de navigation
  logNavigation(message: string, data?: any): void {
    this.debug('Navigation', message, data);
  }

  // Logs d'erreurs SIG
  logSIG(message: string, error?: any, data?: any): void {
    if (error) {
      this.error('SIG', message, error, data);
    } else {
      this.info('SIG', message, data);
    }
  }

  // Logs de workflow
  logWorkflow(message: string, data?: any): void {
    this.info('Workflow', message, data);
  }

  // Logs de performance
  logPerformance(message: string, duration: number, data?: any): void {
    this.info('Performance', `${message} (${duration}ms)`, data);
  }
}