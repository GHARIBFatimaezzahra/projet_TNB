import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil, filter } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { User, UserProfil } from '../../../../core/models/database.models';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  roles?: UserProfil[];
  badge?: number;
  disabled?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  currentRoute = '';
  private destroy$ = new Subject<void>();

  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      id: 'sig',
      label: 'SIG & Cartographie',
      icon: 'map',
      children: [
        {
          id: 'parcelles',
          label: 'Parcelles TNB',
          icon: 'terrain',
          route: '/parcelles',
          roles: [UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG, UserProfil.AGENT_FISCAL]
        },
        {
          id: 'carte',
          label: 'Vue cartographique',
          icon: 'satellite',
          route: '/parcelles/carte'
        },
        {
          id: 'import',
          label: 'Import données SIG',
          icon: 'upload_file',
          route: '/parcelles/import',
          roles: [UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG]
        }
      ]
    },
    {
      id: 'proprietaires',
      label: 'Propriétaires',
      icon: 'people',
      route: '/proprietaires',
      roles: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL, UserProfil.TECHNICIEN_SIG]
    },
    {
      id: 'fiscal',
      label: 'Gestion fiscale',
      icon: 'receipt_long',
      children: [
        {
          id: 'fiches',
          label: 'Fiches fiscales',
          icon: 'description',
          route: '/fiches-fiscales',
          roles: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL]
        },
        {
          id: 'generation',
          label: 'Génération fiches',
          icon: 'picture_as_pdf',
          route: '/fiches-fiscales/generation',
          roles: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL]
        },
        {
          id: 'recouvrement',
          label: 'Recouvrement',
          icon: 'payment',
          route: '/fiches-fiscales/recouvrement',
          roles: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL]
        }
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: 'folder',
      route: '/documents',
      roles: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL, UserProfil.TECHNICIEN_SIG]
    },
    {
      id: 'rapports',
      label: 'Rapports & Statistiques',
      icon: 'assessment',
      children: [
        {
          id: 'statistiques',
          label: 'Statistiques TNB',
          icon: 'bar_chart',
          route: '/dashboard/statistiques'
        },
        {
          id: 'rapports-zone',
          label: 'Rapports par zone',
          icon: 'map',
          route: '/dashboard/rapports-zones'
        },
        {
          id: 'export',
          label: 'Export données',
          icon: 'download',
          route: '/export',
          roles: [UserProfil.ADMIN, UserProfil.AGENT_FISCAL]
        }
      ]
    },
    {
      id: 'administration',
      label: 'Administration',
      icon: 'admin_panel_settings',
      children: [
        {
          id: 'users',
          label: 'Utilisateurs',
          icon: 'manage_accounts',
          route: '/administration/users',
          roles: [UserProfil.ADMIN]
        },
        {
          id: 'config-fiscale',
          label: 'Configuration fiscale',
          icon: 'tune',
          route: '/administration/configuration/fiscale',
          roles: [UserProfil.ADMIN]
        },
        {
          id: 'config-zones',
          label: 'Zones urbanistiques',
          icon: 'location_city',
          route: '/administration/configuration/zones',
          roles: [UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG]
        },
        {
          id: 'audit',
          label: 'Journal d\'audit',
          icon: 'history',
          route: '/administration/audit',
          roles: [UserProfil.ADMIN]
        },
        {
          id: 'backup',
          label: 'Sauvegarde',
          icon: 'backup',
          route: '/administration/backup',
          roles: [UserProfil.ADMIN]
        }
      ],
      roles: [UserProfil.ADMIN, UserProfil.TECHNICIEN_SIG]
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Écouter l'utilisateur actuel
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Écouter les changements de route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Vérifier si l'utilisateur peut voir un élément du menu
  canAccess(item: MenuItem): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    
    if (!this.currentUser) {
      return false;
    }

    return item.roles.includes(this.currentUser.profil);
  }

  // Vérifier si un élément parent a des enfants visibles
  hasVisibleChildren(item: MenuItem): boolean {
    if (!item.children) {
      return false;
    }
    
    return item.children.some(child => this.canAccess(child));
  }

  // Vérifier si un élément du menu est actif
  isActive(item: MenuItem): boolean {
    if (item.route) {
      return this.currentRoute.startsWith(item.route);
    }
    
    if (item.children) {
      return item.children.some(child => 
        child.route && this.currentRoute.startsWith(child.route)
      );
    }
    
    return false;
  }

  // Naviguer vers une route
  navigate(route: string): void {
    this.router.navigate([route]);
  }

  // Obtenir les éléments de menu filtrés selon les permissions
  getFilteredMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => {
      if (!this.canAccess(item)) {
        return false;
      }
      
      // Si l'élément a des enfants, vérifier qu'au moins un enfant est visible
      if (item.children && !this.hasVisibleChildren(item)) {
        return false;
      }
      
      return true;
    });
  }

  // Obtenir les enfants filtrés d'un élément
  getFilteredChildren(item: MenuItem): MenuItem[] {
    if (!item.children) {
      return [];
    }
    
    return item.children.filter(child => this.canAccess(child));
  }
}