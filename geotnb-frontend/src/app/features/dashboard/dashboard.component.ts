/* =====================================================
   DASHBOARD COMPONENT - ANALYTICS & KPIs
   ===================================================== */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { UserProfil } from '../../core/models/database.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  // =====================================================
  // PROPRIÉTÉS
  // =====================================================
  
  selectedYear = '2024';
  loading = false;
  
  // KPIs Data
  kpiData = {
    totalParcelles: 2847,
    surfaceImposable: 1245, // en hectares
    recettesPrevues: 8.2, // en millions DH
    tauxRecouvrement: 67 // en pourcentage
  };
  
  // Données pour les graphiques (simulation)
  chartData = {
    recettesEvolution: [
      { month: 'Jan', value: 650000 },
      { month: 'Fév', value: 720000 },
      { month: 'Mar', value: 890000 },
      { month: 'Avr', value: 1020000 },
      { month: 'Mai', value: 950000 },
      { month: 'Jun', value: 1150000 },
      { month: 'Jul', value: 1300000 },
      { month: 'Aoû', value: 1250000 },
      { month: 'Sep', value: 1400000 },
      { month: 'Oct', value: 1350000 },
      { month: 'Nov', value: 1500000 },
      { month: 'Déc', value: 1600000 }
    ],
    repartitionZones: [
      { zone: 'Résidentiel', percentage: 45, color: '#4a90e2' },
      { zone: 'Commercial', percentage: 30, color: '#28a745' },
      { zone: 'Industriel', percentage: 15, color: '#ffc107' },
      { zone: 'Autres', percentage: 10, color: '#6c757d' }
    ]
  };
  
  // Statuts des parcelles
  statutsParcelles = [
    { label: 'Validées', count: 1847, status: 'valid' },
    { label: 'Publiées', count: 1623, status: 'published' },
    { label: 'Brouillons', count: 224, status: 'draft' },
    { label: 'Archivées', count: 153, status: 'archived' }
  ];
  
  // Activités récentes
  activitesRecentes = [
    {
      type: 'create',
      title: 'Nouvelle parcelle créée',
      subtitle: 'TF-478923-B par Ahmed ALAMI',
      time: 'Il y a 15 min'
    },
    {
      type: 'validate',
      title: 'Parcelle validée',
      subtitle: 'R-789456-C par Agent Fiscal',
      time: 'Il y a 1h'
    },
    {
      type: 'update',
      title: 'Fiche TNB modifiée',
      subtitle: 'TF-123789-A mise à jour',
      time: 'Il y a 2h'
    }
  ];
  
  private destroy$ = new Subject<void>();

  // =====================================================
  // LIFECYCLE
  // =====================================================

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================

  private loadDashboardData(): void {
    this.loading = true;
    
    // Simulation du chargement des données
    // En production, ces données viendraient d'un service
    setTimeout(() => {
      this.loading = false;
      this.updateKPIsBasedOnUserRole();
    }, 1000);
  }

  private updateKPIsBasedOnUserRole(): void {
    const currentUser = this.authService.currentUser;
    
    if (!currentUser) return;
    
    // Adapter les KPIs selon le rôle utilisateur
    switch (currentUser.profil) {
      case UserProfil.ADMIN:
        // Admin voit toutes les données
        break;
        
      case UserProfil.AGENT_FISCAL:
        // Agent fiscal se concentre sur les recettes et validations
        this.focusOnFiscalData();
        break;
        
      case UserProfil.TECHNICIEN_SIG:
        // Technicien SIG se concentre sur les parcelles et géométries
        this.focusOnSpatialData();
        break;
        
      case UserProfil.LECTEUR:
        // Lecteur a une vue en lecture seule
        this.setReadOnlyView();
        break;
    }
  }

  private focusOnFiscalData(): void {
    // Mettre en évidence les données fiscales
    // Ajouter des KPIs spécifiques aux agents fiscaux
  }

  private focusOnSpatialData(): void {
    // Mettre en évidence les données spatiales
    // Ajouter des KPIs spécifiques aux techniciens SIG
  }

  private setReadOnlyView(): void {
    // Vue en lecture seule pour les lecteurs
  }

  // =====================================================
  // ACTIONS UTILISATEUR
  // =====================================================

  onRefreshData(): void {
    this.loadDashboardData();
  }

  onExportData(): void {
    // Logique d'export des données du dashboard
    console.log('Export des données du dashboard...');
  }

  onYearChange(year: string): void {
    this.selectedYear = year;
    this.loadDashboardData();
  }

  onViewAllActivities(): void {
    // Navigation vers la page complète des activités
    console.log('Navigation vers toutes les activités...');
  }

  onFullscreenChart(): void {
    // Affichage du graphique en plein écran
    console.log('Graphique en plein écran...');
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('fr-FR').format(num);
  }

  formatSurface(hectares: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(hectares)} ha`;
  }

  getKPITrendClass(value: number): string {
    return value >= 0 ? 'positive' : 'negative';
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'valid': 'valid',
      'published': 'published',
      'draft': 'draft',
      'archived': 'archived'
    };
    
    return statusClasses[status] || 'default';
  }

  getActivityIconClass(type: string): string {
    const iconClasses: { [key: string]: string } = {
      'create': 'create',
      'validate': 'validate',
      'update': 'update',
      'delete': 'delete'
    };
    
    return iconClasses[type] || 'default';
  }

  // =====================================================
  // PERMISSIONS & ACCÈS
  // =====================================================

  canExportData(): boolean {
    return this.authService.hasPermission(
      UserProfil.ADMIN,
      UserProfil.AGENT_FISCAL
    );
  }

  canViewDetailedStats(): boolean {
    return this.authService.hasPermission(
      UserProfil.ADMIN,
      UserProfil.AGENT_FISCAL,
      UserProfil.TECHNICIEN_SIG
    );
  }

  canManageData(): boolean {
    return this.authService.hasPermission(
      UserProfil.ADMIN
    );
  }

  // =====================================================
  // CALCULS & STATISTIQUES
  // =====================================================

  calculateTotalRevenue(): number {
    return this.chartData.recettesEvolution.reduce((total, item) => total + item.value, 0);
  }

  calculateAverageMonthlyRevenue(): number {
    const total = this.calculateTotalRevenue();
    return total / this.chartData.recettesEvolution.length;
  }

  getTopPerformingZone(): string {
    const topZone = this.chartData.repartitionZones.reduce((prev, current) => 
      (prev.percentage > current.percentage) ? prev : current
    );
    return topZone.zone;
  }

  getCompletionPercentage(): number {
    const total = this.statutsParcelles.reduce((sum, item) => sum + item.count, 0);
    const completed = this.statutsParcelles
      .filter(item => item.status === 'valid' || item.status === 'published')
      .reduce((sum, item) => sum + item.count, 0);
    
    return Math.round((completed / total) * 100);
  }
}
