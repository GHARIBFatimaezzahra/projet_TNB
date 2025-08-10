import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-map-toolbar',
  templateUrl: './map-toolbar.component.html',
  styleUrls: ['./map-toolbar.component.scss']
})
export class MapToolbarComponent {
  @Output() layerControlToggle = new EventEmitter<void>();
  @Output() searchToggle = new EventEmitter<void>();
  @Output() drawingToggle = new EventEmitter<void>();
  @Output() zoomToExtent = new EventEmitter<void>();

  onLayerControlToggle(): void {
    this.layerControlToggle.emit();
  }

  onSearchToggle(): void {
    this.searchToggle.emit();
  }

  onDrawingToggle(): void {
    this.drawingToggle.emit();
  }

  onZoomToExtent(): void {
    this.zoomToExtent.emit();
  }

  onMeasure(): void {
    // TODO: Implement measure tool
  }

  onExport(): void {
    // TODO: Implement export functionality
  }
}