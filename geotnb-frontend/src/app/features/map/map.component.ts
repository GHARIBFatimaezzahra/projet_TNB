import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Map, View, Feature } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import { Select, Draw } from 'ol/interaction';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { MapService } from './services/map.service';
import { Parcelle } from '../../core/models/parcelle.interface';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  map!: Map;
  vectorLayer!: VectorLayer<VectorSource>;
  selectedParcelle: Parcelle | null = null;
  showParcelleInfo = false;
  showLayerControl = false;
  showSearchPanel = false;
  showDrawingTools = false;

  constructor(private mapService: MapService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMap();
    this.loadParcelles();
  }

  initMap(): void {
    // Créer la couche de base (OpenStreetMap)
    const osmLayer = new TileLayer({
      source: new OSM()
    });

    // Créer la source vectorielle pour les parcelles
    const vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: vectorSource,
      style: this.mapService.getParcelleStyle()
    });

    // Créer la carte
    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [osmLayer, this.vectorLayer],
      view: new View({
        center: fromLonLat([-1.9, 34.68]), // Coordonnées d'Oujda
        zoom: 12
      }),
      controls: defaultControls()
    });

    // Ajouter l'interaction de sélection
    const selectInteraction = new Select({
      layers: [this.vectorLayer]
    });

    selectInteraction.on('select', (event) => {
      const selectedFeatures = event.selected;
      if (selectedFeatures.length > 0) {
        const feature = selectedFeatures[0];
        const parcelleId = feature.get('id');
        this.onParcelleSelected(parcelleId);
      } else {
        this.selectedParcelle = null;
        this.showParcelleInfo = false;
      }
    });

    this.map.addInteraction(selectInteraction);
  }

  loadParcelles(): void {
    this.mapService.getParcelles().subscribe({
      next: (parcelles) => {
        this.addParcellesToMap(parcelles);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des parcelles:', error);
      }
    });
  }

  addParcellesToMap(parcelles: Parcelle[]): void {
    const format = new GeoJSON();
    const features: Feature<Geometry>[] = [];

    parcelles
      .filter(p => p.geometry)
      .forEach(parcelle => {
        try {
          const feature = format.readFeature(parcelle.geometry, {
            featureProjection: 'EPSG:3857'
          }) as Feature<Geometry>;
          
          feature.setProperties({
            id: parcelle.id,
            referenceFonciere: parcelle.referenceFonciere,
            montantTNB: parcelle.montantTotalTNB,
            zonage: parcelle.zonage,
            etatValidation: parcelle.etatValidation
          });
          
          features.push(feature);
        } catch (error) {
          console.error('Error parsing geometry for parcelle:', parcelle.id, error);
        }
      });

    this.vectorLayer.getSource()?.addFeatures(features);
  }

  onParcelleSelected(parcelleId: number): void {
    this.mapService.getParcelle(parcelleId).subscribe({
      next: (parcelle) => {
        this.selectedParcelle = parcelle;
        this.showParcelleInfo = true;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la parcelle:', error);
      }
    });
  }

  toggleLayerControl(): void {
    this.showLayerControl = !this.showLayerControl;
  }

  toggleSearchPanel(): void {
    this.showSearchPanel = !this.showSearchPanel;
  }

  toggleDrawingTools(): void {
    this.showDrawingTools = !this.showDrawingTools;
  }

  zoomToExtent(): void {
    const extent = this.vectorLayer.getSource()?.getExtent();
    if (extent) {
      this.map.getView().fit(extent, { padding: [50, 50, 50, 50] });
    }
  }
}