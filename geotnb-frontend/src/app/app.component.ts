// =====================================================
// APP COMPONENT - COMPOSANT PRINCIPAL
// =====================================================

import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable, BehaviorSubject } from 'rxjs';

import { AuthService } from './core/services/auth.service';
import { MainLayoutComponent } from './shared/components/layout/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule, 
    MatProgressBarModule,
    MainLayoutComponent
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

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit(): void {
    // Initialiser l'état d'authentification
    this.authService.initializeAuthState();
  }
}