import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { ParcelleService } from '../../services/parcelle.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FileSizePipe } from '../../../../shared/pipes';
import { ComponentWithUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { MapModule } from '../../../../shared/components/map/map.module';
import { MapOptions } from '../../../../shared/components/map/map.component';


// OpenLayers imports
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
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
  proprietaires: any[] = [];
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
    this.initializeMap();
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
    if (geometry && geometry.type === 'Polygon') {
      // Calculer la surface à partir de la géométrie
      // Cette logique sera implémentée dans le MapComponent
      console.log('Calcul de la surface à partir de la géométrie');
    }
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
      surface_imposable: [0, [Validators.required, Validators.min(0)]],
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
    if (!this.mapContainer) return;

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
        center: fromLonLat([-7.5898, 33.5731]), // Coordonnées du Maroc
        zoom: 12,
        maxZoom: 18
      })
    });

    // Ajout des interactions
    this.setupMapInteractions();

    // Écouteur pour la géométrie dessinée
    this.listener = this.vectorSource.on('addfeature', (event: any) => {
      this.onFeatureAdded(event.feature);
    });
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
    this.drawnFeature = feature;
    this.calculateSurface();
    this.updateFormGeometry();
    this.markAsModified();
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
      const area = getArea(geometry);
      this.surfaceTotale = Math.round(area * 100) / 100; // Arrondi à 2 décimales
      
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
    // Simulation des données pour le moment
    this.proprietaires = [
      { id: 1, nom: 'Propriétaire 1', cin: 'AB123456' },
      { id: 2, nom: 'Propriétaire 2', cin: 'CD789012' }
    ];
    this.initializeQuoteParts();
  }

  private initializeQuoteParts(): void {
    const quotePartsArray = this.proprietairesForm.get('quote_parts') as FormArray;
    quotePartsArray.clear();

    this.proprietaires.forEach(proprietaire => {
      quotePartsArray.push(this.fb.group({
        proprietaire_id: [proprietaire.id],
        nom: [proprietaire.nom],
        quote_part: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
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
        return this.drawnFeature !== null;
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
  // VALIDATION ET SAUVEGARDE
  // =====================================================
  saveDraft(): void {
    this.isDraft = true;
    this.isPublished = false;
    this.saveParcelle();
  }

  validateParcelle(): void {
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

    const parcelleData = this.prepareParcelleData();
    
    console.log('Sauvegarde parcelle:', {
      isDraft: this.isDraft,
      isPublished: this.isPublished,
      etatValidation: parcelleData.etatValidation,
      data: parcelleData,
      currentStep: this.currentStep
    });
    
    console.log('Données complètes envoyées au backend:', JSON.stringify(parcelleData, null, 2));
    console.log('URL API de création:', this.parcelleService['apiUrl']);
    
    console.log('Données complètes envoyées au backend:', JSON.stringify(parcelleData, null, 2));

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
    
    const parcelleData: any = {
      // Propriétés principales avec conversion camelCase
      referenceFonciere: formValue.reference_fonciere,
      surfaceTotale: formValue.surface_totale,
      surfaceImposable: formValue.surface_imposable,
      statutFoncier: formValue.statut_foncier,
      statutOccupation: formValue.statut_occupation,
      zonage: formValue.zone_urbanistique,
      exonereTnb: formValue.exonere_tnb,
      datePermis: formValue.date_permis || undefined,
      dureeExoneration: formValue.duree_exoneration ? Number(formValue.duree_exoneration) : undefined,
      observations: formValue.observations || undefined
    };

    // Ajouter la géométrie si disponible
    if (this.drawnFeature) {
      const geometry = this.drawnFeature.getGeometry();
      if (geometry) {
        // Convertir la géométrie OpenLayers en GeoJSON
        const geoJson = geometry.transform('EPSG:3857', 'EPSG:4326');
        const coordinates = (geoJson as any).getCoordinates()[0];
        
        // S'assurer que le polygone est fermé (premier et dernier point identiques)
        if (coordinates.length > 0) {
          const firstPoint = coordinates[0];
          const lastPoint = coordinates[coordinates.length - 1];
          
          if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
            coordinates.push([firstPoint[0], firstPoint[1]]);
          }
        }
        
        parcelleData.geometry = {
          type: 'Polygon',
          coordinates: [coordinates]
        };
        
        console.log('Géométrie préparée:', parcelleData.geometry);
        console.log('Nombre de points:', coordinates.length);
        console.log('Premier point:', coordinates[0]);
        console.log('Dernier point:', coordinates[coordinates.length - 1]);
      }
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

  zoomIn(): void {
    const view = this.map.getView();
    if (view) {
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        view.animate({
          zoom: currentZoom + 1,
          duration: 250
        });
      }
    }
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
      type_proprietaire: ['personne_physique', Validators.required],
      nom_complet: ['', Validators.required],
      cin_ou_rc: [''],
      adresse: [''],
      telephone: [''],
      quote_part: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
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
    return (currentTotal + newQuotePart) <= 100;
  }

  // Vérifier si la quote-part est valide
  isQuotePartValid(): boolean {
    return this.validateQuotePart();
  }

  // Soumettre le propriétaire
  submitProprietaire(): void {
    if (this.proprietaireModalForm.valid && this.isQuotePartValid()) {
      const newProprietaire = {
        ...this.proprietaireModalForm.value,
        id: Date.now(), // ID temporaire
        type: this.proprietaireModalForm.get('type_proprietaire')?.value
      };

      this.proprietaires.push(newProprietaire);
      this.recalculateQuoteParts();
      this.closeProprietaireModal();
      
      console.log('Propriétaire ajouté:', newProprietaire);
    }
  }

  // Recalculer les quote-parts
  private recalculateQuoteParts(): void {
    this.totalQuoteParts = this.proprietaires.reduce((sum, prop) => sum + (prop.quote_part || 0), 0);
    // Recalculer le TNB après modification des quote-parts
    this.recalculateTNB();
  }

  // Supprimer un propriétaire
  removeProprietaire(index: number): void {
    this.proprietaires.splice(index, 1);
    this.recalculateQuoteParts();
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