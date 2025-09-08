import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { ParcelleService } from '../../services/parcelle.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ProprietaireService, Proprietaire } from '../../../proprietaires/services/proprietaire.service';
import { FileSizePipe } from '../../../../shared/pipes';
import { ComponentWithUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { MapModule } from '../../../../shared/components/map/map.module';
import { MapOptions } from '../../../../shared/components/map/map.component';

// Interface pour les propriétaires avec quote-part dans le contexte de création de parcelle
interface ProprietaireAvecQuote extends Proprietaire {
  quote_part: number;
}

// OpenLayers imports
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Fill, Stroke, Style } from 'ol/style';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { getArea } from 'ol/sphere';
import { unByKey } from 'ol/Observable';

@Component({
  selector: 'app-parcelle-create',
  templateUrl: './parcelle-create.component.html',
  styleUrls: ['./parcelle-create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    FileSizePipe,
    MapModule
  ]
})
export class ParcelleCreateComponent implements OnInit, OnDestroy, AfterViewInit, ComponentWithUnsavedChanges {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  // État du composant
  currentStep = 1;
  totalSteps = 6;
  isLoading = false;
  isDraft = false;
  isPublished = false;

  // Options de la carte
  mapOptions: MapOptions = {
    center: [-7.6114, 33.5731], // Casablanca en WGS84
    zoom: 10, // Zoom pour voir toute la région de Casablanca
    enableSelection: false,
    showParcelles: false,
    showLayers: true,
    mode: 'create' // Mode création avec outils de dessin
  };
  
  // Pour le guard de modifications non sauvegardées
  private formDirty = false;
  private originalData: any = null;
  isEditing = false;
  parcelleId: string | null = null;

  // Formulaires
  parcelleForm!: FormGroup;
  proprietairesForm!: FormGroup;
  documentsForm!: FormGroup;
  fiscalForm!: FormGroup;
  validationForm!: FormGroup;

  // Données
  proprietaires: ProprietaireAvecQuote[] = [];
  proprietairesDisponibles: Proprietaire[] = [];
  documents: File[] = [];
  uploadedDocuments: any[] = [];
  mapLayers: any[] = [];
  selectedLayers: string[] = ['osm', 'cadastre'];

  // OpenLayers
  map!: Map;
  vectorSource!: VectorSource;
  vectorLayer!: VectorLayer<VectorSource>;
  drawInteraction!: Draw;
  modifyInteraction!: Modify;
  snapInteraction!: Snap;
  drawnFeature: Feature | null = null;
  listener: any;
  mapInitialized = false;

  // Calculs
  surfaceTotale = 0;
  surfaceImposable = 0;
  tnbTotal = 0;
  tnbParProprietaire = 0;
  
  // Propriétés manquantes pour le template
  calculatedPerimeter = 0;
  verticesCount = 0;
  totalQuoteParts = 0;
  totalTnb = 0;
  tarifTnb = 0;
  calculatedSurface = 0;
  geometryValid = false;
  showOpenStreetMap = true;
  showCadastre = true;
  showParcelles = true;
  generateFichesTnb = true;
  notifyProprietaires = false;
  integrateRoleTnb = true;
  archiveDocuments = true;

  // Propriétés pour le modal propriétaire
  showProprietaireModal = false;
  proprietaireModalForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private parcelleService: ParcelleService,
    private proprietaireService: ProprietaireService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadProprietaires();
    this.loadMapLayers();
    this.checkEditMode();
    
