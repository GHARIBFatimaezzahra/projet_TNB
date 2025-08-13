import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule
  ],
  template: `
    <div class="administration">
      <div class="admin-header">
        <h2>⚙️ Administration</h2>
        <p>Gestion système et administration de l'application GeoTNB</p>
      </div>
      
      <div class="admin-sections">
        <div class="admin-card">
          <div class="card-header">
            <h3>👥 Gestion Utilisateurs</h3>
            <span class="card-count">{{ userStats.total }} utilisateurs</span>
          </div>
          <div class="card-content">
            <p>Créer, modifier et gérer les utilisateurs et leurs permissions</p>
            <div class="card-stats">
              <div class="stat">
                <span class="stat-number">{{ userStats.admins }}</span>
                <span class="stat-label">Admins</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ userStats.agents }}</span>
                <span class="stat-label">Agents</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ userStats.technicians }}</span>
                <span class="stat-label">Techniciens</span>
              </div>
            </div>
            <div class="card-actions">
              <button class="btn btn-primary" (click)="manageUsers()">Gérer Utilisateurs</button>
              <button class="btn btn-secondary" (click)="createUser()">Nouvel Utilisateur</button>
            </div>
          </div>
        </div>

        <div class="admin-card">
          <div class="card-header">
            <h3>📋 Logs d'Audit</h3>
            <span class="card-count">{{ auditLogs.length }} actions</span>
          </div>
          <div class="card-content">
            <p>Consulter l'historique détaillé des actions système</p>
            <div class="recent-logs">
              <div class="log-item" *ngFor="let log of auditLogs.slice(0, 3)">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-action">{{ log.action }}</span>
                <span class="log-user">{{ log.user }}</span>
              </div>
            </div>
            <div class="card-actions">
              <button class="btn btn-primary" (click)="viewAllLogs()">Voir Tous les Logs</button>
              <button class="btn btn-secondary" (click)="filterLogs()">Filtrer</button>
            </div>
          </div>
        </div>

        <div class="admin-card">
          <div class="card-header">
            <h3>⚙️ Configuration Système</h3>
            <span class="card-status" [class]="systemConfig.status">
              {{ systemConfig.statusText }}
            </span>
          </div>
          <div class="card-content">
            <p>Paramètres globaux et configuration de l'application</p>
            <div class="config-items">
              <div class="config-item" *ngFor="let config of systemConfig.items">
                <span class="config-label">{{ config.label }}</span>
                <span class="config-value">{{ config.value }}</span>
              </div>
            </div>
            <div class="card-actions">
              <button class="btn btn-primary" (click)="openConfiguration()">Configuration</button>
              <button class="btn btn-warning" (click)="createBackup()">Sauvegarde</button>
            </div>
          </div>
        </div>

        <div class="admin-card">
          <div class="card-header">
            <h3>📊 Statistiques Système</h3>
            <span class="card-count">Temps réel</span>
          </div>
          <div class="card-content">
            <p>Métriques de performance et utilisation système</p>
            <div class="system-stats">
              <div class="system-stat" *ngFor="let stat of systemStats">
                <div class="stat-circle" [style.--percentage]="stat.percentage">
                  <span>{{ stat.percentage }}%</span>
                </div>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
            </div>
            <div class="card-actions">
              <button class="btn btn-info" (click)="openMonitoring()">Monitoring</button>
              <button class="btn btn-secondary" (click)="optimizeSystem()">Optimiser</button>
            </div>
          </div>
        </div>

        <div class="admin-card">
          <div class="card-header">
            <h3>🔒 Sécurité</h3>
            <span class="card-status" [class]="securityStatus.level">
              {{ securityStatus.text }}
            </span>
          </div>
          <div class="card-content">
            <p>Gestion de la sécurité et des accès</p>
            <div class="security-alerts">
              <div class="alert" [class]="alert.type" *ngFor="let alert of securityAlerts">
                <strong>{{ alert.title }}:</strong> {{ alert.message }}
              </div>
            </div>
            <div class="card-actions">
              <button class="btn btn-danger" (click)="forceLogout()">Forcer Déconnexion</button>
              <button class="btn btn-warning" (click)="managePolicies()">Politiques</button>
            </div>
          </div>
        </div>

        <div class="admin-card">
          <div class="card-header">
            <h3>🔄 Maintenance</h3>
            <span class="card-count">Planifiée</span>
          </div>
          <div class="card-content">
            <p>Outils de maintenance et optimisation système</p>
            <div class="maintenance-tools">
              <button 
                class="maintenance-btn" 
                *ngFor="let tool of maintenanceTools"
                (click)="executeTool(tool.id)"
              >
                <span class="tool-icon">{{ tool.icon }}</span>
                <span>{{ tool.name }}</span>
              </button>
            </div>
            <div class="card-actions">
              <button class="btn btn-success" (click)="scheduleMaintenance()">Planifier</button>
              <button class="btn btn-secondary" (click)="viewHistory()">Historique</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmation -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h4>{{ modalData.title }}</h4>
            <button class="modal-close" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <p>{{ modalData.message }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Annuler</button>
            <button class="btn btn-primary" (click)="confirmAction()">Confirmer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .administration { 
      padding: 1rem; 
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .admin-header {
      margin-bottom: 2rem;
      text-align: center;
    }
    
    .admin-header h2 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
      font-weight: 600;
    }
    
    .admin-header p {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
    }
    
    .admin-sections { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); 
      gap: 1.5rem; 
    }
    
    .admin-card { 
      background: white; 
      border-radius: 12px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .admin-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }
    
    .card-header {
      padding: 1.5rem 1.5rem 1rem 1.5rem;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .card-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .card-count {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0,123,255,0.3);
    }
    
    .card-status.success {
      background: linear-gradient(135deg, #28a745, #1e7e34);
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(40,167,69,0.3);
    }
    
    .card-status.warning {
      background: linear-gradient(135deg, #ffc107, #e0a800);
      color: #212529;
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(255,193,7,0.3);
    }
    
    .card-content {
      padding: 1.5rem;
    }
    
    .card-content p {
      margin: 0 0 1.5rem 0;
      color: #666;
      line-height: 1.6;
    }
    
    .card-stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .stat {
      text-align: center;
      padding: 1rem;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 10px;
      flex: 1;
      transition: transform 0.2s ease;
    }

    .stat:hover {
      transform: translateY(-2px);
    }
    
    .stat-number {
      display: block;
      font-size: 1.8rem;
      font-weight: bold;
      color: #007bff;
      margin-bottom: 0.25rem;
    }
    
    .stat-label {
      font-size: 0.85rem;
      color: #666;
      font-weight: 500;
    }
    
    .recent-logs {
      margin-bottom: 1.5rem;
    }
    
    .log-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      transition: background 0.2s ease;
    }

    .log-item:hover {
      background: #e9ecef;
    }
    
    .log-time {
      color: #666;
      font-weight: 600;
      min-width: 50px;
    }
    
    .log-action {
      flex: 1;
      margin: 0 1rem;
      font-weight: 500;
    }
    
    .log-user {
      color: #007bff;
      font-weight: 600;
      min-width: 120px;
      text-align: right;
    }
    
    .config-items {
      margin-bottom: 1.5rem;
    }
    
    .config-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      border-bottom: 1px solid #f1f1f1;
      font-size: 0.9rem;
      transition: background 0.2s ease;
    }

    .config-item:hover {
      background: #f8f9fa;
    }
    
    .config-label {
      font-weight: 600;
    }
    
    .config-value {
      color: #666;
      font-weight: 500;
    }
    
    .system-stats {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      justify-content: space-around;
    }
    
    .system-stat {
      text-align: center;
    }
    
    .stat-circle {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: conic-gradient(#007bff calc(var(--percentage) * 1%), #e9ecef 0);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin: 0 auto 0.5rem auto;
      transition: transform 0.3s ease;
    }

    .stat-circle:hover {
      transform: scale(1.1);
    }
    
    .stat-circle::before {
      content: '';
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: white;
      position: absolute;
    }
    
    .stat-circle span {
      position: relative;
      z-index: 1;
      font-weight: bold;
      font-size: 0.9rem;
      color: #333;
    }
    
    .security-alerts {
      margin-bottom: 1.5rem;
    }
    
    .alert {
      padding: 0.875rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      border-left: 4px solid;
    }
    
    .alert-warning {
      background: #fff8e1;
      color: #856404;
      border-left-color: #ffc107;
    }
    
    .alert-info {
      background: #e3f2fd;
      color: #0c5460;
      border-left-color: #2196f3;
    }
    
    .maintenance-tools {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    
    .maintenance-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border: 1px solid #e9ecef;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }
    
    .maintenance-btn:hover {
      background: linear-gradient(135deg, #e9ecef, #dee2e6);
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .tool-icon {
      font-size: 1.8rem;
    }
    
    .card-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    .btn-primary { 
      background: linear-gradient(135deg, #007bff, #0056b3); 
      color: white; 
    }
    .btn-secondary { 
      background: linear-gradient(135deg, #6c757d, #545b62); 
      color: white; 
    }
    .btn-success { 
      background: linear-gradient(135deg, #28a745, #1e7e34); 
      color: white; 
    }
    .btn-warning { 
      background: linear-gradient(135deg, #ffc107, #e0a800); 
      color: #212529; 
    }
    .btn-danger { 
      background: linear-gradient(135deg, #dc3545, #c82333); 
      color: white; 
    }
    .btn-info { 
      background: linear-gradient(135deg, #17a2b8, #117a8b); 
      color: white; 
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }

    .modal-header {
      padding: 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h4 {
      margin: 0;
      color: #333;
      font-size: 1.2rem;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }
    
    @media (max-width: 768px) {
      .admin-sections {
        grid-template-columns: 1fr;
      }
      
      .card-stats {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .system-stats {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      
      .maintenance-tools {
        grid-template-columns: 1fr;
      }

      .card-actions {
        justify-content: center;
      }
      
      .log-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }

      .log-user {
        text-align: left;
        min-width: auto;
      }
    }
  `]
})
export class AdminDashboardComponent {
  // Données des utilisateurs
  userStats = {
    total: 12,
    admins: 4,
    agents: 6,
    technicians: 2
  };

