import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      title: 'Tableau de bord',
      icon: 'fas fa-tachometer-alt',
      route: '/dashboard'
    },
    {
      title: 'Cartographie',
      icon: 'fas fa-map',
      route: '/map'
    },
    {
      title: 'Parcelles',
      icon: 'fas fa-layer-group',
      route: '/parcelles',
      roles: ['Admin', 'TechnicienSIG', 'AgentFiscal']
    },
    {
      title: 'Propriétaires',
      icon: 'fas fa-users',
      route: '/proprietaires',
      roles: ['Admin', 'TechnicienSIG', 'AgentFiscal']
    },
    {
      title: 'Fiches Fiscales',
      icon: 'fas fa-file-invoice-dollar',
      route: '/fiches-fiscales',
      roles: ['Admin', 'AgentFiscal']
    },
    {
      title: 'Import de données',
      icon: 'fas fa-upload',
      route: '/import',
      roles: ['Admin', 'TechnicienSIG']
    },
    {
      title: 'Utilisateurs',
      icon: 'fas fa-user-cog',
      route: '/users',
      roles: ['Admin']
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  canShowMenuItem(item: MenuItem): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return this.authService.hasAnyRole(item.roles);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}