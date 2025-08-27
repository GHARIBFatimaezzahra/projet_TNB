/* =====================================================
   MAIN LAYOUT COMPONENT - GESTION DE LA NAVIGATION MODERNE
   ===================================================== */

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { AuthService } from '../../../../core/services/auth.service';
import { User, UserProfil } from '../../../../core/models/database.models';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  
  // =====================================================
  // PROPRIÉTÉS
  // =====================================================
  
  sidebarCollapsed = false;
  currentRoute = '';
  currentUser: User | null = null;
  isMobile = false;
  showContentInfo = true;
  
  private destroy$ = new Subject<void>();

  // Mapping des routes vers les titres
  private routeTitles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/carte': 'Carte SIG',
    '/parcelles': 'Gestion des Parcelles',
    '/proprietaires': 'Propriétaires',
    '/fiches-tnb': 'Fiches TNB',
    '/documents': 'Documents',
    '/administration': 'Administration'
  };

  // Mapping des rôles vers les libellés
  private roleLabels: { [key in UserProfil]: string } = {
    [UserProfil.ADMIN]: 'Administrateur',
    [UserProfil.AGENT_FISCAL]: 'Agent Fiscal',
    [UserProfil.TECHNICIEN_SIG]: 'Technicien SIG',
    [UserProfil.LECTEUR]: 'Lecteur'
  };

  // =====================================================
  // LIFECYCLE
  // =====================================================

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.subscribeToRouteChanges();
    this.subscribeToUserChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initializeComponent(): void {
    // Initialiser l'état du sidebar selon la taille d'écran
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }

    // Récupérer la route actuelle
    this.currentRoute = this.router.url;
    
    // Masquer l'info après 5 secondes
    setTimeout(() => {
      this.showContentInfo = false;
    }, 5000);
  }

  private subscribeToRouteChanges(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  private subscribeToUserChanges(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  // =====================================================
  // GESTION DE LA NAVIGATION
  // =====================================================

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  isActiveRoute(route: string): boolean {
    if (route === '/dashboard') {
      return this.currentRoute === '/' || this.currentRoute === '/dashboard' || this.currentRoute.startsWith('/dashboard');
    }
    return this.currentRoute.startsWith(route);
  }

  getCurrentPageTitle(): string {
    // Chercher le titre correspondant à la route actuelle
    for (const [route, title] of Object.entries(this.routeTitles)) {
      if (this.currentRoute.startsWith(route)) {
        return title;
      }
    }
    return 'Dashboard'; // Titre par défaut
  }

  // =====================================================
  // GESTION UTILISATEUR
  // =====================================================

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentUserRole(): string {
    if (!this.currentUser?.profil) {
      return 'Utilisateur';
    }
    return this.roleLabels[this.currentUser.profil] || 'Utilisateur';
  }

  getUserInitials(): string {
    if (!this.currentUser) {
      return 'U';
    }
    
    const nom = this.currentUser.nom || '';
    const prenom = this.currentUser.prenom || '';
    
    if (nom && prenom) {
      return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase();
    } else if (nom) {
      return nom.substring(0, 2).toUpperCase();
    } else if (this.currentUser.username) {
      return this.currentUser.username.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  }

  hasAdminAccess(): boolean {
    return this.authService.hasPermission(
      UserProfil.ADMIN
    );
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        // Forcer la redirection même en cas d'erreur
        this.router.navigate(['/auth/login']);
      }
    });
  }

  // =====================================================
  // GESTION RESPONSIVE
  // =====================================================

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
    
    // Auto-collapse sur mobile
    if (this.isMobile && !this.sidebarCollapsed) {
      this.sidebarCollapsed = true;
    }
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  /**
   * Ferme la sidebar sur mobile lors du clic sur un lien
   */
  onNavLinkClick(): void {
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }
  }

  /**
   * Gère l'overlay mobile pour fermer la sidebar
   */
  onOverlayClick(): void {
    if (this.isMobile && !this.sidebarCollapsed) {
      this.sidebarCollapsed = true;
    }
  }

  /**
   * Vérifie si l'utilisateur a accès à une fonctionnalité
   */
  hasAccess(requiredRoles: UserProfil[]): boolean {
    return this.authService.hasPermission(...requiredRoles);
  }

  /**
   * Formate la date pour les notifications
   */
  formatNotificationTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
      return 'À l\'instant';
    } else if (minutes < 60) {
      return `Il y a ${minutes} min`;
    } else if (hours < 24) {
      return `Il y a ${hours}h`;
    } else {
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  }
}
