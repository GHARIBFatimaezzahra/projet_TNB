import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-imports-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="imports">
      <h2>Import de Données SIG</h2>
      
      <div class="import-sections">
        <div class="import-wizard">
          <h3>🔄 Nouvel Import</h3>
          <div class="wizard-steps">
            <div class="step active">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Sélection du fichier</h4>
                <div class="file-upload-area">
                  <div class="upload-zone">
                    <p>📁 Glissez votre fichier ici ou cliquez pour sélectionner</p>
                    <p class="file-types">Formats supportés: GeoJSON, Shapefile (.zip), KML</p>
                    <input type="file" accept=".geojson,.json,.zip,.kml" style="display: none;">
                    <button class="btn btn-primary">Choisir un fichier</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Validation et mapping</h4>
                <p>Vérification de la structure et mapping des colonnes</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Import final</h4>
                <p>Importation des données dans la base</p>
              </div>
            </div>
          </div>
        </div>

        <div class="import-history">
          <h3>📋 Historique des Imports</h3>
          <div class="history-table">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Fichier</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Nb Enregistrements</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>15/01/2025 14:30</td>
                  <td>parcelles_zone_r1.geojson</td>
                  <td>GeoJSON</td>
                  <td><span class="status success">✅ Réussi</span></td>
                  <td>123</td>
                  <td>
                    <button class="btn-sm btn-info">Détails</button>
                    <button class="btn-sm btn-secondary">Log</button>
                  </td>
                </tr>
                <tr>
                  <td>14/01/2025 09:15</td>
                  <td>proprietaires.csv</td>
                  <td>CSV</td>
                  <td><span class="status warning">⚠️ Avertissements</span></td>
                  <td>89</td>
                  <td>
                    <button class="btn-sm btn-info">Détails</button>
                    <button class="btn-sm btn-warning">Erreurs</button>
                  </td>
                </tr>
                <tr>
                  <td>13/01/2025 16:45</td>
                  <td>zonage_oujda.shp.zip</td>
                  <td>Shapefile</td>
                  <td><span class="status error">❌ Échec</span></td>
                  <td>0</td>
                  <td>
                    <button class="btn-sm btn-danger">Erreurs</button>
                    <button class="btn-sm btn-secondary">Reessayer</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="import-guidelines">
          <h3>📝 Guide d'Import</h3>
          <div class="guidelines-content">
            <div class="guideline-item">
              <h4>📍 Données Parcelles (GeoJSON/Shapefile)</h4>
              <ul>
                <li><strong>reference_fonciere</strong> : Référence cadastrale (obligatoire)</li>
                <li><strong>surface_totale</strong> : Surface en m² (obligatoire)</li>
                <li><strong>statut_foncier</strong> : public, privé, domanial, melk, collectif</li>
                <li><strong>zonage</strong> : Zone urbanistique (R1, R2, I1, etc.)</li>
                <li><strong>geometry</strong> : Géométrie polygon (obligatoire)</li>
              </ul>
            </div>
            
            <div class="guideline-item">
              <h4>👥 Données Propriétaires (CSV)</h4>
              <ul>
                <li><strong>nom</strong> : Nom ou raison sociale (obligatoire)</li>
                <li><strong>nature</strong> : "Personne physique" ou "Personne morale"</li>
                <li><strong>cin_ou_rc</strong> : CIN ou RC (obligatoire)</li>
                <li><strong>adresse</strong> : Adresse complète</li>
                <li><strong>telephone</strong> : Numéro de téléphone</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .imports { padding: 1rem; }
    
    .import-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 1.5rem;
    }
    
    .import-wizard {
      grid-column: 1 / -1;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
    }
    
    .wizard-steps {
      display: flex;
      gap: 2rem;
      margin-top: 1rem;
    }
    
    .step {
      flex: 1;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      opacity: 0.5;
    }
    
    .step.active {
      opacity: 1;
    }
    
    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }
    
    .step.active .step-number {
      background: #007bff;
      color: white;
    }
    
    .upload-zone {
      border: 2px dashed #007bff;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      background: #f8f9ff;
    }
    
    .file-types {
      color: #6c757d;
      font-size: 0.9rem;
      margin: 0.5rem 0;
    }
    
    .import-history, .import-guidelines {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    
    .data-table th, .data-table td {
      padding: 0.75rem 0.5rem;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }
    
    .data-table th {
      background: #f8f9fa;
      font-weight: 600;
    }
    
    .status {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .status.success { background: #d4edda; color: #155724; }
    .status.warning { background: #fff3cd; color: #856404; }
    .status.error { background: #f8d7da; color: #721c24; }
    
    .guideline-item {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 6px;
    }
    
    .guideline-item h4 {
      margin: 0 0 1rem 0;
      color: #495057;
    }
    
    .guideline-item ul {
      margin: 0;
      padding-left: 1.5rem;
    }
    
    .guideline-item li {
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
    
    .btn, .btn-sm {
      padding: 0.375rem 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    
    .btn-sm { padding: 0.25rem 0.5rem; margin: 0 0.25rem; }
    
    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-info { background: #17a2b8; color: white; }
    .btn-warning { background: #ffc107; color: black; }
    .btn-danger { background: #dc3545; color: white; }
  `]
})
export class ImportsListComponent { }

const importsRoutes = [
  { path: '', component: ImportsListComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(importsRoutes),
    ImportsListComponent  // ✅ CORRECTION: Import du composant standalone
  ],
  declarations: []  // ✅ CORRECTION: Vide car le composant est standalone
})
export class ImportsModule { }