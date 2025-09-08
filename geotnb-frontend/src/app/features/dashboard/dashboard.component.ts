/* =====================================================
   DASHBOARD COMPONENT - VERSION COMPLÈTE
   ===================================================== */

import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil, switchMap, startWith } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { UserProfil } from '../../core/models/database.models';
import { DashboardDataService } from './services/dashboard-data.service';
import { DashboardKPIs, StatutFoncierData, ZonageUrbanistiqueData, EvolutionMensuelleData, TopParcelleTNB } from './models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  
  // =====================================================
  // PROPRIÉTÉS
  // =====================================================
  
  // Données du dashboard
  kpiData: DashboardKPIs | null = null;
  statutFoncierData: StatutFoncierData | null = null;
  zonageUrbanistiqueData: ZonageUrbanistiqueData | null = null;
  evolutionMensuelleData: EvolutionMensuelleData[] = [];
  topParcellesTNB: TopParcelleTNB[] = [];
  lastUpdate: Date = new Date();
  
  // Filtres
  selectedSecteur: string = '';
  selectedZonage: string = '';
  selectedStatut: string = '';
  selectedOccupation: string = '';
  selectedMapTheme: string = 'density';
  
  // Couches de la carte
  layers = {
    parcelles: true,
    limites: true,
    plans: false,
    orthophotos: false
  };
  
  // Configuration temps réel
  isRealTimeActive = true;
  realTimeSubscription?: Subscription;
  private destroy$ = new Subject<void>();
  
  // Graphiques Chart.js
  private charts: { [key: string]: any } = {};

  constructor(
    private authService: AuthService,
    private dashboardDataService: DashboardDataService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeDashboard();
    this.startRealTimeUpdates();
  }

  ngAfterViewInit(): void {
    // Attendre que Chart.js soit chargé
    this.waitForChartJS().then(() => {
      this.initializeCharts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Détruire tous les graphiques
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    
    if (this.realTimeSubscription) {
      this.realTimeSubscription.unsubscribe();
    }
  }

  // =====================================================
  // MÉTHODES PRIVÉES
  // =====================================================

  private waitForChartJS(): Promise<void> {
    return new Promise((resolve) => {
      const checkChartJS = () => {
        if (typeof (window as any).Chart !== 'undefined') {
          resolve();
        } else {
          setTimeout(checkChartJS, 100);
        }
      };
      checkChartJS();
    });
  }

  private initializeDashboard(): void {
    this.dashboardDataService.getDashboardData().subscribe({
      next: (data) => {
        this.kpiData = data.kpis;
        this.statutFoncierData = data.statutFoncier;
        this.zonageUrbanistiqueData = data.zonageUrbanistique;
        this.evolutionMensuelleData = data.evolutionMensuelle;
        this.topParcellesTNB = data.topParcellesTNB;
        this.lastUpdate = new Date();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des données:', error);
        this.snackBar.open('Erreur lors du chargement des données', 'Fermer', { duration: 3000 });
      }
    });
  }

  private startRealTimeUpdates(): void {
    if (!this.isRealTimeActive) return;

    // Mise à jour toutes les 5 minutes
    this.realTimeSubscription = interval(300000)
      .pipe(
        startWith(0),
        switchMap(() => this.dashboardDataService.getDashboardData()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.kpiData = data.kpis;
          this.statutFoncierData = data.statutFoncier;
          this.zonageUrbanistiqueData = data.zonageUrbanistique;
          this.evolutionMensuelleData = data.evolutionMensuelle;
          this.topParcellesTNB = data.topParcellesTNB;
          this.lastUpdate = new Date();
          
          // Mettre à jour les graphiques
          this.updateCharts();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour temps réel:', error);
        }
      });
  }

  private async initializeCharts(): Promise<void> {
    try {
      // Configuration globale Chart.js
      (window as any).Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      (window as any).Chart.defaults.plugins.legend.position = 'bottom';
      (window as any).Chart.defaults.maintainAspectRatio = false;
      
      // Créer les graphiques
      this.createStatutFoncierChart();
      this.createRecettesChart();
      this.createZonageChart();
      this.createTarifsChart();
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement de Chart.js:', error);
      this.snackBar.open('Erreur lors du chargement des graphiques', 'Fermer', { duration: 3000 });
    }
  }

  private createStatutFoncierChart(): void {
    const canvas = document.getElementById('statutChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Détruire le graphique existant
    if (this.charts['statut']) {
      this.charts['statut'].destroy();
    }

    this.charts['statut'] = new (window as any).Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Titre Foncier (TF)', 'Réquisition (R)', 'Non Immatriculé (NI)', 'Melk'],
        datasets: [{
          data: [7250, 3420, 4890, 287],
          backgroundColor: ['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1.5,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  private createRecettesChart(): void {
    const canvas = document.getElementById('recettesChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts['recettes']) {
      this.charts['recettes'].destroy();
    }

    this.charts['recettes'] = new (window as any).Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [{
          label: 'Recettes TNB (MDH)',
          data: [0.6, 0.8, 1.2, 0.9, 1.1, 0.7, 0.9, 1.0, 0.8, 1.3, 0.9, 1.2],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Recettes (MDH)',
              font: {
                size: 12
              }
            },
            ticks: {
              font: {
                size: 10
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 10
              }
            }
          }
        }
      }
    });
  }

  private createZonageChart(): void {
    const canvas = document.getElementById('zonageChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts['zonage']) {
      this.charts['zonage'].destroy();
    }

    this.charts['zonage'] = new (window as any).Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['R+2', 'R+4', 'Villas', 'Industriel', 'Commercial', 'Autres'],
        datasets: [{
          label: 'Nombre de parcelles',
          data: [4200, 3800, 2900, 1200, 800, 947],
          backgroundColor: [
            '#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1.8,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: 10
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 10
              }
            }
          }
        }
      }
    });
  }

  private createTarifsChart(): void {
    const canvas = document.getElementById('tarifsChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts['tarifs']) {
      this.charts['tarifs'].destroy();
    }

    this.charts['tarifs'] = new (window as any).Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['2-5 DH/m²', '6-10 DH/m²', '11-15 DH/m²', '16-20 DH/m²'],
        datasets: [{
          data: [3200, 5400, 2800, 1235],
          backgroundColor: ['#54a0ff', '#5f27cd', '#ff9ff3', '#ff4757']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1.5,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  private updateCharts(): void {
    // Mettre à jour les données des graphiques si nécessaire
    // Cette méthode peut être étendue pour mettre à jour les graphiques avec de nouvelles données
  }

  // =====================================================
  // GETTERS POUR LE TEMPLATE
  // =====================================================

  get tauxImposition(): number {
    if (this.kpiData?.terrainsImposables && this.kpiData?.terrainsRecenses) {
      return this.kpiData.terrainsImposables / this.kpiData.terrainsRecenses;
    }
    return 0;
  }

  get tauxSurfaceImposable(): number {
    if (this.kpiData?.surfaceImposable && this.kpiData?.superficieTotale) {
      return this.kpiData.surfaceImposable / this.kpiData.superficieTotale;
    }
    return 0;
  }

  // =====================================================
  // MÉTHODES PUBLIQUES
  // =====================================================

  onMapThemeChange(): void {
    console.log('Changement de thème de carte:', this.selectedMapTheme);
    // Ici, intégration avec OpenLayers pour changer la symbologie
  }

  exportChart(chartType: string): void {
    console.log('Export du graphique:', chartType);
    this.snackBar.open(`Export du graphique ${chartType} en cours...`, 'Fermer', { duration: 2000 });
  }

  exportReport(reportType: string): void {
    console.log('Export du rapport:', reportType);
    this.snackBar.open(`Export du rapport ${reportType} en cours...`, 'Fermer', { duration: 2000 });
  }
}