// =====================================================
// COMPOSANT OUTILS DE DESSIN - ÉDITION GÉOMÉTRIQUE
// =====================================================

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';

export interface DrawingTool {
  id: string;
  name: string;
  icon: string;
  tooltip: string;
  shortcut?: string;
  category: 'shape' | 'edit' | 'measure' | 'utility';
}

@Component({
  selector: 'app-drawing-tools',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule
  ],
  templateUrl: './drawing-tools.component.html',
  styleUrls: ['./drawing-tools.component.scss']
})
export class DrawingToolsComponent {
  @Input() enabled = false;
  @Input() selectedTool = '';
  @Input() compact = false;

  @Output() toolSelect = new EventEmitter<string>();
  @Output() drawingDisable = new EventEmitter<void>();
  @Output() geometryAction = new EventEmitter<{action: string, data?: any}>();

  // Outils disponibles
  drawingTools: DrawingTool[] = [
    // Formes de base
    {
      id: 'point',
      name: 'Point',
      icon: 'place',
      tooltip: 'Dessiner un point',
      shortcut: 'P',
      category: 'shape'
    },
    {
      id: 'polygon',
      name: 'Polygone',
      icon: 'crop_free',
      tooltip: 'Dessiner un polygone',
      shortcut: 'G',
      category: 'shape'
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      icon: 'crop_din',
      tooltip: 'Dessiner un rectangle',
      shortcut: 'R',
      category: 'shape'
    },
    {
      id: 'circle',
      name: 'Cercle',
      icon: 'radio_button_unchecked',
      tooltip: 'Dessiner un cercle',
      shortcut: 'C',
      category: 'shape'
    },
    {
      id: 'line',
      name: 'Ligne',
      icon: 'timeline',
      tooltip: 'Dessiner une ligne',
      shortcut: 'L',
      category: 'shape'
    },

    // Outils d'édition
    {
      id: 'select',
      name: 'Sélection',
      icon: 'near_me',
      tooltip: 'Sélectionner et déplacer',
      shortcut: 'S',
      category: 'edit'
    },
    {
      id: 'modify',
      name: 'Modifier',
      icon: 'edit_location',
      tooltip: 'Modifier les points',
      shortcut: 'M',
      category: 'edit'
    },
    {
      id: 'delete',
      name: 'Supprimer',
      icon: 'delete_forever',
      tooltip: 'Supprimer une géométrie',
      shortcut: 'Del',
      category: 'edit'
    },

    // Outils de mesure
    {
      id: 'measure_length',
      name: 'Mesurer distance',
      icon: 'straighten',
      tooltip: 'Mesurer une distance',
      shortcut: 'D',
      category: 'measure'
    },
    {
      id: 'measure_area',
      name: 'Mesurer surface',
      icon: 'square_foot',
      tooltip: 'Mesurer une surface',
      shortcut: 'A',
      category: 'measure'
    },

    // Utilitaires
    {
      id: 'snap',
      name: 'Accrochage',
      icon: 'grid_on',
      tooltip: 'Activer l\'accrochage',
      shortcut: 'N',
      category: 'utility'
    }
  ];

  // État des outils
  snapEnabled = false;
  measurementMode = false;

  // =====================================================
  // GESTION DES OUTILS
  // =====================================================

  selectTool(toolId: string): void {
    if (!this.enabled && toolId !== 'select') return;

    // Gérer les outils spéciaux
    if (toolId === 'snap') {
      this.toggleSnap();
      return;
    }

    if (toolId === 'delete') {
      this.deleteSelected();
      return;
    }

    // Sélectionner l'outil
    this.selectedTool = toolId;
    this.toolSelect.emit(toolId);

    // Gérer les modes de mesure
    this.measurementMode = toolId.startsWith('measure_');
  }

  disableDrawing(): void {
    this.selectedTool = '';
    this.measurementMode = false;
    this.drawingDisable.emit();
  }

  // =====================================================
  // ACTIONS SPÉCIALES
  // =====================================================

  toggleSnap(): void {
    this.snapEnabled = !this.snapEnabled;
    this.geometryAction.emit({
      action: 'toggle_snap',
      data: { enabled: this.snapEnabled }
    });
  }

  deleteSelected(): void {
    this.geometryAction.emit({ action: 'delete_selected' });
  }

  clearAll(): void {
    this.geometryAction.emit({ action: 'clear_all' });
  }

  undoLastAction(): void {
    this.geometryAction.emit({ action: 'undo' });
  }

  redoLastAction(): void {
    this.geometryAction.emit({ action: 'redo' });
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  getToolsByCategory(category: string): DrawingTool[] {
    return this.drawingTools.filter(tool => tool.category === category);
  }

  isToolSelected(toolId: string): boolean {
    return this.selectedTool === toolId;
  }

  isToolEnabled(toolId: string): boolean {
    if (toolId === 'select') return true;
    if (toolId === 'snap') return true;
    return this.enabled;
  }

  getTooltipText(tool: DrawingTool): string {
    let tooltip = tool.tooltip;
    if (tool.shortcut) {
      tooltip += ` (${tool.shortcut})`;
    }
    return tooltip;
  }

  // Getters pour le template
  get shapeTools(): DrawingTool[] {
    return this.getToolsByCategory('shape');
  }

  get editTools(): DrawingTool[] {
    return this.getToolsByCategory('edit');
  }

  get measureTools(): DrawingTool[] {
    return this.getToolsByCategory('measure');
  }

  get utilityTools(): DrawingTool[] {
    return this.getToolsByCategory('utility');
  }

  get hasSelectedTool(): boolean {
    return this.selectedTool !== '';
  }

  // Méthodes pour le template
  getSelectedToolIcon(): string {
    const tool = this.drawingTools.find(t => t.id === this.selectedTool);
    return tool?.icon || 'edit';
  }

  getSelectedToolName(): string {
    const tool = this.drawingTools.find(t => t.id === this.selectedTool);
    return tool?.name || 'Outil';
  }
}
