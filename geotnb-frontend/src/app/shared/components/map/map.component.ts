// =====================================================
// COMPOSANT CARTE OPENLAYERS POUR GEOTNB
// =====================================================

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MapService, ParcelleGeometry } from '../../../core/services/map.service';

export type MapTool = 'pan' | 'draw' | 'select' | 'modify';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonToggleModule
  ],
  template: `
    <div class="map-container">
      <!-- Barre d'outils -->
      <div class="map-toolbar">
        <mat-button-toggle-group [(value)]="activeTool" (change)="onToolChange()">
          <mat-button-toggle value="pan" matTooltip="Navigation">
            <mat-icon>pan_tool</mat-icon>
          </mat-button-toggle>
          
          <mat-button-toggle value="draw" matTooltip="Dessiner une parcelle">
            <mat-icon>gesture</mat-icon>
          </mat-button-toggle>
          
          <mat-button-toggle value="select" matTooltip="Sélectionner">
            <mat-icon>touch_app</mat-icon>
          </mat-button-toggle>
          
          <mat-button-toggle value="modify" matTooltip="Modifier">
            <mat-icon>edit</mat-icon>
          </mat-button-toggle>
        </mat-button-toggle-group>

        <div class="map-controls">
          <button mat-icon-button matTooltip="Effacer tout" (click)="clearAll()">
            <mat-icon>clear_all</mat-icon>
          </button>
          
          <button mat-icon-button matTooltip="Centrer sur Oujda" (click)="centerOnOujda()">
            <mat-icon>my_location</mat-icon>
          </button>
        </div>

        <div class="layer-controls">
          <mat-button-toggle-group multiple>
            <mat-button-toggle 
              [checked]="osmVisible" 
              (change)="toggleOSM()"
              matTooltip="Carte OpenStreetMap">
              OSM
            </mat-button-toggle>
            
            <mat-button-toggle 
              [checked]="orthophotoVisible" 
              (change)="toggleOrthophoto()"
              matTooltip="Vue satellite">
              Satellite
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>
      </div>

      <!-- Carte -->
      <div #mapElement class="map-element" [class.drawing]="activeTool === 'draw'"></div>

      <!-- Informations -->
      <div class="map-info" *ngIf="currentParcelle">
        <div class="info-card">
          <h4>
            <mat-icon>place</mat-icon>
            Parcelle sélectionnée
          </h4>
          <div class="info-details">
            <div class="info-item">
              <span class="label">Surface :</span>
              <span class="value">{{currentParcelle.surface | number:'1.0-2'}} m²</span>
            </div>
            <div class="info-item">
              <span class="label">Périmètre :</span>
              <span class="value">{{currentParcelle.perimeter | number:'1.0-2'}} m</span>
            </div>
            <div class="info-item">
              <span class="label">Points :</span>
              <span class="value">{{currentParcelle.coordinates.length}}</span>
            </div>
          </div>
          <div class="info-actions">
            <button mat-stroked-button color="primary" (click)="zoomToParcelle()">
              <mat-icon>zoom_in</mat-icon>
              Zoomer
            </button>
            <button mat-stroked-button color="warn" (click)="deleteParcelle()">
              <mat-icon>delete</mat-icon>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  // =====================================================
  // PROPRIÉTÉS
  // =====================================================

  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;
  
  @Input() height = '500px';
  @Input() initialParcelles: ParcelleGeometry[] = [];
  
  @Output() parcelleDrawn = new EventEmitter<ParcelleGeometry>();
  @Output() parcelleSelected = new EventEmitter<ParcelleGeometry | null>();
  @Output() parcelleModified = new EventEmitter<ParcelleGeometry>();

  activeTool: MapTool = 'pan';
  currentParcelle: ParcelleGeometry | null = null;
  osmVisible = true;
  orthophotoVisible = false;

  private destroy$ = new Subject<void>();

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(private mapService: MapService) {}

  // =====================================================
  // LIFECYCLE
  // =====================================================

  ngOnInit(): void {
    this.initializeMap();
    this.setupEventListeners();
    this.loadInitialParcelles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.mapService.destroy();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private initializeMap(): void {
    // Créer la carte avec l'élément DOM
    this.mapService.createMap(this.mapElement.nativeElement);
    
    // Définir la hauteur
    this.mapElement.nativeElement.style.height = this.height;
  }

  private setupEventListeners(): void {
    // Écouter les parcelles dessinées
    this.mapService.getParcelleDrawn()
      .pipe(takeUntil(this.destroy$))
      .subscribe(parcelle => {
        if (parcelle) {
          this.parcelleDrawn.emit(parcelle);
          this.currentParcelle = parcelle;
        }
      });

    // Écouter les parcelles sélectionnées
    this.mapService.getParcelleSelected()
      .pipe(takeUntil(this.destroy$))
      .subscribe(parcelle => {
        this.currentParcelle = parcelle;
        this.parcelleSelected.emit(parcelle);
      });
  }

  private loadInitialParcelles(): void {
    this.initialParcelles.forEach(parcelle => {
      this.mapService.addParcelle(parcelle);
    });
  }

  // =====================================================
  // OUTILS
  // =====================================================

  onToolChange(): void {
    switch (this.activeTool) {
      case 'pan':
        this.mapService.clearInteractions();
        break;
      case 'draw':
        this.mapService.activateDrawPolygon();
        break;
      case 'select':
        this.mapService.activateSelect();
        break;
      case 'modify':
        this.mapService.activateModify();
        break;
    }
  }

  // =====================================================
  // CONTRÔLES
  // =====================================================

  clearAll(): void {
    this.mapService.clearParcelles();
    this.currentParcelle = null;
    this.parcelleSelected.emit(null);
  }

  centerOnOujda(): void {
    // Recentrer sur Oujda - sera implémenté dans le service
    console.log('Recentrage sur Oujda');
  }

  toggleOSM(): void {
    this.osmVisible = !this.osmVisible;
    this.mapService.toggleOSM(this.osmVisible);
  }

  toggleOrthophoto(): void {
    this.orthophotoVisible = !this.orthophotoVisible;
    this.mapService.toggleOrthophoto(this.orthophotoVisible);
  }

  // =====================================================
  // ACTIONS PARCELLE
  // =====================================================

  zoomToParcelle(): void {
    if (this.currentParcelle?.id) {
      this.mapService.zoomToParcelle(this.currentParcelle.id);
    }
  }

  deleteParcelle(): void {
    if (this.currentParcelle?.id) {
      this.mapService.removeParcelle(this.currentParcelle.id);
      this.currentParcelle = null;
      this.parcelleSelected.emit(null);
    }
  }

  // =====================================================
  // MÉTHODES PUBLIQUES
  // =====================================================

  addParcelle(parcelle: ParcelleGeometry): void {
    this.mapService.addParcelle(parcelle);
  }

  removeParcelle(id: number): void {
    this.mapService.removeParcelle(id);
  }

  setActiveTool(tool: MapTool): void {
    this.activeTool = tool;
    this.onToolChange();
  }
}
