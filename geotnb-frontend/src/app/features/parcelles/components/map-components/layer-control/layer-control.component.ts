// =====================================================
// COMPOSANT CONTRÔLE COUCHES - GESTION LAYERS
// =====================================================

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

export interface MapLayer {
  id: string;
  name: string;
  type: 'base' | 'overlay' | 'data';
  visible: boolean;
  opacity: number;
  url?: string;
  data?: any;
}

@Component({
  selector: 'app-layer-control',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSliderModule,
    MatExpansionModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './layer-control.component.html',
  styleUrls: ['./layer-control.component.scss']
})
export class LayerControlComponent {
  @Input() baseLayers: MapLayer[] = [];
  @Input() overlayLayers: MapLayer[] = [];
  @Input() collapsed = false;

  @Output() layerToggle = new EventEmitter<string>();
  @Output() opacityChange = new EventEmitter<{layerId: string, opacity: number}>();
  @Output() layerReorder = new EventEmitter<{layerId: string, newIndex: number}>();

  // État du contrôle
  isExpanded = !this.collapsed;

  // =====================================================
  // GESTION DES COUCHES
  // =====================================================

  toggleLayer(layerId: string): void {
    this.layerToggle.emit(layerId);
  }

  onOpacityChange(layerId: string, event: any): void {
    const opacity = parseFloat(event.target?.value || event.value || 0);
    this.opacityChange.emit({ layerId, opacity });
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  getLayerIcon(layer: MapLayer): string {
    switch (layer.type) {
      case 'base':
        return 'map';
      case 'overlay':
        return 'layers';
      case 'data':
        return 'location_on';
      default:
        return 'layer';
    }
  }

  formatOpacity(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  /**
   * Active/désactive toutes les couches
   */
  toggleAllLayers(visible: boolean): void {
    const allLayers = [...this.baseLayers, ...this.overlayLayers];
    allLayers.forEach(layer => {
      if (layer.visible !== visible) {
        this.layerToggle.emit(layer.id);
      }
    });
  }

  // Getters
  get visibleBaseLayers(): MapLayer[] {
    return this.baseLayers.filter(layer => layer.visible);
  }

  get visibleOverlayLayers(): MapLayer[] {
    return this.overlayLayers.filter(layer => layer.visible);
  }

  get totalVisibleLayers(): number {
    return this.visibleBaseLayers.length + this.visibleOverlayLayers.length;
  }
}