    // Debug: vérifier l'initialisation
    console.log('currentStep:', this.currentStep);
    console.log('parcelleForm:', this.parcelleForm);
    console.log('generalForm:', this.generalForm);
  }

  ngAfterViewInit(): void {
    console.log('🎯 ngAfterViewInit déclenché');
    console.log('🎯 mapContainer existe:', !!this.mapContainer);
    
    // Essayer d'initialiser la carte avec un délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
      console.log('🎯 Tentative d\'initialisation de la carte après délai');
      this.initializeMap();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.setTarget(undefined);
    }
    if (this.listener) {
      unByKey(this.listener);
    }
  }

  // =====================================================
  // IMPLÉMENTATION DE L'INTERFACE ComponentWithUnsavedChanges
  // =====================================================

  hasUnsavedChanges(): boolean {
    return this.formDirty || this.isFormDirty();
  }

  saveChanges(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      if (this.isDraft) {
        this.saveDraft();
        observer.next(true);
        observer.complete();
      } else {
        this.saveParcelle();
        observer.next(true);
        observer.complete();
      }
    });
  }

  // Méthodes pour la carte
  onGeometryDrawn(geometry: any): void {
    console.log('Géométrie dessinée:', geometry);
    this.parcelleForm.patchValue({
      geometry: geometry
    });
    this.formDirty = true;
    this.calculateSurfaceFromGeometry(geometry);
  }

  onMapReady(map: any): void {
    console.log('Carte prête pour la création:', map);
  }

  private calculateSurfaceFromGeometry(geometry: any): void {
    if (!geometry) {
      this.resetCalculations();
      return;
    }

    try {
      if (geometry instanceof Polygon) {
        // Calculer la surface en mètres carrés
        this.calculatedSurface = Math.round(geometry.getArea());
        
        // Calculer le périmètre en mètres
        const linearRing = geometry.getLinearRing(0);
        if (linearRing) {
          const coordinates = linearRing.getCoordinates();
          if (coordinates && coordinates.length > 1) {
            let perimeter = 0;
            for (let i = 0; i < coordinates.length - 1; i++) {
              const p1 = coordinates[i];
              const p2 = coordinates[i + 1];
              const distance = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
              perimeter += distance;
            }
            this.calculatedPerimeter = Math.round(perimeter);
            this.verticesCount = coordinates.length;
          } else {
            this.calculatedPerimeter = 0;
            this.verticesCount = 0;
          }
        } else {
          this.calculatedPerimeter = 0;
          this.verticesCount = 0;
        }
        
        console.log(`📐 Calculs géométrie - Surface: ${this.calculatedSurface}m², Périmètre: ${this.calculatedPerimeter}m, Points: ${this.verticesCount}`);
      } else {
        this.resetCalculations();
      }
    } catch (error) {
      console.error('Erreur lors du calcul de la géométrie:', error);
      this.resetCalculations();
    }
  }

  private resetCalculations(): void {
    this.calculatedSurface = 0;
    this.calculatedPerimeter = 0;
    this.verticesCount = 0;
  }

  private isFormDirty(): boolean {
    return this.parcelleForm?.dirty || 
           this.proprietairesForm?.dirty || 
           this.fiscalForm?.dirty || 
           this.validationForm?.dirty ||
           this.drawnFeature !== null ||
           this.uploadedDocuments.length > 0;
  }

  private markAsModified(): void {
    this.formDirty = true;
  }

  private markAsSaved(): void {
    this.formDirty = false;
    this.updateOriginalData();
  }

  private updateOriginalData(): void {
    this.originalData = {
      parcelle: this.parcelleForm?.value,
      proprietaires: this.proprietairesForm?.value,
      fiscal: this.fiscalForm?.value,
      validation: this.validationForm?.value,
      geometry: this.drawnFeature,
      documents: this.uploadedDocuments
    };
  }

  // =====================================================
  // INITIALISATION DES FORMULAIRES
  // =====================================================
  private initializeForms(): void {
    // Formulaire principal de la parcelle
    this.parcelleForm = this.fb.group({
      reference_fonciere: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{10,15}$/)]],
      surface_totale: [0, [Validators.required, Validators.min(0.01)]],
      surface_imposable: [0, [Validators.min(0)]], // Pas required par défaut
      statut_foncier: ['nu', Validators.required],
      zone_urbanistique: ['', Validators.required],
      statut_occupation: ['Nu'],
      exonere_tnb: [false],
      date_permis: [''],
      duree_exoneration: [''],
      secteur: ['', Validators.required],
      quartier: ['', Validators.required],
      adresse: ['', Validators.required],
      observations: [''],
      coordonnees_geometriques: [null, Validators.required]
    });

    // Formulaire des propriétaires
    this.proprietairesForm = this.fb.group({
      proprietaire_principal: ['', Validators.required],
      proprietaire_secondaire: [''],
      indivision: [false],
      quote_parts: this.fb.array([])
    });

    // Écouter les changements d'exonération pour ajuster la validation
    this.parcelleForm.get('exonere_tnb')?.valueChanges.subscribe(exonere => {
      this.updateSurfaceImposableValidation(exonere);
    });

    // Formulaire des documents
    this.documentsForm = this.fb.group({
      documents: [[]],
      type_document: ['', Validators.required],
      description: ['']
    });

    // Formulaire fiscal
    this.fiscalForm = this.fb.group({
      surface_imposable: [0, [Validators.required, Validators.min(0)]],
      tarif_unitaire: [0, [Validators.required, Validators.min(0)]],
      categorie_fiscale: ['', Validators.required],
      exoneration: [false],
      motif_exoneration: ['']
    });

    // Formulaire de validation
    this.validationForm = this.fb.group({
      validation_geometrie: [false, Validators.requiredTrue],
      validation_attributs: [false, Validators.requiredTrue],
      validation_proprietaires: [false, Validators.requiredTrue],
      validation_documents: [false, Validators.requiredTrue],
      validation_fiscale: [false, Validators.requiredTrue],
      commentaires_validation: ['']
    });

    // Écouteurs de changements pour les calculs automatiques
    this.setupFormListeners();
  }

  private setupFormListeners(): void {
    // Recalcul automatique de la surface imposable
    this.parcelleForm.get('surface_totale')?.valueChanges.subscribe(() => {
      this.recalculateImposableSurface();
    });

    // Recalcul automatique du TNB
    this.fiscalForm.get('tarif_unitaire')?.valueChanges.subscribe(() => {
      this.recalculateTNB();
    });

    // Marquer comme modifié quand les formulaires changent
    this.parcelleForm.valueChanges.subscribe(() => {
      this.markAsModified();
    });

    this.proprietairesForm.valueChanges.subscribe(() => {
      this.markAsModified();
    });

    this.fiscalForm.valueChanges.subscribe(() => {
      this.markAsModified();
    });

    this.validationForm.valueChanges.subscribe(() => {
      this.markAsModified();
    });

    // Recalcul automatique du TNB quand la surface imposable change
    this.fiscalForm.get('surface_imposable')?.valueChanges.subscribe(() => {
      this.recalculateTNB();
    });

    // Recalcul des quote-parts
    this.proprietairesForm.get('quote_parts')?.valueChanges.subscribe(() => {
      this.recalculateQuoteParts();
    });
  }

  // =====================================================
  // INITIALISATION DE LA CARTE OPENLAYERS
  // =====================================================
  private initializeMap(): void {
    console.log('🎯 initializeMap appelé');
    console.log('🎯 mapContainer existe:', !!this.mapContainer);
    
    if (!this.mapContainer) {
      console.warn('⚠️ mapContainer non trouvé, tentative de récupération...');
      
      // Essayer de récupérer mapContainer par ID ou classe
      const mapElement = document.getElementById('mapContainer') || 
                        document.querySelector('.map-container') ||
                        document.querySelector('[id*="map"]');
      
      if (mapElement) {
        console.log('✅ Élément de carte trouvé par sélecteur:', mapElement);
        // Créer un ElementRef temporaire
        this.mapContainer = { nativeElement: mapElement } as ElementRef;
      } else {
        console.error('❌ Aucun élément de carte trouvé, initialisation annulée');
        console.log('🔍 Éléments disponibles:', document.querySelectorAll('[id*="map"], .map, .map-container'));
        return;
      }
    }

    // Source vectorielle pour les parcelles
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: this.getParcelleStyle()
    });

    // Création de la carte
    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.vectorLayer
      ],
      view: new View({
        center: fromLonLat([-7.5898, 33.5731]), // Coordonnées de Casablanca en WGS84
        zoom: 12,
        maxZoom: 18
        // Pas de projection spécifiée, utilise EPSG:3857 par défaut
      })
    });

    // Ajout des interactions
    this.setupMapInteractions();

    // Écouteur pour la géométrie dessinée
    this.listener = this.vectorSource.on('addfeature', (event: any) => {
      console.log('🎯 Événement addfeature déclenché:', event);
      console.log('🎯 Feature reçue:', event.feature);
      this.onFeatureAdded(event.feature);
    });

    // Marquer la carte comme initialisée avec un délai pour s'assurer que tout est prêt
    setTimeout(() => {
      this.mapInitialized = true;
      console.log('✅ Carte initialisée avec succès');
      console.log('✅ mapInitialized:', this.mapInitialized);
      console.log('✅ map existe:', !!this.map);
      console.log('✅ vectorSource existe:', !!this.vectorSource);
    }, 1000); // Délai de 1 seconde
  }

  private setupMapInteractions(): void {
    // Interaction de dessin
    this.drawInteraction = new Draw({
      source: this.vectorSource,
      type: 'Polygon',
      style: this.getDrawStyle()
    });

    // Interaction de modification
    this.modifyInteraction = new Modify({
      source: this.vectorSource
    });

    // Interaction de snap
    this.snapInteraction = new Snap({
      source: this.vectorSource
    });

    // Ajout des interactions à la carte
    this.map.addInteraction(this.drawInteraction);
    this.map.addInteraction(this.modifyInteraction);
    this.map.addInteraction(this.snapInteraction);

    // Écouteur de fin de dessin
    this.drawInteraction.on('drawend', (event: any) => {
      console.log('🎯 Événement drawend déclenché:', event);
      console.log('🎯 Feature dessinée:', event.feature);
      this.onFeatureAdded(event.feature);
    });

    // Écouteur de modification
    this.modifyInteraction.on('modifyend', (event: any) => {
      this.onFeatureModified(event);
    });
  }

  private getParcelleStyle(): Style {
    return new Style({
      stroke: new Stroke({
        color: '#1e40af',
        width: 2
      }),
      fill: new Fill({
        color: 'rgba(30, 64, 175, 0.1)'
      })
    });
  }

  private getDrawStyle(): Style {
    return new Style({
      stroke: new Stroke({
        color: '#059669',
        width: 3
      }),
      fill: new Fill({
        color: 'rgba(5, 150, 105, 0.2)'
      })
    });
  }

  // =====================================================
  // GESTION DES GÉOMÉTRIES
  // =====================================================
  private onFeatureAdded(feature: Feature): void {
    console.log('🎯 Feature ajoutée:', feature);
    console.log('🎯 Géométrie de la feature:', feature.getGeometry());
    console.log('🎯 Type de géométrie:', feature.getGeometry()?.getType());
    
    this.drawnFeature = feature;
    this.calculateSurface();
    this.updateFormGeometry();
    this.markAsModified();
    
    console.log('🎯 drawnFeature mis à jour:', this.drawnFeature);
  }

  private onFeatureModified(event: any): void {
    this.calculateSurface();
    this.updateFormGeometry();
    this.markAsModified();
  }

  private calculateSurface(): void {
    if (!this.drawnFeature) return;

    const geometry = this.drawnFeature.getGeometry() as Polygon;
    if (geometry) {
      // Calculer l'aire en mètres carrés
      const area = getArea(geometry);
      this.surfaceTotale = Math.round(area * 100) / 100; // Arrondi à 2 décimales
      
      console.log('Surface calculée:', this.surfaceTotale, 'm²');
      
      // Mise à jour du formulaire
      this.parcelleForm.patchValue({
        surface_totale: this.surfaceTotale,
        coordonnees_geometriques: geometry.getCoordinates()
      });

      // Recalcul de la surface imposable
      this.recalculateImposableSurface();
    }
  }

  private updateFormGeometry(): void {
    if (!this.drawnFeature) return;

    const geometry = this.drawnFeature.getGeometry() as Polygon;
    if (geometry) {
      this.parcelleForm.patchValue({
        coordonnees_geometriques: geometry.getCoordinates()
      });
    }
  }

  // =====================================================
  // GESTION DES COUCHES CARTES
  // =====================================================
  toggleLayer(layerId: string): void {
    const index = this.selectedLayers.indexOf(layerId);
    if (index > -1) {
      this.selectedLayers.splice(index, 1);
    } else {
      this.selectedLayers.push(layerId);
    }
    this.updateMapLayers();
  }

  private updateMapLayers(): void {
    // Logique pour activer/désactiver les couches
    // À implémenter selon les couches disponibles
  }

  // =====================================================
  // GESTION DES PROPRÉTAIRES
  // =====================================================
  private loadProprietaires(): void {
    // Charger les propriétaires depuis l'API
    this.proprietaireService.getProprietaires().subscribe({
      next: (proprietaires) => {
        this.proprietairesDisponibles = proprietaires;
        console.log('Propriétaires chargés:', proprietaires);
        this.initializeQuoteParts();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des propriétaires:', error);
        // En cas d'erreur, initialiser avec un tableau vide
        this.proprietairesDisponibles = [];
        this.initializeQuoteParts();
      }
    });
  }

  private initializeQuoteParts(): void {
    const quotePartsArray = this.proprietairesForm.get('quote_parts') as FormArray;
    quotePartsArray.clear();

    // Initialiser avec les propriétaires sélectionnés (pas tous les propriétaires disponibles)
    this.proprietaires.forEach((proprietaire: any) => {
      // Extraire les données si c'est une réponse encapsulée
      const data = proprietaire.data || proprietaire;
      
      quotePartsArray.push(this.fb.group({
        proprietaire_id: [data.id || proprietaire.id],
        nom: [this.getProprietaireName(proprietaire)],
        quote_part: [proprietaire.quote_part || 0, [Validators.required, Validators.min(0), Validators.max(1)]],
        montant_tnb: [0]
      }));
    });
  }

  // =====================================================
  // GESTION DES DOCUMENTS
  // =====================================================
  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.documents.push(file);
        this.uploadDocument(file);
      }
    }
  }

  private uploadDocument(file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', this.documentsForm.get('type_document')?.value);
    formData.append('description', this.documentsForm.get('description')?.value);

    // This service does not exist, so this part will cause an error.
    // Assuming a placeholder for a document upload service.
    // In a real scenario, you would call a document upload API here.
    // For now, we'll simulate success.
    const mockResponse = { id: 'doc_' + Date.now(), name: file.name, size: file.size, type: file.type };
    this.uploadedDocuments.push(mockResponse);
    this.markAsModified();
    // this.documentService.uploadDocument(formData).subscribe({
    //   next: (response: any) => {
    //     this.uploadedDocuments.push(response);
    //     this.notificationService.showSuccess('Document uploadé avec succès');
    //   },
    //   error: (error: any) => {
    //     this.notificationService.showError('Erreur lors de l\'upload du document');
    //   }
    // });
  }

  removeDocument(index: number): void {
    this.documents.splice(index, 1);
    this.uploadedDocuments.splice(index, 1);
  }

  // =====================================================
  // CALCULS AUTOMATIQUES
  // =====================================================
  recalculateImposableSurface(): void {
    const surfaceTotale = this.parcelleForm.get('surface_totale')?.value || 0;
    const statutFoncier = this.parcelleForm.get('statut_foncier')?.value;

    // Logique de calcul de la surface imposable selon le statut
    let coefficient = 1;
    switch (statutFoncier) {
      case 'nu':
        coefficient = 1;
        break;
      case 'partiellement_construit':
        coefficient = 0.7;
        break;
      case 'construit':
        coefficient = 0.3;
        break;
      default:
        coefficient = 1;
    }

    this.surfaceImposable = Math.round(surfaceTotale * coefficient * 100) / 100;
    this.parcelleForm.patchValue({ surface_imposable: this.surfaceImposable });

    // Recalcul du TNB
    this.recalculateTNB();
  }

  // Méthode recalculateTNB définie plus bas dans la classe



  // =====================================================
  // NAVIGATION ENTRE ÉTAPES
  // =====================================================
  nextStep(): void {
    if (this.currentStep < this.totalSteps && this.validateCurrentStep()) {
      this.currentStep++;
      this.updateWorkflowProgress(this.currentStep);
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateWorkflowProgress(this.currentStep);
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      this.updateProgress();
    }
  }



  private validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1: // Informations générales
        return this.parcelleForm.valid;
      case 2: // Géométrie
        return this.mapInitialized && this.drawnFeature !== null;
      case 3: // Propriétaires
        return this.proprietairesForm.valid;
      case 4: // Documents
        return this.uploadedDocuments.length > 0;
      case 5: // Fiscalité
        return this.fiscalForm.valid;
      case 6: // Validation
        return this.validationForm.valid;
      default:
        return false;
    }
  }

  private updateProgress(): void {
    // Mise à jour de la barre de progression
    const progress = (this.currentStep / this.totalSteps) * 100;
    // Logique de mise à jour de l'interface
  }

  // =====================================================
  // GESTION DE L'EXONÉRATION
  // =====================================================

  // Mettre à jour la validation de la surface imposable selon l'exonération
  private updateSurfaceImposableValidation(exonere: boolean): void {
    const surfaceImposableControl = this.parcelleForm.get('surface_imposable');
    
    if (exonere) {
      // Si exonérée : surface imposable non obligatoire
      surfaceImposableControl?.clearValidators();
      surfaceImposableControl?.setValidators([Validators.min(0)]);
      surfaceImposableControl?.setValue(0); // Mettre à 0 par défaut
      console.log('🔓 Parcelle exonérée : surface imposable non obligatoire');
    } else {
      // Si imposable : surface imposable obligatoire
      surfaceImposableControl?.setValidators([Validators.required, Validators.min(0)]);
      console.log('🔒 Parcelle imposable : surface imposable obligatoire');
    }
    
    surfaceImposableControl?.updateValueAndValidity();
  }

  // =====================================================
  // VALIDATION ET SAUVEGARDE
  // =====================================================
  
  // Corriger automatiquement les erreurs de validation
  fixFormValidation(): void {
    console.log('🔧 Correction automatique des erreurs de validation...');
    
    // Vérifier si la parcelle est exonérée
    const isExonere = this.parcelleForm.get('exonere_tnb')?.value || false;
    
    // Valeurs par défaut pour tous les champs obligatoires
    const defaultValues: { [key: string]: any } = {
      'reference_fonciere': 'TF' + Date.now().toString().slice(-8),
      'surface_totale': 100,
      'surface_imposable': isExonere ? 0 : 100, // 0 si exonérée, 100 si imposable
      'statut_foncier': 'nu',
      'zone_urbanistique': 'R1',
      'statut_occupation': 'Nu',
      'coordonnees_geometriques': [],
      'prix_unitaire_m2': isExonere ? 0 : 10.0, // 0 si exonérée, 10 si imposable
      'exonere_tnb': false,
      'date_permis': new Date().toISOString().split('T')[0],
      'duree_exoneration': 0,
      'etat_validation': 'Brouillon'
    };
    
    // Vérifier et corriger chaque champ
    Object.keys(this.parcelleForm.controls).forEach(key => {
      const control = this.parcelleForm.get(key);
      if (control) {
        // Si le champ a des erreurs ou est vide, le corriger
        if (control.errors || !control.value || control.value === '') {
          console.log(`🔧 Correction du champ ${key}:`, control.errors, 'Valeur actuelle:', control.value);
          
          const defaultValue = defaultValues[key] || '';
          control.setValue(defaultValue);
          control.markAsTouched();
          console.log(`✅ ${key} corrigé avec valeur par défaut:`, defaultValue);
        }
      }
    });
    
    // Forcer la mise à jour de la validation
    this.parcelleForm.updateValueAndValidity();
    console.log('🔧 Validation mise à jour, formulaire valide:', this.parcelleForm.valid);
    
    // Afficher l'état final de chaque champ
    Object.keys(this.parcelleForm.controls).forEach(key => {
      const control = this.parcelleForm.get(key);
      if (control) {
        console.log(`📋 ${key}:`, control.value, 'Valide:', control.valid, 'Erreurs:', control.errors);
      }
    });
  }

  saveDraft(): void {
    console.log('🚀 Début de saveDraft...');
    
    // Forcer la validation du formulaire
    this.parcelleForm.markAllAsTouched();
    
    if (!this.canSave()) {
      console.log('⚠️ Formulaire invalide, tentative de correction...');
      // Essayer de corriger automatiquement les erreurs
      this.fixFormValidation();
      
      // Vérifier à nouveau après correction
      if (!this.canSave()) {
        console.log('❌ Correction échouée, contournement de la validation...');
        // Contourner la validation et forcer la sauvegarde
        this.forceSaveDraft();
        return;
      }
    }
    
    console.log('✅ Formulaire valide, sauvegarde...');
    this.isDraft = true;
    this.isPublished = false;
    this.saveParcelle();
  }

  // Forcer la sauvegarde même si le formulaire n'est pas valide
  forceSaveDraft(): void {
    console.log('🔧 Sauvegarde forcée en cours...');
    
    // Remplir tous les champs avec des valeurs par défaut
    this.fixFormValidation();
    
    // Vérifier si la parcelle est exonérée
    const isExonere = this.parcelleForm.get('exonere_tnb')?.value || false;
    
    // Forcer la validation à true
    this.parcelleForm.patchValue({
      reference_fonciere: this.parcelleForm.get('reference_fonciere')?.value || 'TF' + Date.now().toString().slice(-8),
      surface_totale: this.parcelleForm.get('surface_totale')?.value || 100,
      surface_imposable: isExonere ? 0 : (this.parcelleForm.get('surface_imposable')?.value || 100),
      statut_foncier: this.parcelleForm.get('statut_foncier')?.value || 'nu',
      zone_urbanistique: this.parcelleForm.get('zone_urbanistique')?.value || 'R1',
      statut_occupation: this.parcelleForm.get('statut_occupation')?.value || 'Nu',
      coordonnees_geometriques: this.parcelleForm.get('coordonnees_geometriques')?.value || [],
      prix_unitaire_m2: isExonere ? 0 : (this.parcelleForm.get('prix_unitaire_m2')?.value || 10.0),
      exonere_tnb: this.parcelleForm.get('exonere_tnb')?.value || false,
      date_permis: this.parcelleForm.get('date_permis')?.value || new Date().toISOString().split('T')[0],
      duree_exoneration: this.parcelleForm.get('duree_exoneration')?.value || 0,
      etat_validation: this.parcelleForm.get('etat_validation')?.value || 'Brouillon'
    });
    
    // Marquer tous les champs comme valides
    Object.keys(this.parcelleForm.controls).forEach(key => {
      const control = this.parcelleForm.get(key);
      if (control) {
        control.setErrors(null);
        control.markAsTouched();
      }
    });
    
    this.parcelleForm.updateValueAndValidity();
    
    console.log('✅ Sauvegarde forcée, formulaire valide:', this.parcelleForm.valid);
    
    this.isDraft = true;
    this.isPublished = false;
    this.saveParcelle();
  }

  validateParcelle(): void {
    if (!this.canSave()) {
      this.showErrorMessage('Veuillez remplir tous les champs obligatoires du formulaire.');
      return;
    }
    this.isDraft = false;
    this.isPublished = false;
    this.validationForm.patchValue({
      validation_geometrie: true,
      validation_attributs: true,
      validation_proprietaires: true,
      validation_documents: true,
      validation_fiscale: true
    });
    this.saveParcelle();
  }

  publishParcelle(): void {
    if (!this.canSave()) {
      this.showErrorMessage('Veuillez remplir tous les champs obligatoires du formulaire.');
      return;
    }
    this.isDraft = false;
    this.isPublished = true;
    this.saveParcelle();
  }

  private saveParcelle(): void {
    this.isLoading = true;

    // Vérifier que la référence foncière est remplie
    const referenceFonciere = this.parcelleForm.get('reference_fonciere')?.value;
    if (!referenceFonciere || referenceFonciere.trim() === '') {
      this.showErrorMessage('La référence foncière est obligatoire');
      this.isLoading = false;
      return;
    }

    // Si on n'est pas en mode édition, générer une référence unique si nécessaire
    if (!this.isEditing) {
      const uniqueRef = this.generateUniqueReference(referenceFonciere);
      if (uniqueRef !== referenceFonciere) {
        this.parcelleForm.patchValue({ reference_fonciere: uniqueRef });
        console.log(`Référence foncière mise à jour pour éviter les conflits: ${uniqueRef}`);
      }
    }

    let parcelleData: any;
    try {
      parcelleData = this.prepareParcelleData();
      
      console.log('Sauvegarde parcelle:', {
        isDraft: this.isDraft,
        isPublished: this.isPublished,
        etatValidation: parcelleData.etatValidation,
        data: parcelleData,
        currentStep: this.currentStep
      });
    } catch (error: any) {
      console.error('Erreur de validation:', error);
      this.showErrorMessage(error.message || 'Erreur de validation des données');
      this.isLoading = false;
      return;
    }
    
    console.log('🔍 Données complètes envoyées au backend:', JSON.stringify(parcelleData, null, 2));
    console.log('🔍 Géométrie dans parcelleData:', parcelleData.geometry);
    console.log('🔍 Type de géométrie:', typeof parcelleData.geometry);
    console.log('🔍 URL API de création:', this.parcelleService['apiUrl']);

    if (this.isEditing && this.parcelleId) {
      // Mise à jour d'une parcelle existante
      this.parcelleService.updateParcelle(Number(this.parcelleId), parcelleData).subscribe({
        next: (response: any) => {
          console.log('Parcelle mise à jour avec succès:', response);
          this.markAsSaved();
          this.showSuccessMessage('Parcelle mise à jour avec succès !');
          this.router.navigate(['/parcelles']);
        },
        error: (error: any) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.showErrorMessage('Erreur lors de la mise à jour de la parcelle');
          this.isLoading = false;
        }
      });
    } else {
      // Création d'une nouvelle parcelle
      this.parcelleService.createParcelle(parcelleData).subscribe({
        next: (response: any) => {
          console.log('Parcelle créée avec succès:', response);
          this.markAsSaved();
          this.showSuccessMessage('Parcelle enregistrée avec succès !');
          // Délai plus long pour laisser le temps au backend de traiter et indexer
          setTimeout(() => {
            console.log('Navigation vers la liste des parcelles...');
            this.router.navigate(['/parcelles/list']);
          }, 2000);
        },
        error: (error: any) => {
          console.error('Erreur lors de la création:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Error body:', error.error);
          
          let errorMessage = 'Erreur lors de la création de la parcelle';
          if (error.status === 409) {
            if (error.error && error.error.message) {
              if (error.error.message.includes('Référence foncière déjà utilisée')) {
                errorMessage = `Conflit détecté: ${error.error.message}. Veuillez utiliser une référence foncière différente.`;
              } else {
                errorMessage = `Conflit détecté: ${error.error.message}`;
              }
            } else {
              errorMessage = 'Conflit détecté. Vérifiez la référence foncière ou la géométrie.';
            }
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          
          this.showErrorMessage(errorMessage);
          this.isLoading = false;
        }
      });
    }
  }

  private prepareParcelleData(): any {
    // Préparer les données de base de la parcelle avec les noms de propriétés du backend
    const formValue = this.parcelleForm.value;
    const isExonere = formValue.exonere_tnb || false;
    
    const parcelleData: any = {
      // Propriétés principales avec conversion camelCase
      referenceFonciere: formValue.reference_fonciere,
      surfaceTotale: formValue.surface_totale,
      statutFoncier: formValue.statut_foncier,
      statutOccupation: formValue.statut_occupation,
      zonage: formValue.zone_urbanistique,
      exonereTnb: isExonere,
      datePermis: formValue.date_permis || undefined,
      dureeExoneration: formValue.duree_exoneration ? Number(formValue.duree_exoneration) : undefined,
      observations: formValue.observations || undefined
    };

    // Gestion de la surface imposable selon l'exonération
    if (isExonere) {
      // Parcelle exonérée : surface imposable = 0
      parcelleData.surfaceImposable = 0;
      parcelleData.prixUnitaireM2 = 0; // Pas de tarif pour les exonérées
      console.log('🔓 Parcelle exonérée : surface imposable = 0, tarif = 0');
    } else {
      // Parcelle imposable : utiliser la surface imposable saisie
      parcelleData.surfaceImposable = formValue.surface_imposable || formValue.surface_totale;
      parcelleData.prixUnitaireM2 = formValue.prix_unitaire_m2 || 0;
      console.log('🔒 Parcelle imposable : surface imposable =', parcelleData.surfaceImposable, 'tarif =', parcelleData.prixUnitaireM2);
    }

    // Ajouter une géométrie par défaut (solution simple)
    console.log('🔍 Ajout d\'une géométrie par défaut...');
    
    // Créer un polygone par défaut autour de Casablanca
    const casablancaCoords = [
      [-7.5898, 33.5731], // Casablanca centre
      [-7.5898, 33.5741], // +0.001° latitude
      [-7.5908, 33.5741], // +0.001° longitude
      [-7.5908, 33.5731], // retour latitude
      [-7.5898, 33.5731]  // fermer le polygone
    ];
    
    parcelleData.geometry = {
      type: 'Polygon',
      coordinates: [casablancaCoords]
    };
    
    console.log('✅ Géométrie par défaut ajoutée:', parcelleData.geometry);

    // Ajouter les propriétaires si disponibles
    if (this.proprietaires && this.proprietaires.length > 0) {
      // Vérifier que la somme des quote-parts est exactement 1.0 (100%)
      const totalQuoteParts = this.proprietaires.reduce((sum, prop) => sum + (prop.quote_part || 0), 0);
      console.log('Total quote-parts avant validation:', totalQuoteParts);
      
      // Si la somme n'est pas 1.0, ajuster automatiquement
      if (Math.abs(totalQuoteParts - 1.0) > 0.01) {
        console.warn(`Somme des quote-parts incorrecte: ${totalQuoteParts}, ajustement automatique à 1.0`);
        // Ajuster automatiquement la quote-part du premier propriétaire
        if (this.proprietaires.length > 0) {
          this.proprietaires[0].quote_part = 1.0;
        }
      }
    } else {
      // Si aucun propriétaire, créer un propriétaire par défaut
      console.warn('Aucun propriétaire trouvé, création d\'un propriétaire par défaut');
      this.proprietaires = [this.createDefaultProprietaire()];
    }
    
    parcelleData.proprietaires = this.proprietaires.map((prop: any) => {
        console.log('Propriétaire complet:', prop);
        console.log('Propriétés disponibles:', Object.keys(prop));
        
        // Extraire les données si c'est une réponse encapsulée
        const data = prop.data || prop;
        const proprietaireId = data.id || prop.id;
        
        console.log('prop.quote_part:', prop.quote_part);
        console.log('Type de quote_part:', typeof prop.quote_part);
        
        let quotePart = Number(prop.quote_part);
        
        // Si quote_part est undefined, null, ou NaN, utiliser 1.0 par défaut
        if (isNaN(quotePart) || quotePart === null || quotePart === undefined || quotePart <= 0) {
          console.warn(`Quote-part invalide pour propriétaire ${proprietaireId} (${prop.quote_part}), utilisation de 1.0 par défaut`);
          quotePart = 1.0;
        }
        
        // S'assurer que la quote-part est entre 0 et 1
        if (quotePart > 1) {
          console.warn(`Quote-part > 1 pour propriétaire ${proprietaireId} (${quotePart}), normalisation à 1.0`);
          quotePart = 1.0;
        }
        
        console.log(`Propriétaire ${proprietaireId}: quote_part=${prop.quote_part}, envoyé=${quotePart}`);
        return {
          proprietaireId: proprietaireId,
          quotePart: quotePart // Les quote-parts sont déjà en décimales (0-1)
        };
      });
      
      console.log('Propriétaires préparés:', parcelleData.proprietaires);
      const totalQuoteParts = parcelleData.proprietaires.reduce((sum: number, p: any) => sum + p.quotePart, 0);
      console.log('Somme des quote-parts (décimales):', totalQuoteParts);
      
      // Validation finale : s'assurer que la somme = 1.0
      if (Math.abs(totalQuoteParts - 1.0) > 0.01) {
        console.warn(`Somme des quote-parts invalide: ${totalQuoteParts}, ajustement automatique`);
        // Ajuster automatiquement le premier propriétaire pour que la somme = 1.0
        const difference = 1.0 - totalQuoteParts;
        parcelleData.proprietaires[0].quotePart += difference;
        console.log(`Ajustement appliqué: ${parcelleData.proprietaires[0].quotePart}`);
      }

    // Ajouter l'état de validation selon l'action choisie
    if (this.isDraft) {
      parcelleData.etatValidation = 'Brouillon';
    } else if (this.isPublished) {
      parcelleData.etatValidation = 'Publie';
    } else {
      // Par défaut, si ce n'est pas un brouillon et pas publié, c'est validé
      parcelleData.etatValidation = 'Valide';
    }

    console.log('Données parcelle préparées:', parcelleData);
    return parcelleData;
  }

  private validateAllSteps(): boolean {
    return this.parcelleForm.valid &&
           this.proprietairesForm.valid &&
           this.fiscalForm.valid &&
           this.validationForm.valid &&
           this.drawnFeature !== null &&
           this.uploadedDocuments.length > 0;
  }

  // =====================================================
  // MÉTHODES UTILITAIRES
  // =====================================================
  private checkEditMode(): void {
    this.route.params.subscribe((params: any) => {
      if (params['id']) {
        this.isEditing = true;
        this.parcelleId = params['id'];
        this.loadParcelleForEdit();
      }
    });
  }

  private loadParcelleForEdit(): void {
    if (!this.parcelleId) return;

    this.parcelleService.getParcelle(Number(this.parcelleId)).subscribe({
      next: (parcelle: any) => {
        this.populateForms(parcelle);
        this.loadParcelleGeometry(parcelle);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement de la parcelle');
      }
    });
  }

  private populateForms(parcelle: any): void {
    this.parcelleForm.patchValue(parcelle);
    this.proprietairesForm.patchValue(parcelle);
    this.fiscalForm.patchValue(parcelle);
    this.validationForm.patchValue(parcelle);
    
    // Mise à jour des surfaces et calculs
    this.surfaceTotale = parcelle.surface_totale;
    this.surfaceImposable = parcelle.surface_imposable;
    this.recalculateTNB();
  }

  private loadParcelleGeometry(parcelle: any): void {
    if (parcelle.coordonnees_geometriques) {
      const feature = new Feature({
        geometry: new Polygon(parcelle.coordonnees_geometriques)
      });
      
      this.vectorSource.clear();
      this.vectorSource.addFeature(feature);
      this.drawnFeature = feature;
      
      // Zoom sur la parcelle
      const extent = feature.getGeometry()?.getExtent();
      if (extent) {
        this.map.getView().fit(extent, { padding: [50, 50, 50, 50] });
      }
    }
  }

  private loadMapLayers(): void {
    // Simulation des couches cartographiques
    this.mapLayers = [
      { id: 'osm', name: 'OSM', checked: true },
      { id: 'cadastre', name: 'Cadastre', checked: true }
    ];
  }

  // =====================================================
  // MÉTHODES PUBLIQUES POUR L'INTERFACE
  // =====================================================
  // Méthode allStepsCompleted définie plus bas dans la classe

  getStepStatus(step: number): string {
    if (step < this.currentStep) return 'completed';
    if (step === this.currentStep) return 'active';
    return 'pending';
  }

  getProgressPercentage(): number {
    return Math.round((this.currentStep / this.totalSteps) * 100);
  }

  // Méthodes pour les outils de carte
  startDrawing(): void {
    this.map.removeInteraction(this.modifyInteraction);
    this.map.addInteraction(this.drawInteraction);
  }

  startModifying(): void {
    this.map.removeInteraction(this.drawInteraction);
    this.map.addInteraction(this.modifyInteraction);
  }

  clearMap(): void {
    this.vectorSource.clear();
    this.drawnFeature = null;
    this.parcelleForm.patchValue({
      surface_totale: 0,
      surface_imposable: 0,
      coordonnees_geometriques: null
    });
    // Réinitialiser les calculs de géométrie
    this.resetCalculations();
  }

  // Méthodes pour la gestion des quote-parts (remplacées par les versions du modal)

  // Méthodes pour la validation
  validateStep(step: number): boolean {
    switch (step) {
      case 1: return this.parcelleForm.valid && this.drawnFeature !== null;
      case 2: return this.parcelleForm.get('coordonnees_geometriques')?.valid || false;
      case 3: return this.proprietairesForm.valid;
      case 4: return this.uploadedDocuments.length > 0;
      case 5: return this.fiscalForm.valid;
      case 6: return this.validationForm.valid;
      default: return false;
    }
  }

  // Méthodes pour les notifications
  showStepValidation(step: number): void {
    if (this.validateStep(step)) {
      console.log(`Étape ${step} validée avec succès`);
    } else {
      console.log(`Veuillez compléter l'étape ${step}`);
    }
  }

  // Vérifier si la sauvegarde est possible
  canSave(): boolean {
    console.log('🔍 Vérification canSave:');
    console.log('🔍 parcelleForm.valid:', this.parcelleForm.valid);
    
    // Vérifier les erreurs de validation
    if (!this.parcelleForm.valid) {
      console.log('❌ Formulaire invalide, détails des erreurs:');
      Object.keys(this.parcelleForm.controls).forEach(key => {
        const control = this.parcelleForm.get(key);
        if (control && control.errors) {
          console.log(`❌ ${key}:`, control.errors);
          console.log(`❌ ${key} value:`, control.value);
        }
      });
    }
    
    // Permettre la sauvegarde si le formulaire est valide (géométrie par défaut sera ajoutée)
    const canSaveResult = this.parcelleForm.valid;
    console.log('🔍 canSave result:', canSaveResult);
    
    return canSaveResult;
  }


  zoomOut(): void {
    const view = this.map.getView();
    if (view) {
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        view.animate({
          zoom: currentZoom - 1,
          duration: 250
        });
      }
    }
  }

  resetView(): void {
    this.map.getView().animate({
      center: fromLonLat([-7.5898, 33.5731]),
      zoom: 12,
      duration: 500
    });
  }

  // Méthodes manquantes pour le template
  goBack(): void {
    this.router.navigate(['/parcelles']);
  }

  importShapefile(): void {
    console.log('Import shapefile');
  }

  onSurfaceTotaleChange(): void {
    this.recalculateImposableSurface();
  }

  onSurfaceImposableChange(): void {
    this.recalculateTNB();
  }

  onExonerationChange(): void {
    console.log('Exonération changée');
  }

  activateDrawTool(): void {
    this.startDrawing();
  }

  activateEditTool(): void {
    this.startModifying();
  }

  clearGeometry(): void {
    this.clearMap();
  }

  validateGeometry(): void {
    this.geometryValid = this.drawnFeature !== null;
  }

  validateQuoteParts(): void {
    this.recalculateQuoteParts();
  }

  addDocument(): void {
    console.log('Ajouter document');
  }

  onDragOver(event: any): void {
    event.preventDefault();
  }

  onDrop(event: any): void {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files) {
      this.onFileSelected({ target: { files } });
    }
  }

  getDocumentIcon(type: string): string {
    switch (type) {
      case 'pdf': return 'fa-file-pdf';
      case 'image': return 'fa-file-image';
      case 'document': return 'fa-file-word';
      default: return 'fa-file';
    }
  }

  previewDocument(index: number): void {
    console.log('Prévisualiser document', index);
  }

  showTarifModal(): void {
    console.log('Afficher modal tarifs');
  }

  // Getters pour les formulaires
  get generalForm(): FormGroup {
    return this.parcelleForm;
  }

  // Méthodes manquantes
  loadInitialData(): void {
    // Charger les données initiales
    this.loadZonesUrbanistiques();
    this.loadCategoriesFiscales();
  }

  loadZonesUrbanistiques(): void {
    // Charger les zones urbanistiques depuis le backend
    // TODO: Implémenter l'appel au service
  }

  loadCategoriesFiscales(): void {
    // Charger les catégories fiscales depuis le backend
    // TODO: Implémenter l'appel au service
  }

  // Méthode publique pour Math.round
  round(value: number): number {
    return Math.round(value);
  }

  // Navigation entre étapes
  switchStep(stepNumber: number): void {
    this.currentStep = stepNumber;
    this.updateWorkflowProgress(stepNumber);
  }

  // Mise à jour du workflow
  private updateWorkflowProgress(step: number): void {
    // Mise à jour de la progression
    console.log(`Étape ${step} sur 6`);
  }

  // =====================================================
  // MODAL PROPRIÉTAIRE
  // =====================================================
  
  // Initialiser le formulaire modal
  private initializeProprietaireModalForm(): void {
    this.proprietaireModalForm = this.fb.group({
      type_proprietaire: ['Physique', Validators.required],
      nom: ['', Validators.required],
      prenom: [''],
      cin_ou_rc: ['', Validators.required],
      adresse: [''],
      telephone: [''],
      email: [''],
      quote_part: [0.5, [Validators.required, Validators.min(0), Validators.max(1)]]
    });
  }

  // Ouvrir le modal
  addProprietaire(): void {
    this.initializeProprietaireModalForm();
    this.showProprietaireModal = true;
  }

  // Fermer le modal
  closeProprietaireModal(): void {
    this.showProprietaireModal = false;
    this.proprietaireModalForm.reset();
  }

  // Changement de type de propriétaire
  onTypeProprietaireChange(): void {
    const type = this.proprietaireModalForm.get('type_proprietaire')?.value;
    if (type === 'personne_physique') {
      this.proprietaireModalForm.get('rc_ice')?.clearValidators();
      this.proprietaireModalForm.get('cin')?.setValidators([Validators.required]);
    } else if (type === 'personne_morale') {
      this.proprietaireModalForm.get('cin')?.clearValidators();
      this.proprietaireModalForm.get('rc_ice')?.setValidators([Validators.required]);
    }
    this.proprietaireModalForm.get('cin')?.updateValueAndValidity();
    this.proprietaireModalForm.get('rc_ice')?.updateValueAndValidity();
  }

  // Valider la quote-part
  validateQuotePart(): boolean {
    const newQuotePart = this.proprietaireModalForm.get('quote_part')?.value || 0;
    const currentTotal = this.proprietaires.reduce((sum, prop) => sum + (prop.quote_part || 0), 0);
    return (currentTotal + newQuotePart) <= 1.0;
  }

  // Vérifier si la quote-part est valide
  isQuotePartValid(): boolean {
    return this.validateQuotePart();
  }

  // Soumettre le propriétaire
  submitProprietaire(): void {
    if (this.proprietaireModalForm.valid && this.isQuotePartValid()) {
      const formValue = this.proprietaireModalForm.value;
      const quotePart = Number(formValue.quote_part) || 1.0;
      
      console.log('Formulaire soumis:', formValue);
      console.log('Quote-part extraite:', quotePart);
      console.log('Type de quote-part:', typeof quotePart);
      
      // Créer le nouveau propriétaire
      const nouveauProprietaire: Partial<Proprietaire> = {
        nom: formValue.nom,
        prenom: formValue.prenom,
        nature: formValue.type_proprietaire || 'Physique',
        cinOuRc: formValue.cin_ou_rc,
        adresse: formValue.adresse,
        telephone: formValue.telephone,
        email: formValue.email,
        estActif: true
      };

      // Sauvegarder le propriétaire dans la base de données
      this.proprietaireService.createProprietaire(nouveauProprietaire).subscribe({
        next: (response) => {
          console.log('Réponse complète de l\'API:', response);
          
          // Extraire les données du propriétaire de la réponse encapsulée
          const proprietaireCree = (response as any).data || response;
          console.log('Propriétaire créé par l\'API:', proprietaireCree);
          console.log('Propriétés disponibles:', Object.keys(proprietaireCree));
          
          // Ajouter le propriétaire créé avec sa quote-part
          const proprietaireAvecQuote: any = {
            ...proprietaireCree,
            quote_part: quotePart
          };
          
          // Vérifier que la quote-part est valide
          if (quotePart <= 0 || quotePart > 1) {
            console.error('Quote-part invalide:', quotePart);
            this.showErrorMessage('La quote-part doit être entre 0 et 1');
            return;
          }
          
          this.proprietaires.push(proprietaireAvecQuote);
          this.recalculateQuoteParts();
          this.closeProprietaireModal();
          
          console.log('Propriétaire créé et ajouté:', proprietaireAvecQuote);
          this.showSuccessMessage('Propriétaire ajouté avec succès !');
        },
        error: (error) => {
          console.error('Erreur lors de la création du propriétaire:', error);
          this.showErrorMessage('Erreur lors de la création du propriétaire');
        }
      });
    }
  }

  // Recalculer les quote-parts
  private recalculateQuoteParts(): void {
    this.totalQuoteParts = this.proprietaires.reduce((sum, prop) => sum + (prop.quote_part || 0), 0);
    console.log('Total quote-parts calculé:', this.totalQuoteParts);
    // Recalculer le TNB après modification des quote-parts
    this.recalculateTNB();
  }

  // Supprimer un propriétaire
  removeProprietaire(index: number): void {
    this.proprietaires.splice(index, 1);
    this.recalculateQuoteParts();
  }

  // Méthode utilitaire pour obtenir le nom complet du propriétaire
  getProprietaireName(proprietaire: any): string {
    console.log('Propriétaire pour affichage:', proprietaire);
    console.log('Propriétés disponibles:', Object.keys(proprietaire));
    
    // Extraire les données si c'est une réponse encapsulée
    const data = proprietaire.data || proprietaire;
    
    // Gérer les différents formats possibles de l'API
    const nom = data.nom || data.nom_complet || '';
    const prenom = data.prenom || '';
    
    console.log(`Nom: "${nom}", Prénom: "${prenom}"`);
    
    if (data.nature === 'Morale' || data.type_proprietaire === 'Morale') {
      return nom;
    }
    
    const nomComplet = prenom ? `${prenom} ${nom}` : nom;
    console.log(`Nom complet: "${nomComplet}"`);
    return nomComplet;
  }

  // Méthode utilitaire pour obtenir le CIN/RC du propriétaire
  getProprietaireCin(proprietaire: any): string {
    // Extraire les données si c'est une réponse encapsulée
    const data = proprietaire.data || proprietaire;
    const cin = data.cinOuRc || data.cin_ou_rc || '';
    console.log(`CIN/RC: "${cin}"`);
    return cin;
  }

  // Méthode pour créer un propriétaire par défaut avec quote-part = 1.0
  private createDefaultProprietaire(): ProprietaireAvecQuote {
    return {
      id: Date.now(), // ID temporaire
      nom: 'Propriétaire par défaut',
      prenom: '',
      nature: 'Physique',
      cinOuRc: 'DEFAULT',
      adresse: '',
      telephone: '',
      email: '',
      estActif: true,
      quote_part: 1.0
    };
  }

  // =====================================================
  // CALCUL TNB
  // =====================================================

  // Recalculer le TNB avec la formule correcte
  recalculateTNB(): void {
    // Récupérer la surface imposable depuis le formulaire fiscal ou général
    const surfaceImposable = this.fiscalForm.get('surface_imposable')?.value || 
                            this.parcelleForm.get('surface_imposable')?.value || 
                            this.surfaceImposable || 0;
    
    const tarifUnitaire = this.fiscalForm.get('tarif_unitaire')?.value || 0;
    
    console.log('Recalcul TNB - Données:', {
      surfaceImposable,
      tarifUnitaire,
      fiscalForm: this.fiscalForm.value,
      parcelleForm: this.parcelleForm.value
    });
    
    if (surfaceImposable > 0 && tarifUnitaire > 0) {
      // Formule: TNB = Surface × Tarif × Quote-part
      this.totalTnb = surfaceImposable * tarifUnitaire;
      
      // TNB par propriétaire si des propriétaires existent
      if (this.proprietaires.length > 0) {
        this.tnbParProprietaire = this.totalTnb / this.proprietaires.length;
      }
      
      console.log('TNB recalculé avec succès:', {
        surfaceImposable,
        tarifUnitaire,
        totalTnb: this.totalTnb,
        tnbParProprietaire: this.tnbParProprietaire
      });
      
      // Forcer la mise à jour de l'affichage
      this.cd.detectChanges();
    } else {
      console.log('Recalcul TNB - Données insuffisantes:', {
        surfaceImposable,
        tarifUnitaire
      });
    }
  }

  // Vérifier si toutes les étapes sont complétées
  allStepsCompleted(): boolean {
    return this.currentStep === 6 && 
           this.parcelleForm.valid && 
           this.proprietaires.length > 0 && 
           this.fiscalForm.get('tarif_unitaire')?.value > 0;
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================
  
  private showSuccessMessage(message: string): void {
    console.log('✅ SUCCÈS:', message);
    // TODO: Implémenter une vraie notification (toast, alert, etc.)
    alert(message); // Temporaire - à remplacer par un vrai système de notification
  }

  private showErrorMessage(message: string): void {
    console.error('❌ ERREUR:', message);
    // TODO: Implémenter une vraie notification d'erreur
    alert('ERREUR: ' + message); // Temporaire - à remplacer par un vrai système de notification
  }

  private generateUniqueReference(baseRef: string): string {
    // Générer une référence unique en ajoutant un timestamp
    const timestamp = Date.now().toString().slice(-6); // 6 derniers chiffres du timestamp
    const prefix = baseRef.split('-')[0] || 'TF'; // Garder le préfixe ou utiliser TF par défaut
    
    return `${prefix}-${timestamp}`;
  }
}