  // Logs d'audit
  auditLogs = [
    { time: '14:30', action: 'Création parcelle TF/789/D', user: 'Ahmed BENNANI' },
    { time: '13:15', action: 'Modification propriétaire #123', user: 'Fatima ALAOUI' },
    { time: '11:45', action: 'Export données parcelles', user: 'Mohamed TAZI' },
    { time: '10:20', action: 'Génération fiche TNB #456', user: 'Khadija RACHID' },
    { time: '09:30', action: 'Connexion système', user: 'Omar BENALI' }
  ];

  // Configuration système
  systemConfig = {
    status: 'success',
    statusText: '✅ Opérationnel',
    items: [
      { label: 'Tarifs TNB', value: 'Dernière MAJ: 01/01/2025' },
      { label: 'Zones Urbanistiques', value: '8 zones configurées' },
      { label: 'Email Notifications', value: 'Activé' },
      { label: 'Base de données', value: 'Version 2.1.3' }
    ]
  };

  // Statistiques système
  systemStats = [
    { label: 'Utilisation CPU', percentage: 65 },
    { label: 'Mémoire', percentage: 45 },
    { label: 'Stockage', percentage: 80 }
  ];

  // Statut sécurité
  securityStatus = {
    level: 'warning',
    text: '⚠️ Attention'
  };

