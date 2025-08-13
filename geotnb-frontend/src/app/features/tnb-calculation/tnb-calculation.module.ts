// features/tnb-calculation/tnb-calculation.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tnb-calculator',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule
  ],
  template: `
    <div class="tnb-calculation">
      <div class="calc-header">
        <h2>💰 Calcul de la Taxe TNB</h2>
        <p>Calcul et simulation de la Taxe sur les Terrains Non Bâtis selon la loi 47-06</p>
      </div>
      
      <div class="calc-content">
        <!-- Calculateur individuel -->
        <div class="calc-form">
          <h3>🧮 Calculateur TNB Individuel</h3>
          
          <div class="form-grid">
            <div class="form-group">
              <label for="surface">Surface du terrain (m²)</label>
              <input 
                type="number" 
                id="surface"
                [(ngModel)]="calculForm.surface" 
                (input)="calculateTNB()"
                placeholder="Ex: 500"
                class="form-control"
                min="1"
              >
              <small class="form-hint">Surface totale imposable du terrain</small>
            </div>
            
            <div class="form-group">
              <label for="zone">Zone urbanistique</label>
              <select 
                id="zone"
                [(ngModel)]="calculForm.zone" 
                (change)="calculateTNB()"
                class="form-control"
              >
                <option value="">Sélectionner une zone</option>
                <option value="R1">R1 - Résidentiel Faible Densité (10 DH/m²)</option>
                <option value="R2">R2 - Résidentiel Moyenne Densité (8 DH/m²)</option>
                <option value="R3">R3 - Résidentiel Forte Densité (6 DH/m²)</option>
                <option value="I1">I1 - Industriel Léger (12 DH/m²)</option>
                <option value="I2">I2 - Industriel Lourd (15 DH/m²)</option>
                <option value="C">C - Commercial Centre-ville (20 DH/m²)</option>
                <option value="E">E - Équipements Publics (5 DH/m²)</option>
              </select>
              <small class="form-hint">Zone selon le plan d'aménagement</small>
            </div>
            
            <div class="form-group">
              <label for="quotePart">Quote-part propriétaire</label>
              <input 
                type="number" 
                id="quotePart"
                [(ngModel)]="calculForm.quotePart" 
                (input)="calculateTNB()"
                min="0" 
                max="1" 
                step="0.01"
                placeholder="1.00"
                class="form-control"
              >
              <small class="form-hint">Fraction de propriété (0.1 = 10%, 1 = 100%)</small>
            </div>
            
            <div class="form-group">
              <label for="exoneration">Exonération</label>
              <select 
                id="exoneration"
                [(ngModel)]="calculForm.exoneration" 
                (change)="calculateTNB()"
                class="form-control"
              >
                <option value="none">Aucune exonération</option>
                <option value="3">3 ans - Surface ≤ 500m² (Art. 7 Loi 47-06)</option>
                <option value="5">5 ans - Surface 500-1000m² (Art. 7 Loi 47-06)</option>
                <option value="7">7 ans - Surface > 1000m² (Art. 7 Loi 47-06)</option>
                <option value="handicap">Exonération handicap (Art. 8)</option>
                <option value="social">Logement social (Art. 9)</option>
              </select>
              <small class="form-hint">Exonérations selon la législation en vigueur</small>
            </div>
          </div>
          
          <!-- Résultat du calcul -->
          <div class="calc-result" *ngIf="calculResult.montantTNB >= 0">
            <div class="result-card" [class.exempted]="calculResult.isExempted">
              <h4>
                <span *ngIf="!calculResult.isExempted">💵 Montant TNB Calculé</span>
                <span *ngIf="calculResult.isExempted">🚫 Parcelle Exonérée</span>
              </h4>
              
              <div class="result-amount" *ngIf="!calculResult.isExempted">
                {{ calculResult.montantTNB | currency:'MAD':'symbol':'1.2-2':'fr-MA' }}
              </div>
              
              <div class="result-amount exempted-text" *ngIf="calculResult.isExempted">
                EXONÉRÉE
              </div>
              
              <div class="result-details">
                <div class="detail-row">
                  <span>Surface imposable:</span>
                  <span>{{ calculForm.surface | number:'1.0-0':'fr-MA' }} m²</span>
                </div>
                <div class="detail-row">
                  <span>Zone / Tarif:</span>
                  <span>{{ calculForm.zone }} - {{ getTarif() }} DH/m²</span>
                </div>
                <div class="detail-row">
                  <span>Quote-part:</span>
                  <span>{{ (calculForm.quotePart * 100) | number:'1.0-1':'fr-MA' }}%</span>
                </div>
                <div class="detail-row" *ngIf="calculResult.isExempted">
                  <span>Raison exonération:</span>
                  <span>{{ getExonerationLabel() }}</span>
                </div>
                <div class="detail-row" *ngIf="!calculResult.isExempted">
                  <span>Calcul:</span>
                  <span>{{ calculForm.surface }} × {{ getTarif() }} × {{ calculForm.quotePart }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="calc-actions">
            <button class="btn btn-primary" (click)="calculateTNB()">
              <span>📊</span> Recalculer
            </button>
            <button class="btn btn-success" (click)="saveParcelle()" [disabled]="!isFormValid()">
              <span>💾</span> Sauvegarder Parcelle
            </button>
            <button class="btn btn-info" (click)="generateFiche()" [disabled]="calculResult.isExempted || calculResult.montantTNB <= 0">
              <span>📄</span> Générer Fiche
            </button>
            <button class="btn btn-secondary" (click)="resetForm()">
              <span>🔄</span> Réinitialiser
            </button>
          </div>
        </div>

        <!-- Barème des tarifs -->
        <div class="tarif-section">
          <h3>💲 Barème des Tarifs TNB</h3>
          <div class="tarif-info">
            <p><strong>Tarifs en vigueur 2025</strong> - Arrêté municipal du 15/01/2025</p>
          </div>
          
          <div class="tarif-table">
            <table class="table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Description</th>
                  <th>Tarif (DH/m²)</th>
                  <th>Exemple 500m²</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let tarif of tarifsTable" [class.selected]="calculForm.zone === tarif.code">
                  <td>
                    <span class="zone-badge" [class]="'zone-' + tarif.code.toLowerCase()">
                      {{ tarif.code }}
                    </span>
                  </td>
                  <td>{{ tarif.description }}</td>
                  <td>
                    <strong>{{ tarif.prix | currency:'MAD':'symbol':'1.2-2':'fr-MA' }}</strong>
                  </td>
                  <td class="example-amount">
                    {{ (500 * tarif.prix) | currency:'MAD':'symbol':'1.0-0':'fr-MA' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="tarif-notes">
            <h4>📋 Notes importantes</h4>
            <ul>
              <li><strong>Exonérations automatiques</strong> selon la surface (Art. 7 Loi 47-06)</li>
              <li><strong>Calcul prorata temporis</strong> pour les nouvelles constructions</li>
              <li><strong>Révision annuelle</strong> des tarifs par délibération communale</li>
              <li><strong>Paiement avant le 31 mars</strong> de chaque année</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Calcul par lot -->
      <div class="batch-calc">
        <h3>📊 Calcul TNB par Lot</h3>
        
        <div class="batch-content">
          <div class="batch-filters">
            <h4>🎯 Sélection du lot</h4>
            
            <div class="filter-grid">
              <div class="filter-group">
                <label>Type de sélection</label>
                <select [(ngModel)]="batchForm.type" class="form-control">
                  <option value="all">Toutes les parcelles</option>
                  <option value="zone">Par zone urbanistique</option>
                  <option value="proprietaire">Par propriétaire</option>
                  <option value="statut">Par statut foncier</option>
                  <option value="surface">Par tranche de surface</option>
                </select>
              </div>
              
              <div class="filter-group" *ngIf="batchForm.type === 'zone'">
                <label>Zone urbanistique</label>
                <select [(ngModel)]="batchForm.zone" class="form-control">
                  <option value="">Toutes les zones</option>
                  <option value="R1">R1 - Résidentiel Faible</option>
                  <option value="R2">R2 - Résidentiel Moyenne</option>
                  <option value="R3">R3 - Résidentiel Forte</option>
                  <option value="I1">I1 - Industriel Léger</option>
                  <option value="I2">I2 - Industriel Lourd</option>
                  <option value="C">C - Commercial</option>
                </select>
              </div>
              
              <div class="filter-group" *ngIf="batchForm.type === 'surface'">
                <label>Surface minimum (m²)</label>
                <input type="number" [(ngModel)]="batchForm.surfaceMin" class="form-control" placeholder="0">
              </div>
              
              <div class="filter-group" *ngIf="batchForm.type === 'surface'">
                <label>Surface maximum (m²)</label>
                <input type="number" [(ngModel)]="batchForm.surfaceMax" class="form-control" placeholder="10000">
              </div>
            </div>
            
            <div class="batch-actions">
              <button class="btn btn-primary" (click)="calculateBatch()">
                <span>🔄</span> Calculer le lot
              </button>
              <button class="btn btn-success" (click)="generateBatchFiches()" [disabled]="!batchResult.parcelles">
                <span>📄</span> Générer toutes les fiches
              </button>
              <button class="btn btn-info" (click)="exportBatchResults()" [disabled]="!batchResult.parcelles">
                <span>📤</span> Exporter résultats
              </button>
            </div>
          </div>
          
          <!-- Résultats du lot -->
          <div class="batch-results" *ngIf="batchResult.parcelles">
            <h4>📈 Résumé du calcul par lot</h4>
            
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-icon">🗺️</div>
                <div class="summary-content">
                  <h5>Parcelles traitées</h5>
                  <div class="summary-number">{{ batchResult.totalParcelles | number:'1.0-0':'fr-MA' }}</div>
                </div>
              </div>
              
              <div class="summary-card">
                <div class="summary-icon">💰</div>
                <div class="summary-content">
                  <h5>Montant total TNB</h5>
                  <div class="summary-number">{{ batchResult.montantTotal | currency:'MAD':'symbol':'1.0-0':'fr-MA' }}</div>
                </div>
              </div>
              
              <div class="summary-card">
                <div class="summary-icon">📄</div>
                <div class="summary-content">
                  <h5>Fiches à générer</h5>
                  <div class="summary-number">{{ batchResult.fichesAGenerer | number:'1.0-0':'fr-MA' }}</div>
                </div>
              </div>
              
              <div class="summary-card">
                <div class="summary-icon">🚫</div>
                <div class="summary-content">
                  <h5>Parcelles exonérées</h5>
                  <div class="summary-number">{{ batchResult.parcellesExonerees | number:'1.0-0':'fr-MA' }}</div>
                </div>
              </div>
            </div>
            
            <!-- Répartition par zone -->
            <div class="zone-breakdown">
              <h5>📊 Répartition par zone</h5>
              <div class="breakdown-table">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Zone</th>
                      <th>Nb Parcelles</th>
                      <th>Surface Totale</th>
                      <th>Montant TNB</th>
                      <th>% du Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let zone of batchResult.repartitionZones">
                      <td>
                        <span class="zone-badge" [class]="'zone-' + zone.code.toLowerCase()">
                          {{ zone.code }}
                        </span>
                      </td>
                      <td>{{ zone.parcelles | number:'1.0-0':'fr-MA' }}</td>
                      <td>{{ zone.surface | number:'1.0-0':'fr-MA' }} m²</td>
                      <td>{{ zone.montant | currency:'MAD':'symbol':'1.0-0':'fr-MA' }}</td>
                      <td>{{ zone.pourcentage | number:'1.1-1':'fr-MA' }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tnb-calculation {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .calc-header {
      margin-bottom: 2rem;
      text-align: center;
    }
    
    .calc-header h2 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
      font-weight: 600;
    }
    
    .calc-header p {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
    }
    
    .calc-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 3rem;
    }
    
    .calc-form, .tarif-section, .batch-calc {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
    }
    
    .calc-form h3, .tarif-section h3, .batch-calc h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
      font-size: 1.3rem;
      font-weight: 600;
      border-bottom: 2px solid #007bff;
      padding-bottom: 0.5rem;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
    }
    
    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }
    
    .form-control {
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0,123,255,0.15);
    }
    
    .form-hint {
      margin-top: 0.25rem;
      font-size: 0.8rem;
      color: #6c757d;
      font-style: italic;
    }
    
    .calc-result {
      margin-bottom: 2rem;
    }
    
    .result-card {
      background: linear-gradient(135deg, #28a745, #34ce57);
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      color: white;
      box-shadow: 0 8px 24px rgba(40,167,69,0.3);
    }
    
    .result-card.exempted {
      background: linear-gradient(135deg, #ffc107, #ffcd39);
      color: #212529;
      box-shadow: 0 8px 24px rgba(255,193,7,0.3);
    }
    
    .result-card h4 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .result-amount {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .exempted-text {
      color: #dc3545;
      font-size: 2rem;
    }
    
    .result-details {
      background: rgba(255,255,255,0.2);
      padding: 1rem;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    
    .detail-row:last-child {
      margin-bottom: 0;
    }
    
    .calc-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      text-decoration: none;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
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
    .btn-info { 
      background: linear-gradient(135deg, #17a2b8, #117a8b); 
      color: white; 
    }
    .btn-warning { 
      background: linear-gradient(135deg, #ffc107, #e0a800); 
      color: #212529; 
    }
    
    .tarif-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      border-left: 4px solid #007bff;
    }
    
    .tarif-info p {
      margin: 0;
      font-weight: 500;
      color: #495057;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
    }
    
    .table th, .table td {
      padding: 1rem 0.75rem;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
      font-size: 0.9rem;
    }
    
    .table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }
    
    .table tr.selected {
      background: #e7f3ff;
      border-left: 4px solid #007bff;
    }
    
    .zone-badge {
      padding: 0.35rem 0.7rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: bold;
      color: white;
      text-transform: uppercase;
    }
    
    .zone-r1 { background: #007bff; }
    .zone-r2 { background: #6f42c1; }
    .zone-r3 { background: #e83e8c; }
    .zone-i1 { background: #fd7e14; }
    .zone-i2 { background: #dc3545; }
    .zone-c { background: #20c997; }
    .zone-e { background: #6c757d; }
    
    .example-amount {
      font-weight: 600;
      color: #28a745;
    }
    
    .tarif-notes {
      background: #fff8e1;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #ffc107;
    }
    
    .tarif-notes h4 {
      margin: 0 0 1rem 0;
      color: #856404;
      font-size: 1rem;
    }
    
    .tarif-notes ul {
      margin: 0;
      padding-left: 1.5rem;
    }
    
    .tarif-notes li {
      margin-bottom: 0.5rem;
      color: #856404;
      line-height: 1.4;
    }
    
    .batch-calc {
      grid-column: 1 / -1;
      margin-top: 1rem;
    }
    
    .batch-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
    }
    
    .filter-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
    }
    
    .filter-group label {
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }
    
    .batch-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    
    .batch-results h4 {
      margin: 0 0 1.5rem 0;
      color: #333;
      font-size: 1.2rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #28a745;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .summary-card {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #e9ecef;
      transition: transform 0.3s ease;
    }
    
    .summary-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }
    
    .summary-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .summary-content h5 {
      margin: 0 0 0.5rem 0;
      color: #666;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .summary-number {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }
    
    .zone-breakdown {
      margin-top: 2rem;
    }
    
    .zone-breakdown h5 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .table-sm th, .table-sm td {
      padding: 0.75rem 0.5rem;
      font-size: 0.85rem;
    }
    
    @media (max-width: 1200px) {
      .calc-content {
        grid-template-columns: 1fr;
      }
      
      .batch-content {
        grid-template-columns: 1fr;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .filter-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TnbCalculatorComponent {
  // Formulaire de calcul individuel
  calculForm = {
    surface: 500,
    zone: 'R1',
    quotePart: 1,
    exoneration: 'none'
  };

  // Résultat du calcul
  calculResult = {
    montantTNB: 0,
    isExempted: false
  };

  // Formulaire calcul par lot
  batchForm = {
    type: 'all',
    zone: '',
    surfaceMin: 0,
    surfaceMax: 10000
  };

  // Résultat calcul par lot
  batchResult: any = {};

  // Table des tarifs
  tarifsTable = [
    { code: 'R1', description: 'Résidentiel Faible Densité', prix: 10.00 },
    { code: 'R2', description: 'Résidentiel Moyenne Densité', prix: 8.00 },
    { code: 'R3', description: 'Résidentiel Forte Densité', prix: 6.00 },
    { code: 'I1', description: 'Industriel Léger', prix: 12.00 },
    { code: 'I2', description: 'Industriel Lourd', prix: 15.00 },
    { code: 'C', description: 'Commercial Centre-ville', prix: 20.00 },
    { code: 'E', description: 'Équipements Publics', prix: 5.00 }
  ];

  ngOnInit() {
    this.calculateTNB();
  }

  calculateTNB() {
    if (!this.isFormValid()) {
      this.calculResult = { montantTNB: -1, isExempted: false };
      return;
    }

    // Vérifier exonération
    if (this.calculForm.exoneration !== 'none') {
      this.calculResult = { montantTNB: 0, isExempted: true };
      return;
    }

    const tarif = this.getTarif();
    const montant = this.calculForm.surface * tarif * this.calculForm.quotePart;
    
    this.calculResult = {
      montantTNB: Math.round(montant * 100) / 100,
      isExempted: false
    };
  }

  getTarif(): number {
    const zone = this.tarifsTable.find(t => t.code === this.calculForm.zone);
    return zone ? zone.prix : 0;
  }

  getExonerationLabel(): string {
    const labels: any = {
      '3': 'Surface ≤ 500m² - 3 ans',
      '5': 'Surface 500-1000m² - 5 ans', 
      '7': 'Surface > 1000m² - 7 ans',
      'handicap': 'Exonération handicap',
      'social': 'Logement social'
    };
    return labels[this.calculForm.exoneration] || '';
  }

  isFormValid(): boolean {
    return this.calculForm.surface > 0 && 
           this.calculForm.zone !== '' && 
           this.calculForm.quotePart > 0 && 
           this.calculForm.quotePart <= 1;
  }

  saveParcelle() {
    if (!this.isFormValid()) return;
    
    // Simulation sauvegarde
    alert('Parcelle sauvegardée avec succès!\n' + 
          `Surface: ${this.calculForm.surface}m²\n` +
          `Zone: ${this.calculForm.zone}\n` +
          `Montant TNB: ${this.calculResult.montantTNB} DH`);
  }

  generateFiche() {
    if (this.calculResult.isExempted || this.calculResult.montantTNB <= 0) return;
    
    // Simulation génération fiche
    alert('Fiche fiscale TNB générée!\n' +
          `Référence: TNB-2025-${Date.now()}\n` +
          `Montant: ${this.calculResult.montantTNB} DH`);
  }

  resetForm() {
    this.calculForm = {
      surface: 500,
      zone: 'R1',
      quotePart: 1,
      exoneration: 'none'
    };
    this.calculateTNB();
  }

  calculateBatch() {
    // Simulation données par lot
    const mockData = {
      totalParcelles: 1234,
      montantTotal: 15678900,
      fichesAGenerer: 987,
      parcellesExonerees: 247,
      repartitionZones: [
        { code: 'R1', parcelles: 456, surface: 228000, montant: 2280000, pourcentage: 37.0 },
        { code: 'R2', parcelles: 321, surface: 192600, montant: 1540800, pourcentage: 26.0 },
        { code: 'I1', parcelles: 234, surface: 140400, montant: 1684800, pourcentage: 19.0 },
        { code: 'C', parcelles: 123, surface: 73800, montant: 1476000, pourcentage: 10.0 },
        { code: 'R3', parcelles: 100, surface: 60000, montant: 360000, pourcentage: 8.0 }
      ]
    };

    this.batchResult = { ...mockData, parcelles: true };
  }

  generateBatchFiches() {
    if (!this.batchResult.parcelles) return;
    
    alert(`Génération de ${this.batchResult.fichesAGenerer} fiches fiscales en cours...\n` +
          `Montant total: ${this.batchResult.montantTotal.toLocaleString('fr-MA')} DH`);
  }

  exportBatchResults() {
    if (!this.batchResult.parcelles) return;
    
    alert('Export des résultats en cours...\n' +
          'Format: Excel (.xlsx)\n' +
          'Données: Répartition par zone et calculs détaillés');
  }
}

// Routes pour le module
const tnbRoutes = [
  { path: '', component: TnbCalculatorComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(tnbRoutes),
    TnbCalculatorComponent // Importer le composant standalone au lieu de le déclarer
  ]
})
export class TnbCalculationModule { }