import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule
  ],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>📊 Tableau de bord TNB</h2>
        <p>Vue d'ensemble de la gestion des terrains non bâtis - Commune d'Oujda</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">🗺️</div>
          <div class="stat-content">
            <h3>Total Parcelles</h3>
            <p class="stat-number">1,234</p>
            <span class="stat-change positive">+12 ce mois</span>
          </div>
        </div>
        
        <div class="stat-card success">
          <div class="stat-icon">📐</div>
          <div class="stat-content">
            <h3>Surface Totale</h3>
            <p class="stat-number">5,678 m²</p>
            <span class="stat-change neutral">Surface cadastrée</span>
          </div>
        </div>
        
        <div class="stat-card warning">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>Montant TNB</h3>
            <p class="stat-number">123,456 DH</p>
            <span class="stat-change positive">+8.5% vs 2024</span>
          </div>
        </div>
        
        <div class="stat-card info">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>Fiches Générées</h3>
            <p class="stat-number">987</p>
            <span class="stat-change neutral">80% du total</span>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="chart-section">
          <h3>📈 Évolution Mensuelle</h3>
          <div class="chart-placeholder">
            <p>Graphique d'évolution des parcelles et montants TNB</p>
            <div class="mock-chart">
              <div class="chart-bar" style="height: 60%"></div>
              <div class="chart-bar" style="height: 80%"></div>
              <div class="chart-bar" style="height: 45%"></div>
              <div class="chart-bar" style="height: 90%"></div>
              <div class="chart-bar" style="height: 70%"></div>
              <div class="chart-bar" style="height: 85%"></div>
            </div>
          </div>
        </div>

        <div class="activity-section">
          <h3>🔄 Activités Récentes</h3>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon">➕</div>
              <div class="activity-content">
                <p><strong>Nouvelle parcelle</strong> ajoutée</p>
                <span class="activity-time">Il y a 2h</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">📄</div>
              <div class="activity-content">
                <p><strong>Fiche TNB</strong> générée pour TF/123/A</p>
                <span class="activity-time">Il y a 4h</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">👤</div>
              <div class="activity-content">
                <p><strong>Propriétaire</strong> Ahmed BENNANI mis à jour</p>
                <span class="activity-time">Hier</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h3>⚡ Actions Rapides</h3>
        <div class="actions-grid">
          <button class="action-btn">
            <span class="action-icon">➕</span>
            <span>Nouvelle Parcelle</span>
          </button>
          <button class="action-btn">
            <span class="action-icon">📄</span>
            <span>Générer Fiches</span>
          </button>
          <button class="action-btn">
            <span class="action-icon">📥</span>
            <span>Importer Données</span>
          </button>
          <button class="action-btn">
            <span class="action-icon">📊</span>
            <span>Voir Rapports</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 1rem; }
    
    .dashboard-header {
      margin-bottom: 2rem;
    }
    
    .dashboard-header h2 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.8rem;
    }
    
    .dashboard-header p {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }
    
    .stats-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
      gap: 1rem; 
      margin-bottom: 2rem;
    }
    
    .stat-card { 
      background: white; 
      padding: 1.5rem; 
      border-radius: 12px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      border-left: 4px solid #007bff;
    }
    
    .stat-card.primary { border-left-color: #007bff; }
    .stat-card.success { border-left-color: #28a745; }
    .stat-card.warning { border-left-color: #ffc107; }
    .stat-card.info { border-left-color: #17a2b8; }
    
    .stat-icon {
      font-size: 2.5rem;
      opacity: 0.8;
    }
    
    .stat-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
    }
    
    .stat-number { 
      font-size: 1.8rem; 
      font-weight: bold; 
      color: #333; 
      margin: 0 0 0.25rem 0;
    }
    
    .stat-change {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    
    .stat-change.positive { 
      background: #d4edda; 
      color: #155724; 
    }
    
    .stat-change.neutral { 
      background: #e2e3e5; 
      color: #495057; 
    }
    
    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .chart-section, .activity-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .chart-section h3, .activity-section h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
    }
    
    .chart-placeholder {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      color: #666;
    }
    
    .mock-chart {
      display: flex;
      justify-content: center;
      align-items: end;
      gap: 0.5rem;
      height: 100px;
      margin-top: 1rem;
    }
    
    .chart-bar {
      width: 20px;
      background: linear-gradient(to top, #007bff, #66a3ff);
      border-radius: 2px 2px 0 0;
    }
    
    .activity-list {
      space-y: 1rem;
    }
    
    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 0.75rem;
    }
    
    .activity-icon {
      width: 40px;
      height: 40px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .activity-content p {
      margin: 0 0 0.25rem 0;
      font-size: 0.9rem;
    }
    
    .activity-time {
      color: #666;
      font-size: 0.8rem;
    }
    
    .quick-actions {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .quick-actions h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .action-btn:hover {
      background: #e9ecef;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .action-icon {
      font-size: 1.5rem;
    }
    
    .action-btn span:last-child {
      font-weight: 500;
      color: #333;
    }
    
    @media (max-width: 768px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .actions-grid {
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
      }
      
      .stat-card {
        padding: 1rem;
      }
      
      .stat-icon {
        font-size: 2rem;
      }
      
      .stat-number {
        font-size: 1.5rem;
      }
    }
  `]
})
export class DashboardHomeComponent { }

// Routes pour le module
const dashboardRoutes = [
  { path: '', component: DashboardHomeComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(dashboardRoutes),
    DashboardHomeComponent // ✅ Importer le composant standalone au lieu de le déclarer
  ]
  // ❌ Suppression de declarations: [DashboardHomeComponent]
})
export class DashboardModule { }