  // Alertes sécurité
  securityAlerts = [
    {
      type: 'alert-warning',
      title: 'Mots de passe',
      message: '3 utilisateurs doivent changer leur mot de passe'
    },
    {
      type: 'alert-info',
      title: 'Sessions',
      message: '8 utilisateurs connectés actuellement'
    }
  ];

  // Outils de maintenance
  maintenanceTools = [
    { id: 'cleanup', icon: '🗄️', name: 'Nettoyage Base' },
    { id: 'backup', icon: '📦', name: 'Sauvegarde' },
    { id: 'sync', icon: '🔄', name: 'Sync Données' },
    { id: 'optimize', icon: '📈', name: 'Optimisation' }
  ];

  // Modal
  showModal = false;
  modalData = {
    title: '',
    message: '',
    action: ''
  };

  // Méthodes pour la gestion des utilisateurs
  manageUsers() {
    this.showConfirmModal('Gestion Utilisateurs', 'Ouvrir le module de gestion des utilisateurs ?', 'manageUsers');
  }

  createUser() {
    this.showConfirmModal('Nouvel Utilisateur', 'Créer un nouveau compte utilisateur ?', 'createUser');
  }

  // Méthodes pour les logs
  viewAllLogs() {
    this.showConfirmModal('Logs d\'Audit', 'Afficher tous les logs d\'audit système ?', 'viewLogs');
  }

