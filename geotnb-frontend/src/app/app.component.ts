// =====================================================
// APP COMPONENT - COMPOSANT PRINCIPAL
// =====================================================

import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { Observable, BehaviorSubject } from 'rxjs';

import { AuthService } from './core/services/auth.service';
import { MainLayoutComponent } from './shared/components/layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule, 
    MatProgressBarModule,
    MatButtonModule,
    MainLayoutComponent,
    DashboardComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'GeoTNB - Système de Gestion Foncière';
  currentYear = new Date().getFullYear();
  connectionStatus = 'Connecté';
  
  isLoading$ = new BehaviorSubject<boolean>(false);
  isAuthenticated$: Observable<boolean>;
  
  // Pour le debug
  window = window;


  // Propriété pour le template
  get currentPath(): string {
    return window.location.pathname;
  }

  get isDashboardRoute(): boolean {
    return this.currentPath === '/dashboard';
  }

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit(): void {
    // Initialiser l'état d'authentification
    this.authService.initializeAuthState();
  }

  /**
   * Méthode de connexion simple pour les tests
   */
  login(): void {
    console.log('🔐 Tentative de connexion...');
    // Simuler une connexion réussie
    this.authService.login({ username: 'admin', password: 'password' }).subscribe({
      next: (response) => {
        if (response.success || response.access_token) {
          console.log('✅ Connexion réussie !');
        } else {
          console.log('❌ Échec de la connexion');
        }
      },
      error: (error) => {
        console.error('❌ Erreur de connexion:', error);
      }
    });
  }
}