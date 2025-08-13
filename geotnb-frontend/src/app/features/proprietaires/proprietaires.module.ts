// features/proprietaires/proprietaires.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-proprietaires-list',
  standalone: true, 
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="proprietaires">
      <div class="proprietaires-header">
        <h2>👥 Gestion des Propriétaires</h2>
        <p>Base de données complète des propriétaires de parcelles TNB</p>
      </div>
      
      <div class="toolbar">
        <button class="btn btn-primary">➕ Nouveau Propriétaire</button>
        <button class="btn btn-secondary">📥 Importer CSV</button>
        <button class="btn btn-secondary">📤 Exporter</button>
      </div>

      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">👤</div>
          <div class="stat-content">
            <h3>Total Propriétaires</h3>
            <p class="stat-number">1,456</p>
            <span class="stat-change">+23 ce mois</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏠</div>
          <div class="stat-content">
            <h3>Personnes Physiques</h3>
            <p class="stat-number">1,289</p>
            <span class="stat-change">88.5%</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏢</div>
          <div class="stat-content">
            <h3>Personnes Morales</h3>
            <p class="stat-number">167</p>
            <span class="stat-change">11.5%</span>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="proprietaires-table">
          <thead>
            <tr>
              <th>Nom / Raison Sociale</th>
              <th>Type</th>
              <th>CIN / RC</th>
              <th>Téléphone</th>
              <th>Nb Parcelles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Ahmed BENNANI</strong></td>
              <td><span class="badge badge-physique">Personne Physique</span></td>
              <td><code>AB123456</code></td>
              <td><a href="tel:+212661234567">0661 23 45 67</a></td>
              <td><span class="parcelles-count">3</span></td>
              <td>
                <button class="btn-sm btn-info">👁️</button>
                <button class="btn-sm btn-warning">✏️</button>
                <button class="btn-sm btn-success">🗺️</button>
              </td>
            </tr>
            <tr>
              <td><strong>SARL CONSTRUCTION</strong></td>
              <td><span class="badge badge-morale">Personne Morale</span></td>
              <td><code>123456</code></td>
              <td><a href="tel:+212537123456">0537 12 34 56</a></td>
              <td><span class="parcelles-count">12</span></td>
              <td>
                <button class="btn-sm btn-info">👁️</button>
                <button class="btn-sm btn-warning">✏️</button>
                <button class="btn-sm btn-success">🗺️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .proprietaires { padding: 1rem; }
    .proprietaires-header { margin-bottom: 2rem; text-align: center; }
    .proprietaires-header h2 { margin: 0 0 0.5rem 0; color: #333; font-size: 2rem; }
    .proprietaires-header p { margin: 0; color: #666; font-size: 1.1rem; }
    
    .toolbar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    
    .stats-cards { 
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
    }
    .stat-icon { font-size: 2.5rem; opacity: 0.8; }
    .stat-content h3 { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #666; }
    .stat-number { font-size: 1.8rem; font-weight: bold; color: #333; margin: 0; }
    .stat-change { font-size: 0.8rem; color: #28a745; }
    
    .table-container { 
      background: white; 
      border-radius: 12px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      overflow: hidden; 
    }
    .proprietaires-table { width: 100%; border-collapse: collapse; }
    .proprietaires-table th, .proprietaires-table td { 
      padding: 1rem 0.75rem; 
      text-align: left; 
      border-bottom: 1px solid #e9ecef; 
    }
    .proprietaires-table th { background: #f8f9fa; font-weight: 600; color: #495057; }
    
    .badge { padding: 0.35rem 0.7rem; border-radius: 6px; font-size: 0.75rem; font-weight: 500; }
    .badge-physique { background: #e3f2fd; color: #1976d2; }
    .badge-morale { background: #fff3e0; color: #f57c00; }
    
    .parcelles-count { 
      background: #007bff; 
      color: white; 
      padding: 0.25rem 0.5rem; 
      border-radius: 50%; 
      font-weight: bold; 
      font-size: 0.8rem; 
    }
    
    .btn-sm { padding: 0.35rem 0.6rem; margin: 0 0.125rem; border: none; border-radius: 4px; cursor: pointer; }
    .btn-info { background: #17a2b8; color: white; }
    .btn-warning { background: #ffc107; color: black; }
    .btn-success { background: #28a745; color: white; }
    
    a { color: #007bff; text-decoration: none; }
    a:hover { text-decoration: underline; }
  `]
})
export class ProprietairesListComponent { }

const routes = [
  { path: '', component: ProprietairesListComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ProprietairesListComponent  // ✅ CORRECTION: Import du composant standalone ici
  ],
  declarations: []  // ✅ CORRECTION: Vide car le composant est standalone
})
export class ProprietairesModule { }