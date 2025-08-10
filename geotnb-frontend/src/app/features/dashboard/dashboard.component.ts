import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService } from './services/dashboard.service';
import { DashboardStats } from '../../core/models/dashboard.interface';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef;
  @ViewChild('barChart') barChartRef!: ElementRef;

  stats: DashboardStats | null = null;
  recentActions: any[] = [];
  
  private pieChart!: Chart;
  private barChart!: Chart;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    this.initCharts();
  }

  loadDashboardData(): void {
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.updateCharts();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });

    this.dashboardService.getRecentActions().subscribe({
      next: (actions) => {
        this.recentActions = actions;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des actions récentes:', error);
      }
    });
  }

  initCharts(): void {
    this.createPieChart();
    this.createBarChart();
  }

  createPieChart(): void {
    const ctx = this.pieChartRef.nativeElement.getContext('2d');
    
    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Zone Résidentielle', 'Zone Commerciale', 'Zone Industrielle', 'Zone Agricole'],
        datasets: [{
          data: [40, 25, 20, 15],
          backgroundColor: [
            '#1976d2',
            '#388e3c',
            '#ff9800',
            '#f44336'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  createBarChart(): void {
    const ctx = this.barChartRef.nativeElement.getContext('2d');
    
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Parcelles ajoutées',
          data: [12, 19, 8, 15, 22, 30],
          backgroundColor: '#1976d2'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateCharts(): void {
    if (this.stats && this.pieChart && this.barChart) {
      // Mettre à jour les données des graphiques avec les vraies données
      // Cette logique sera adaptée selon les données reçues du backend
    }
  }

  getActionIcon(actionType: string): string {
    const icons: { [key: string]: string } = {
      'create': 'fas fa-plus-circle',
      'update': 'fas fa-edit',
      'delete': 'fas fa-trash-alt',
      'import': 'fas fa-upload'
    };
    return icons[actionType] || 'fas fa-info-circle';
  }
}
