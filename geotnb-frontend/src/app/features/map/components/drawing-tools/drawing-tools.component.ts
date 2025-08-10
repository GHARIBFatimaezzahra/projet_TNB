import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-drawing-tools',
  templateUrl: './drawing-tools.component.html',
  styleUrls: ['./drawing-tools.component.scss']
})
export class DrawingToolsComponent {
  @Output() close = new EventEmitter<void>();
  @Output() toolSelected = new EventEmitter<string>();

  activeeTool: string = '';

  onClose(): void {
    this.close.emit();
  }

  selectTool(tool: string): void {
    this.activeeTool = tool;
    this.toolSelected.emit(tool);
  }

  isToolActive(tool: string): boolean {
    return this.activeeTool === tool;
  }
}