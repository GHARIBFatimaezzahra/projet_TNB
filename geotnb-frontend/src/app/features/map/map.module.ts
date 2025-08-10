import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MapRoutingModule } from './map-routing.module';

import { MapComponent } from './map.component';
import { MapToolbarComponent } from './components/map-toolbar/map-toolbar.component';
import { LayerControlComponent } from './components/layer-control/layer-control.component';
import { ParcelleInfoComponent } from './components/parcelle-info/parcelle-info.component';
import { SearchPanelComponent } from './components/search-panel/search-panel.component';
import { DrawingToolsComponent } from './components/drawing-tools/drawing-tools.component';

@NgModule({
  declarations: [
    MapComponent,
    MapToolbarComponent,
    LayerControlComponent,
    ParcelleInfoComponent,
    SearchPanelComponent,
    DrawingToolsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MapRoutingModule
  ]
})
export class MapModule { }