  filterLogs() {
    this.showConfirmModal('Filtrer Logs', 'Ouvrir l\'interface de filtrage des logs ?', 'filterLogs');
  }

  // Méthodes pour la configuration
  openConfiguration() {
    this.showConfirmModal('Configuration', 'Ouvrir les paramètres de configuration système ?', 'configuration');
  }

  createBackup() {
    this.showConfirmModal('Sauvegarde', 'Créer une sauvegarde complète du système ?', 'backup');
  }

  // Méthodes pour le monitoring
  openMonitoring() {
    this.showConfirmModal('Monitoring', 'Ouvrir l\'interface de surveillance système ?', 'monitoring');
  }

  optimizeSystem() {
    this.showConfirmModal('Optimisation', 'Lancer l\'optimisation automatique du système ?', 'optimize');
  }

  // Méthodes pour la sécurité
  forceLogout() {
    this.showConfirmModal('Déconnexion Forcée', 'Forcer la déconnexion de tous les utilisateurs connectés ?', 'forceLogout');
  }

  managePolicies() {
    this.showConfirmModal('Politiques Sécurité', 'Ouvrir la gestion des politiques de sécurité ?', 'policies');
  }

  // Méthodes pour la maintenance
  executeTool(toolId: string) {
    const tool = this.maintenanceTools.find(t => t.id === toolId);
    if (tool) {
      this.showConfirmModal(`Outil: ${tool.name}`, `Exécuter l'outil "${tool.name}" ?`, toolId);
    }
  }

  scheduleMaintenance() {
    this.showConfirmModal('Planification', 'Ouvrir le planificateur de maintenance ?', 'schedule');
  }

  viewHistory() {
    this.showConfirmModal('Historique', 'Consulter l\'historique de maintenance ?', 'history');
  }

  // Gestion du modal
  showConfirmModal(title: string, message: string, action: string) {
    this.modalData = { title, message, action };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  confirmAction() {
    // Ici vous pouvez implémenter les actions spécifiques selon modalData.action
    console.log(`Action confirmée: ${this.modalData.action}`);
    
    // Simulation d'actions
    switch (this.modalData.action) {
      case 'backup':
        alert('Sauvegarde créée avec succès !');
        break;
      case 'forceLogout':
        alert('Tous les utilisateurs ont été déconnectés.');
        break;
      case 'optimize':
        alert('Optimisation système terminée.');
        break;
      default:
        alert(`Action "${this.modalData.action}" exécutée avec succès !`);
    }
    
    this.closeModal();
  }
}

// Routes pour le module
const adminRoutes = [
  { path: '', component: AdminDashboardComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(adminRoutes),
    AdminDashboardComponent // ✅ Importer le composant standalone au lieu de le déclarer
  ]
  // ❌ Suppression de declarations: [AdminDashboardComponent]
})
export class AdministrationModule { }