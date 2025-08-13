import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-parcelles-list',
  imports: [CommonModule, RouterOutlet],
  standalone: true, 
  template: `
    <div class="parcelles">
      <div class="parcelles-header">
        <h2>🗺️ Gestion des Parcelles TNB</h2>
        <p>Gestion complète des parcelles assujetties à la Taxe sur les Terrains Non Bâtis</p>
      </div>
      
      <div class="toolbar">
        <div class="toolbar-left">
          <button class="btn btn-primary">
            <span>➕</span> Nouvelle Parcelle
          </button>
          <button class="btn btn-secondary">
            <span>📥</span> Importer
          </button>
          <button class="btn btn-secondary">
            <span>📤</span> Exporter
          </button>
        </div>
        
        <div class="toolbar-right">
          <div class="view-toggle">
            <button class="btn-toggle active">📋 Liste</button>
            <button class="btn-toggle">🗺️ Carte</button>
          </div>
        </div>
      </div>

      <div class="filters-section">
        <div class="filters-grid">
          <input type="text" placeholder="🔍 Rechercher une référence..." class="search-input">
          <select class="filter-select">
            <option value="">Tous les statuts fonciers</option>
            <option value="prive">Privé</option>
            <option value="public">Public</option>
            <option value="domanial">Domanial</option>
          </select>
          <select class="filter-select">
            <option value="">Toutes les zones</option>
            <option value="R1">R1 - Résidentiel</option>
            <option value="R2">R2 - Résidentiel</option>
            <option value="I1">I1 - Industriel</option>
          </select>
          <select class="filter-select">
            <option value="">État validation</option>
            <option value="brouillon">Brouillon</option>
            <option value="valide">Validé</option>
            <option value="publie">Publié</option>
          </select>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-label">Total:</span>
          <span class="stat-value">1,234 parcelles</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Imposables:</span>
          <span class="stat-value">987 parcelles</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Exonérées:</span>
          <span class="stat-value">247 parcelles</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Surface totale:</span>
          <span class="stat-value">156,789 m²</span>
        </div>
      </div>

      <div class="table-container">
        <table class="parcelles-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Statut Foncier</th>
              <th>Zone</th>
              <th>Surface (m²)</th>
              <th>Propriétaire(s)</th>
              <th>Montant TNB</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>TF/123/A</strong></td>
              <td><span class="badge badge-private">Privé</span></td>
              <td><span class="zone-tag r1">R1</span></td>
              <td>450</td>
              <td>Ahmed BENNANI</td>
              <td><strong>4,500 DH</strong></td>
              <td><span class="status-badge validated">✅ Validé</span></td>
              <td>
                <button class="btn-sm btn-info">👁️</button>
                <button class="btn-sm btn-warning">✏️</button>
                <button class="btn-sm btn-danger">🗑️</button>
              </td>
            </tr>
            <tr>
              <td><strong>TF/456/B</strong></td>
              <td><span class="badge badge-public">Public</span></td>
              <td><span class="zone-tag i1">I1</span></td>
              <td>1,200</td>
              <td>SARL CONSTRUCTION</td>
              <td><strong>18,000 DH</strong></td>
              <td><span class="status-badge published">📋 Publié</span></td>
              <td>
                <button class="btn-sm btn-info">👁️</button>
                <button class="btn-sm btn-warning">✏️</button>
                <button class="btn-sm btn-success">📄</button>
              </td>
            </tr>
            <tr>
              <td><strong>R/789/C</strong></td>
              <td><span class="badge badge-private">Privé</span></td>
              <td><span class="zone-tag r2">R2</span></td>
              <td>800</td>
              <td>Fatima ALAOUI + 2 autres</td>
              <td><strong>6,400 DH</strong></td>
              <td><span class="status-badge draft">📝 Brouillon</span></td>
              <td>
                <button class="btn-sm btn-info">👁️</button>
                <button class="btn-sm btn-warning">✏️</button>
                <button class="btn-sm btn-success">✅</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <div class="pagination-info">
          Affichage de 1 à 20 sur 1,234 parcelles
        </div>
        <div class="pagination-controls">
          <button class="btn-pagination" disabled>⏮️</button>
          <button class="btn-pagination" disabled>◀️</button>
          <span class="page-current">Page 1 sur 62</span>
          <button class="btn-pagination">▶️</button>
          <button class="btn-pagination">⏭️</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .parcelles { padding: 1rem; }
    
    .parcelles-header {
      margin-bottom: 1.5rem;
    }
    
    .parcelles-header h2 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.8rem;
    }
    
    .parcelles-header p {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }
    
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .toolbar-left {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    
    .view-toggle {
      display: flex;
      border: 1px solid #ddd;
      border-radius: 6px;
      overflow: hidden;
    }
    
    .btn-toggle {
      padding: 0.5rem 1rem;
      border: none;
      background: white;
      cursor: pointer;
    }
    
    .btn-toggle.active {
      background: #007bff;
      color: white;
    }
    
    .filters-section {
      margin-bottom: 1rem;
    }
    
    .filters-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 1rem;
    }
    
    .search-input, .filter-select {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
    }
    
    .stats-row {
      display: flex;
      gap: 2rem;
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .stat-label {
      font-size: 0.8rem;
      color: #666;
    }
    
    .stat-value {
      font-weight: bold;
      color: #333;
    }
    
    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
      margin-bottom: 1rem;
    }
    
    .parcelles-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .parcelles-table th,
    .parcelles-table td {
      padding: 1rem 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }
    
    .parcelles-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }
    
    .parcelles-table td {
      font-size: 0.9rem;
    }
    
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .badge-private { background: #e3f2fd; color: #1976d2; }
    .badge-public { background: #e8f5e8; color: #2e7d32; }
    
    .zone-tag {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
      color: white;
    }
    
    .zone-tag.r1 { background: #2196f3; }
    .zone-tag.r2 { background: #3f51b5; }
    .zone-tag.i1 { background: #ff9800; }
    
    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .status-badge.validated { background: #d4edda; color: #155724; }
    .status-badge.published { background: #cce5ff; color: #004085; }
    .status-badge.draft { background: #fff3cd; color: #856404; }
    
    .btn-sm {
      padding: 0.25rem 0.5rem;
      margin: 0 0.125rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }
    
    .btn-info { background: #17a2b8; color: white; }
    .btn-warning { background: #ffc107; color: black; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-success { background: #28a745; color: white; }
    
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .pagination-info {
      color: #666;
      font-size: 0.9rem;
    }
    
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-pagination {
      padding: 0.5rem;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .btn-pagination:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .page-current {
      padding: 0 1rem;
      font-weight: 500;
    }
  `]
})
export class ParcellesListComponent { }

const parcellesRoutes = [
  { path: '', component: ParcellesListComponent },
  { path: 'list', component: ParcellesListComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(parcellesRoutes),
    ParcellesListComponent  // ✅ CORRECTION: Import du composant standalone ici
  ],
  declarations: []  // ✅ CORRECTION: Vide car le composant est standalone
})
export class ParcellesModule { }