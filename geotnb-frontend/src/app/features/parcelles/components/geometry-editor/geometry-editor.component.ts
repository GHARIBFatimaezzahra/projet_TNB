import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-geometry-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="geometry-editor-container">
      <h2>Éditeur de Géométrie</h2>
      <p>Interface d'édition des géométries parcellaires</p>
    </div>
  `,
  styles: [`
    .geometry-editor-container {
      padding: 20px;
    }
  `]
})
export class GeometryEditorComponent implements OnInit {
  
  constructor() { }

  ngOnInit(): void {
  }
}





































