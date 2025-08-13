// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common'; 
import { RouterOutlet } from '@angular/router'; 

// Core Services
import { LoadingService } from './core/services/loading.service';
import { NotificationService, Notification } from './core/services/notification.service';
import { AuthService } from './core/services/auth.service';

// Environment & Config
import { environment } from '../environments/environment';
import { generatePageTitle, CustomRouteData } from './app-routing.module';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [CommonModule, RouterOutlet], 
  template: `
    <!-- Global Loading Overlay -->
    <div *ngIf="loadingService.loading$ | async" class="global-loading" role="status" aria-label="Chargement en cours">
      <div class="loading-content">
        <div class="spinner" aria-hidden="true"></div>
        <p class="loading-text">Chargement...</p>
        <div class="loading-progress">
          <div class="progress-bar"></div>
        </div>
      </div>
    </div>

    <!-- Global Notifications Container -->
    <div class="notifications-container" role="region" aria-label="Notifications">
      <div 
        *ngFor="let notification of notifications; trackBy: trackNotification" 
        class="notification" 
        [ngClass]="'notification-' + notification.type"
        [attr.role]="notification.type === 'error' ? 'alert' : 'status'"
        [attr.aria-live]="notification.type === 'error' ? 'assertive' : 'polite'"
      >
        <div class="notification-icon" aria-hidden="true">
          <span [innerHTML]="getNotificationIcon(notification.type)"></span>
        </div>
        
        <div class="notification-content">
          <h4 class="notification-title">{{ notification.title }}</h4>
          <p class="notification-message">{{ notification.message }}</p>
          
          <!-- Progress bar pour les notifications persistantes -->
          <div 
            *ngIf="!notification.persistent && notification.duration && notification.duration > 0" 
            class="notification-progress"
          >
            <div class="notification-progress-bar" [style.animation-duration]="notification.duration + 'ms'"></div>
          </div>
        </div>
        
        <button 
          class="notification-close" 
          (click)="dismissNotification(notification.id)"
          [attr.aria-label]="'Fermer la notification: ' + notification.title"
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>

    <!-- Network Status Indicator -->
    <div 
      *ngIf="!isOnline" 
      class="network-status offline"
      role="alert"
      aria-live="assertive"
    >
      <span class="network-icon">📡</span>
      <span>Connexion Internet indisponible</span>
    </div>

    <!-- Main Application Content -->
    <router-outlet></router-outlet>

    <!-- Debug Info (Development only) -->
    <div 
      *ngIf="showDebugInfo" 
      class="debug-info"
      [attr.aria-expanded]="debugExpanded"
    >
      <button 
        class="debug-toggle" 
        (click)="debugExpanded = !debugExpanded"
        [attr.aria-label]="debugExpanded ? 'Masquer les infos debug' : 'Afficher les infos debug'"
      >
        🐛 Debug {{ debugExpanded ? '▼' : '▶' }}
      </button>
      
      <div *ngIf="debugExpanded" class="debug-content">
        <div class="debug-item">
          <strong>Route actuelle:</strong> {{ currentRoute }}
        </div>
        <div class="debug-item">
          <strong>Utilisateur:</strong> {{ currentUser?.username || 'Non connecté' }}
        </div>
        <div class="debug-item">
          <strong>Rôle:</strong> {{ currentUser?.profil || 'N/A' }}
        </div>
        <div class="debug-item">
          <strong>Environnement:</strong> {{ environment.production ? 'Production' : 'Développement' }}
        </div>
        <div class="debug-item">
          <strong>Version:</strong> {{ appVersion }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Global Loading Overlay */
    .global-loading {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
    }

    .loading-content {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid #ffffff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    .loading-text {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .loading-progress {
      width: 200px;
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      overflow: hidden;
      margin: 0 auto;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #66a3ff);
      border-radius: 2px;
      animation: progress 2s ease-in-out infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes progress {
      0% { width: 0%; transform: translateX(-100%); }
      50% { width: 100%; transform: translateX(0%); }
      100% { width: 100%; transform: translateX(100%); }
    }

    /* Notifications */
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1050;
      max-width: 420px;
      pointer-events: none;
    }

    .notification {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      margin-bottom: 0.75rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: slideInRight 0.4s ease-out;
      pointer-events: auto;
      position: relative;
      overflow: hidden;
    }

    .notification-success {
      background: linear-gradient(135deg, rgba(212, 237, 218, 0.95), rgba(195, 230, 203, 0.95));
      color: #155724;
      border-left: 4px solid #28a745;
    }

    .notification-error {
      background: linear-gradient(135deg, rgba(248, 215, 218, 0.95), rgba(245, 198, 203, 0.95));
      color: #721c24;
      border-left: 4px solid #dc3545;
    }

    .notification-warning {
      background: linear-gradient(135deg, rgba(255, 243, 205, 0.95), rgba(255, 238, 186, 0.95));
      color: #856404;
      border-left: 4px solid #ffc107;
    }

    .notification-info {
      background: linear-gradient(135deg, rgba(209, 236, 241, 0.95), rgba(187, 222, 214, 0.95));
      color: #0c5460;
      border-left: 4px solid #17a2b8;
    }

    .notification-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 0.25rem;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      margin: 0 0 0.5rem 0;
      font-size: 0.95rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .notification-message {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .notification-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: rgba(0, 0, 0, 0.1);
    }

    .notification-progress-bar {
      height: 100%;
      background: currentColor;
      width: 100%;
      animation: notificationProgress linear forwards;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 1.4rem;
      cursor: pointer;
      padding: 0;
      margin: 0;
      opacity: 0.7;
      transition: opacity 0.2s ease;
      flex-shrink: 0;
      line-height: 1;
    }

    .notification-close:hover {
      opacity: 1;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes notificationProgress {
      from { width: 100%; }
      to { width: 0%; }
    }

    /* Network Status */
    .network-status {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      padding: 0.75rem;
      text-align: center;
      z-index: 1060;
      font-size: 0.9rem;
      font-weight: 500;
      animation: slideInDown 0.3s ease-out;
    }

    .network-status.offline {
      background: linear-gradient(135deg, #dc3545, #c82333);
      color: white;
    }

    .network-icon {
      margin-right: 0.5rem;
    }

    @keyframes slideInDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Debug Info (Development only) */
    .debug-info {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      z-index: 1040;
      border: 1px solid #333;
      backdrop-filter: blur(10px);
    }

    .debug-toggle {
      background: none;
      border: none;
      color: inherit;
      padding: 0.5rem;
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;
      border-radius: 8px 8px 0 0;
      width: 100%;
      text-align: left;
    }

    .debug-toggle:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .debug-content {
      padding: 0.75rem;
      border-top: 1px solid #333;
      min-width: 300px;
    }

    .debug-item {
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }

    .debug-item:last-child {
      margin-bottom: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .notifications-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .notification {
        padding: 0.75rem;
        margin-bottom: 0.5rem;
      }

      .notification-title {
        font-size: 0.9rem;
      }

      .notification-message {
        font-size: 0.8rem;
      }

      .debug-info {
        bottom: 10px;
        left: 10px;
        right: 10px;
      }

      .debug-content {
        min-width: auto;
      }
    }

    /* Accessibility Improvements */
    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
      }

      .progress-bar {
        animation: none;
      }

      .notification {
        animation: none;
      }

      .network-status {
        animation: none;
      }
    }

    /* High Contrast Mode */
    @media (prefers-contrast: high) {
      .notification {
        border: 2px solid currentColor;
        background: white !important;
      }

      .global-loading {
        background: black;
      }

      .loading-content {
        background: white;
        color: black;
        border: 2px solid black;
      }
    }

    /* Print Styles */
    @media print {
      .global-loading,
      .notifications-container,
      .network-status,
      .debug-info {
        display: none !important;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  // Application metadata
  title = 'GeoTNB - Gestion Taxe Terrains Non Bâtis';
  appVersion = '1.0.0';
  
  // Component state
  currentRoute = '';
  currentUser: any = null;
  notifications: Notification[] = [];
  isOnline = navigator.onLine;
  
  // Debug info (development only)
  showDebugInfo = !environment.production;
  debugExpanded = false;
  
  // Cleanup subscription
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private metaService: Meta,
    public loadingService: LoadingService,
    public notificationService: NotificationService,
    private authService: AuthService
  ) {
    // Set initial meta tags
    this.setInitialMetaTags();
    
    // Listen to online/offline events
    this.setupNetworkListeners();
  }

  ngOnInit(): void {
    // Subscribe to route changes for page title updates
    this.setupRouteListener();
    
    // Subscribe to notifications
    this.setupNotificationListener();
    
    // Subscribe to user changes
    this.setupUserListener();
    
    // Setup global error handling
    this.setupGlobalErrorHandling();
    
    // Log application startup in development
    if (!environment.production) {
      console.log('🚀 GeoTNB Application Started');
      console.log('Environment:', environment);
      console.log('Version:', this.appVersion);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup route listener for dynamic page titles and metadata
   */
  private setupRouteListener(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        mergeMap(route => route.data),
        takeUntil(this.destroy$)
      )
      .subscribe((data: CustomRouteData) => {
        // Update current route for debug info
        this.currentRoute = this.router.url;
        
        // Update page title
        const pageTitle = generatePageTitle(this.currentRoute, data.title);
        this.titleService.setTitle(pageTitle);
        
        // Update meta description
        if (data.description) {
          this.metaService.updateTag({ 
            name: 'description', 
            content: data.description 
          });
        }
        
        // Log route changes in development
        if (!environment.production) {
          console.log('📍 Route changed:', this.currentRoute);
          console.log('📋 Route data:', data);
        }
      });
  }

  /**
   * Setup notification listener
   */
  private setupNotificationListener(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });
  }

  /**
   * Setup user authentication listener
   */
  private setupUserListener(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        
        // Update meta tags with user context
        if (user) {
          this.metaService.updateTag({ 
            name: 'author', 
            content: `${user.username} - ${user.profil}` 
          });
        }
      });
  }

  /**
   * Setup global error handling
   */
  private setupGlobalErrorHandling(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      this.notificationService.error(
        'Erreur inattendue',
        'Une erreur inattendue s\'est produite. Veuillez réessayer.'
      );
      
      // Prevent the default browser error handling
      event.preventDefault();
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      
      this.notificationService.error(
        'Erreur système',
        'Une erreur système s\'est produite. La page va être rechargée.'
      );
      
      // Reload page after a delay in case of critical error
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    });
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notificationService.success(
        'Connexion rétablie',
        'La connexion Internet est de nouveau disponible.'
      );
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notificationService.warning(
        'Connexion perdue',
        'Vous travaillez actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.'
      );
    });
  }

  /**
   * Set initial meta tags for SEO and social sharing
   */
  private setInitialMetaTags(): void {
    const metaTags = [
      { name: 'description', content: 'Système de gestion de la Taxe sur les Terrains Non Bâtis (TNB) pour la commune d\'Oujda' },
      { name: 'keywords', content: 'TNB, taxe, terrains, non bâtis, Oujda, SIG, GIS, géoportail' },
      { name: 'author', content: 'Commune d\'Oujda - GeoConseil' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'robots', content: 'noindex, nofollow' }, // Private application
      { name: 'theme-color', content: '#007bff' },
      
      // Open Graph tags
      { property: 'og:title', content: this.title },
      { property: 'og:description', content: 'Système de gestion TNB - Commune d\'Oujda' },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'fr_FR' },
      
      // Twitter Card tags
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: this.title },
      { name: 'twitter:description', content: 'Système de gestion TNB - Commune d\'Oujda' }
    ];

    metaTags.forEach(tag => {
      if (tag.name) {
        this.metaService.addTag({ name: tag.name, content: tag.content });
      } else if (tag.property) {
        this.metaService.addTag({ property: tag.property, content: tag.content });
      }
    });
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: string): string {
    const icons = {
      success: '✅',
      error: '❌', 
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type as keyof typeof icons] || 'ℹ️';
  }

  /**
   * Dismiss a notification
   */
  dismissNotification(id: string): void {
    this.notificationService.remove(id);
  }

  /**
   * Track notifications for *ngFor performance
   */
  trackNotification(index: number, notification: Notification): string {
    return notification.id;
  }

  /**
   * Expose environment for template access
   */
  get environment() {
    return environment;
  }
}