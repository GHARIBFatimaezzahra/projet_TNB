import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';

// Interfaces temporaires (seront dans core/models plus tard)
interface User {
  id: number;
  username: string;
  email: string;
  profil: 'Admin' | 'AgentFiscal' | 'TechnicienSIG' | 'Lecteur';
  estActif: boolean;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  icon: string;
  time: Date;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);

  // Signals pour l'état de l'interface
  sidebarCollapsed = signal(false);
  showNotifications = signal(false);
  showUserMenu = signal(false);
  isMobile = signal(false);
  searchQuery = '';
  currentPageTitle = signal('Dashboard');
  
  // Données utilisateur (mock - sera remplacé par AuthService)
  currentUser = signal<User>({
    id: 1,
    username: 'Admin User',
    email: 'admin@tnb.ma',
    profil: 'Admin',
    estActif: true
  });
  
  // Notifications
  notificationCount = signal(3);
  recentNotifications = signal<Notification[]>([
    {
      id: 1,
      title: 'Nouvelle parcelle ajoutée',
      message: 'La parcelle REF-2024-001 a été créée avec succès',
      icon: '��️',
      time: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      type: 'success'
    },
    {
      id: 2,
      title: 'Fiche fiscale générée',
      message: 'La fiche TNB pour M. Ahmed a été générée',
      icon: '📄',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      type: 'info'
    },
    {
      id: 3,
      title: 'Validation requise',
      message: '5 parcelles en attente de validation',
      icon: '⚠️',
      time: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: true,
      type: 'warning'
    }
  ]);

  // État de connexion
  connectionStatus = signal<'online' | 'offline'>('online');
  lastSync = signal(new Date());

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    if (!target.closest('.notifications-dropdown')) {
      this.showNotifications.set(false);
    }
    
    if (!target.closest('.user-menu-dropdown')) {
      this.showUserMenu.set(false);
    }
  }

  ngOnInit(): void {
    this.checkMobile();
    this.setupRouterEvents();
    this.setupConnectionMonitoring();
  }

  private checkMobile(): void {
    this.isMobile.set(window.innerWidth <= 768);
    if (this.isMobile()) {
      this.sidebarCollapsed.set(true);
    }
  }

  private setupRouterEvents(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
        if (this.isMobile()) {
          this.sidebarCollapsed.set(true);
        }
        this.showNotifications.set(false);
        this.showUserMenu.set(false);
      });
  }

  private updatePageTitle(url: string): void {
    const titles: Record<string, string> = {
      '/dashboard': 'Tableau de Bord',
      '/cartographie': 'Cartographie',
      '/parcelles': 'Gestion des Parcelles',
      '/proprietaires': 'Gestion des Propriétaires',
      '/indivision': 'Gestion de l\'Indivision',
      '/fiches-fiscales': 'Fiches Fiscales TNB',
      '/documents': 'Gestion des Documents',
      '/import-export': 'Import/Export',
      '/workflow': 'Workflow de Validation',
      '/reporting': 'Rapports et Analyses',
      '/journal-actions': 'Journal des Actions',
      '/users': 'Gestion des Utilisateurs',
      '/administration': 'Administration Système',
      '/notifications': 'Centre de Notifications',
      '/help': 'Aide et Documentation'
    };

    const path = url.split('?')[0];
    this.currentPageTitle.set(titles[path] || 'GeoTNB');
  }

  private setupConnectionMonitoring(): void {
    window.addEventListener('online', () => {
      this.connectionStatus.set('online');
      this.lastSync.set(new Date());
    });

    window.addEventListener('offline', () => {
      this.connectionStatus.set('offline');
    });

    setInterval(() => {
      if (this.connectionStatus() === 'online') {
        this.lastSync.set(new Date());
      }
    }, 300000);
  }

  // Méthodes publiques
  toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  closeSidebar(): void {
    if (this.isMobile()) {
      this.sidebarCollapsed.set(true);
    }
  }

  toggleNotifications(): void {
    this.showNotifications.update(show => !show);
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(show => !show);
    this.showNotifications.set(false);
  }

  performGlobalSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Recherche globale:', this.searchQuery);
    }
  }

  quickCreateParcelle(): void {
    this.router.navigate(['/parcelles/create']);
  }

  quickGenerateFiche(): void {
    this.router.navigate(['/fiches-fiscales/generate']);
  }

  quickExport(): void {
    this.router.navigate(['/import-export/export']);
  }

  markNotificationRead(notificationId: number): void {
    this.recentNotifications.update(notifications =>
      notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    this.updateNotificationCount();
  }

  markAllNotificationsRead(): void {
    this.recentNotifications.update(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );
    this.notificationCount.set(0);
  }

  private updateNotificationCount(): void {
    const unreadCount = this.recentNotifications().filter(n => !n.read).length;
    this.notificationCount.set(unreadCount);
  }

  canAccess(roles: string[]): boolean {
    const user = this.currentUser();
    return roles.includes(user.profil) || user.profil === 'Admin';
  }

  getUserInitials(): string {
    const user = this.currentUser();
    const names = user.username.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  }

  getRoleLabel(role: string | undefined): string {
    if (!role) return 'Utilisateur';
    
    const labels: Record<string, string> = {
      'Admin': 'Administrateur',
      'AgentFiscal': 'Agent Fiscal',
      'TechnicienSIG': 'Technicien SIG',
      'Lecteur': 'Lecteur'
    };
    return labels[role] || 'Utilisateur';
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getConnectionIcon(): string {
    return this.connectionStatus() === 'online' ? '🟢' : '🔴';
  }

  getConnectionLabel(): string {
    return this.connectionStatus() === 'online' ? 'En ligne' : 'Hors ligne';
  }

  logout(): void {
    console.log('Déconnexion...');
    this.router.navigate(['/auth/login']);
  }
}