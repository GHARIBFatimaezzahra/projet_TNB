import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider'; // ← AJOUT DE CETTE LIGNE
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../../../core/models/database.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule // ← AJOUT DE CETTE LIGNE
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() sidenavToggle = new EventEmitter<void>();
  
  currentUser: User | null = null;
  notificationCount = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Écouter le nombre de notifications non lues
    this.notificationService.notificationHistory$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notificationCount = notifications.filter(n => !n.read).length;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToggleSidenav(): void {
    this.sidenavToggle.emit();
  }

  onLogout(): void {
    this.notificationService.confirm({
      title: 'Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
      type: 'info'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.authService.logout();
      }
    });
  }

  onProfile(): void {
    // Navigation vers le profil utilisateur
  }

  onNotifications(): void {
    // Ouvrir le panneau des notifications
    this.notificationService.markAllAsRead();
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';
    const nom = this.currentUser.nom || '';
    const prenom = this.currentUser.prenom || '';
    return (nom.charAt(0) + prenom.charAt(0)).toUpperCase();
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.prenom || ''} ${this.currentUser.nom}`.trim();
  }

  getRoleDisplayName(): string {
    if (!this.currentUser) return '';
    switch (this.currentUser.profil) {
      case 'Admin': return 'Administrateur';
      case 'AgentFiscal': return 'Agent Fiscal';
      case 'TechnicienSIG': return 'Technicien SIG';
      case 'Lecteur': return 'Lecteur';
      default: return this.currentUser.profil;
    }
  }
}