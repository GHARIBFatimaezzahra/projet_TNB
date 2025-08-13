import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core'; 
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-map-viewer',
  imports: [CommonModule, RouterOutlet],
  standalone: true, 
  template: `
    <div class="map-container">
      <div class="map-header">
        <h2>🌍 Carte des Parcelles TNB</h2>
        <div class="map-controls">
          <button class="btn btn-secondary">📐 Mesurer</button>
          <button class="btn btn-secondary">🎯 Localiser</button>
          <button class="btn btn-primary">➕ Nouvelle Parcelle</button>
        </div>
      </div>
      
      <div class="map-interface">
        <div class="map-sidebar">
          <div class="layer-control">
            <h3>📋 Couches</h3>
            <div class="layer-item">
              <label>
                <input type="checkbox" checked> Parcelles TNB
              </label>
            </div>
            <div class="layer-item">
              <label>
                <input type="checkbox"> Zonage
              </label>
            </div>
            <div class="layer-item">
              <label>
                <input type="checkbox"> Limites Admin.
              </label>
            </div>
          </div>
          
          <div class="legend">
            <h3>🎨 Légende</h3>
            <div class="legend-item">
              <div class="legend-color" style="background: #007bff;"></div>
              <span>Parcelles Imposables</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #28a745;"></div>
              <span>Parcelles Exonérées</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #ffc107;"></div>
              <span>Parcelles Sélectionnées</span>
            </div>
          </div>
          
          <div class="search-panel">
            <h3>🔍 Recherche</h3>
            <input type="text" placeholder="Référence parcelle..." class="search-input">
            <button class="btn btn-primary btn-block">Rechercher</button>
          </div>
        </div>
        
        <div class="map-main">
          <div class="map-placeholder">
            <div class="map-content">
              <h3>🗺️ Carte Interactive OpenLayers</h3>
              <p>Vue cartographique des parcelles TNB de la commune d'Oujda</p>
              <div class="map-features">
                <div class="feature-item">✅ Navigation fluide (zoom, pan)</div>
                <div class="feature-item">✅ Sélection des parcelles</div>
                <div class="feature-item">✅ Popup d'informations</div>
                <div class="feature-item">✅ Outils de dessin</div>
                <div class="feature-item">✅ Export cartographique</div>
              </div>
              <div class="mock-parcels">
                <div class="mock-parcel" style="top: 20%; left: 15%; width: 60px; height: 40px;"></div>
                <div class="mock-parcel selected" style="top: 35%; left: 25%; width: 80px; height: 50px;"></div>
                <div class="mock-parcel" style="top: 50%; left: 40%; width: 70px; height: 45px;"></div>
                <div class="mock-parcel exempted" style="top: 65%; left: 20%; width: 50px; height: 35px;"></div>
              </div>
            </div>
          </div>
          
          <div class="map-toolbar">
            <div class="toolbar-group">
              <button class="tool-btn active">👆 Sélectionner</button>
              <button class="tool-btn">📐 Polygon</button>
              <button class="tool-btn">📏 Ligne</button>
              <button class="tool-btn">📍 Point</button>
            </div>
            <div class="toolbar-group">
              <button class="tool-btn">🔍+ Zoom +</button>
              <button class="tool-btn">🔍- Zoom -</button>
              <button class="tool-btn">🏠 Extent</button>
            </div>
            <div class="toolbar-group">
              <button class="tool-btn">📤 Export</button>
              <button class="tool-btn">🖨️ Imprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      height: calc(100vh - 2rem);
      display: flex;
      flex-direction: column;
    }
    
    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: white;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .map-header h2 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
    }
    
    .map-controls {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-block { width: 100%; }
    
    .map-interface {
      display: flex;
      flex: 1;
      background: white;
      border-radius: 0 0 8px 8px;
      overflow: hidden;
    }
    
    .map-sidebar {
      width: 280px;
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
      padding: 1rem;
      overflow-y: auto;
    }
    
    .layer-control, .legend, .search-panel {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .layer-control h3, .legend h3, .search-panel h3 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      color: #333;
    }
    
    .layer-item {
      margin-bottom: 0.75rem;
    }
    
    .layer-item label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
    }
    
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid #dee2e6;
    }
    
    .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      margin-bottom: 0.75rem;
      box-sizing: border-box;
    }
    
    .map-main {
      flex: 1;
      position: relative;
      display: flex;
      flex-direction: column;
    }
    
    .map-placeholder {
      flex: 1;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
    }
    
    .map-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: white;
      z-index: 10;
    }
    
    .map-content h3 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
    }
    
    .map-content p {
      margin: 0 0 1.5rem 0;
      opacity: 0.9;
    }
    
    .map-features {
      text-align: left;
      background: rgba(255,255,255,0.1);
      padding: 1rem;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }
    
    .feature-item {
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    
    .mock-parcels {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.7;
    }
    
    .mock-parcel {
      position: absolute;
      background: rgba(0, 123, 255, 0.6);
      border: 2px solid #007bff;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .mock-parcel:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    
    .mock-parcel.selected {
      background: rgba(255, 193, 7, 0.6);
      border-color: #ffc107;
      box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.3);
    }
    
    .mock-parcel.exempted {
      background: rgba(40, 167, 69, 0.6);
      border-color: #28a745;
    }
    
    .map-toolbar {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
    }
    
    .toolbar-group {
      display: flex;
      gap: 0.25rem;
    }
    
    .tool-btn {
      padding: 0.5rem 0.75rem;
      border: 1px solid #dee2e6;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    
    .tool-btn:hover {
      background: #e9ecef;
    }
    
    .tool-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
  `]
})
export class MapViewerComponent { }

const mapRoutes = [
  { path: '', component: MapViewerComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(mapRoutes),
    MapViewerComponent  // ✅ CORRECTION: Import du composant standalone
  ],
  declarations: []  // ✅ CORRECTION: Vide car le composant est standalone
})
export class MapModule { }