import { Component } from '@angular/core';

@Component({
  selector: 'app-import-data',
  template: `
    <div class="import-data">
      <div class="page-header">
        <h1>Import de Données</h1>
        <p>Importer des données SIG (Shapefile, GeoJSON, etc.)</p>
      </div>
      <div class="content-placeholder">
        <i class="fas fa-upload"></i>
        <h3>Module d'Import</h3>
        <p>Cette fonctionnalité sera développée prochainement.</p>
      </div>
    </div>
  `,
  styleUrls: ['./import-data.component.scss']
})
export class ImportDataComponent {
  onFileSelected(event: any): void {
    console.log('File selected:', event.target.files);
  }
}