import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core'; 
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule
  ],
  template: `
    <div class="reports">
      <h2>Rapports et Exports</h2>
      
      <div class="reports-grid">
        <div class="report-category">
          <h3>📋 Rapports Parcelles</h3>
          <div class="report-items">
            <div class="report-item">
              <h4>Liste des Parcelles</h4>
              <p>Export complet des parcelles avec filtres</p>
              <div class="report-actions">
                <button class="btn btn-primary">PDF</button>
                <button class="btn btn-success">Excel</button>
                <button class="btn btn-info">CSV</button>
              </div>
            </div>
            
            <div class="report-item">
              <h4>Parcelles par Zone</h4>
              <p>Répartition des parcelles par zonage urbanistique</p>
              <div class="report-actions">
                <button class="btn btn-primary">PDF</button>
                <button class="btn btn-success">Excel</button>
              </div>
            </div>
          </div>
        </div>

        <div class="report-category">
          <h3>💰 Rapports TNB</h3>
          <div class="report-items">
            <div class="report-item">
              <h4>Fiches Fiscales</h4>
              <p>Génération des fiches TNB par lot</p>
              <div class="report-actions">
                <button class="btn btn-primary">Générer Lot</button>
                <button class="btn btn-warning">Aperçu</button>
              </div>
            </div>
            
            <div class="report-item">
              <h4>Récapitulatif TNB</h4>
              <p>Synthèse des montants TNB par période</p>
              <div class="report-actions">
                <button class="btn btn-primary">PDF</button>
                <button class="btn btn-success">Excel</button>
              </div>
            </div>
          </div>
        </div>

        <div class="report-category">
          <h3>👥 Rapports Propriétaires</h3>
          <div class="report-items">
            <div class="report-item">
              <h4>Liste Propriétaires</h4>
              <p>Annuaire des propriétaires avec contacts</p>
              <div class="report-actions">
                <button class="btn btn-primary">PDF</button>
                <button class="btn btn-success">Excel</button>
              </div>
            </div>
            
            <div class="report-item">
              <h4>Propriétés par Propriétaire</h4>
              <p>Détail des biens par propriétaire</p>
              <div class="report-actions">
                <button class="btn btn-primary">PDF</button>
                <button class="btn btn-info">Personnalisé</button>
              </div>
            </div>
          </div>
        </div>

        <div class="report-category">
          <h3>🗺️ Rapports Cartographiques</h3>
          <div class="report-items">
            <div class="report-item">
              <h4>Plans Parcellaires</h4>
              <p>Export des plans avec légendes</p>
              <div class="report-actions">
                <button class="btn btn-primary">PDF A4</button>
                <button class="btn btn-primary">PDF A3</button>
              </div>
            </div>
            
            <div class="report-item">
              <h4>Atlas TNB</h4>
              <p>Atlas complet par secteur</p>
              <div class="report-actions">
                <button class="btn btn-primary">Générer Atlas</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports { padding: 1rem; }
    
    .reports-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
      gap: 1.5rem; 
      margin-top: 1rem; 
    }
    
    .report-category {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .report-category h3 {
      background: #f8f9fa;
      margin: 0;
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
      font-size: 1.1rem;
    }
    
    .report-items {
      padding: 1rem;
    }
    
    .report-item {
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    
    .report-item:last-child {
      margin-bottom: 0;
    }
    
    .report-item h4 {
      margin: 0 0 0.5rem 0;
      color: #495057;
      font-size: 1rem;
    }
    
    .report-item p {
      margin: 0 0 1rem 0;
      color: #6c757d;
      font-size: 0.9rem;
    }
    
    .report-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 0.375rem 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .btn-primary { background: #007bff; color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-info { background: #17a2b8; color: white; }
    .btn-warning { background: #ffc107; color: #212529; }
  `]
})
export class ReportsListComponent { }

const reportsRoutes = [
  { path: '', component: ReportsListComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(reportsRoutes),
    ReportsListComponent  // ✅ CORRECTION: Import du composant standalone
  ],
  declarations: []  // ✅ CORRECTION: Vide car le composant est standalone
})
export class ReportsModule { }