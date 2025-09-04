// =====================================================
// COMPOSANT FICHE DÉTAILLÉE PARCELLE - INTERFACE MODERNE
// =====================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

// Import du composant Map
import { MapComponent } from '../../../../shared/components/map/map.component';
// Import du pipe fileSize
import { FileSizePipe } from '../../../../shared/pipes/file-size.pipe';

// Interfaces
export interface Parcelle {
  id: number;
  referenceFonciere: string;
  statut: string;
  dateModification: Date;
  derniereModificationPar: string;
  surfaceCadastrale: number;
  surfaceSIG: number;
  surfaceImposable: number;
  tnbCalculee: number;
  tarifUnitaire: number;
  anneeFiscale: number;
  typePropriete: string;
  fichesGenerees: number;
  derniereFiche: Date;
  typeTitre: string;
  zoneUrbanistique: string;
  statutOccupation: string;
  statutOccupationDetail: string;
  adresse: string;
  adresseDetail: string;
  perimetre: number;
  coordonneesCentroide: { x: number; y: number };
  ecartSurface: number;
  typeGeometrie: string;
  nombreSommets: number;
  ratioForme: number;
  systemeProjection: string;
  precision: string;
  sourceGeometrie: string;
  dateLeve: Date;
  parcellesVoisines: ParcelleVoisine[];
  equipementsProches: Equipement[];
  voiriesProches: Voirie[];
  grandsEspaces: GrandEspace[];
  coordonneesSommets: CoordonneeSommet[];
  proprietaires: Proprietaire[];
  evolutionTarifs: EvolutionTarif[];
  documents: Document[];
  historique: HistoryEntry[];
  coefficientAbattement: number;
  categorieFiscale: string;
  tauxRecouvrement: number;
}

export interface ParcelleVoisine {
  direction: string;
  reference: string;
  zone: string;
}

export interface Equipement {
  nom: string;
  distance: string;
  icon: string;
  type: string;
  description?: string;
}

export interface Voirie {
  nom: string;
  type: string;
  distance: string;
  largeur: string;
  etat: string;
  icon: string;
}

export interface GrandEspace {
  nom: string;
  type: string;
  distance: string;
  superficie: string;
  icon: string;
}

export interface CoordonneeSommet {
  xLambert: number;
  yLambert: number;
  longitude: number;
  latitude: number;
  distanceSuivant: number;
}

export interface Proprietaire {
  id: number;
  nom: string;
  cin: string;
  adresse: string;
  ville: string;
  codePostal: string;
  quotePart: number;
}

export interface EvolutionTarif {
  annee: number;
  tarif: number;
  evolution: string;
  evolutionClass: string;
  evolutionIcon: string;
}

export interface Document {
  id: number;
  nom: string;
  nomFichier: string;
  type: string;
  taille: number;
  dateCreation: Date;
  ajoutePar: string;
}

export interface HistoryEntry {
  id: number;
  date: Date;
  utilisateur: string;
  roleUtilisateur: string;
  action: string;
  badgeClass: string;
  icon: string;
  champsModifies: string[];
  description: string;
  version: string;
  type: string;
}

@Component({
  selector: 'app-parcelle-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MapComponent,
    FileSizePipe
  ],
  templateUrl: './parcelle-detail.component.html',
  styleUrls: ['./parcelle-detail.component.scss']
})
export class ParcelleDetailComponent implements OnInit, OnDestroy {

  // =====================================================
  // PROPRIÉTÉS
  // =====================================================

  parcelle: Parcelle = {
    id: 1,
    referenceFonciere: 'TF-456789',
    statut: 'Publié',
    dateModification: new Date('2024-03-15'),
    derniereModificationPar: 'tech.sig',
    surfaceCadastrale: 2450,
    surfaceSIG: 2453.67,
    surfaceImposable: 2200,
    tnbCalculee: 22000,
    tarifUnitaire: 10,
    anneeFiscale: 2024,
    typePropriete: 'indivision',
    fichesGenerees: 3,
    derniereFiche: new Date('2024-03-15'),
    typeTitre: 'Titre Foncier',
    zoneUrbanistique: 'R2 - Résidentiel moyen',
    statutOccupation: 'Terrain nu',
    statutOccupationDetail: 'Pas de construction déclarée',
    adresse: 'Secteur Lazaret, Quartier Salam',
    adresseDetail: 'Oujda, Province d\'Oujda-Angad',
    perimetre: 198.45,
    coordonneesCentroide: { x: 651289.23, y: 372165.34 },
    ecartSurface: 3.67,
    typeGeometrie: 'Polygone',
    nombreSommets: 12,
    ratioForme: 0.78,
    systemeProjection: 'EPSG:26191',
    precision: '± 0.05',
    sourceGeometrie: 'Levé GPS-RTK',
    dateLeve: new Date('2024-03-15'),
    parcellesVoisines: [
      { direction: 'Nord', reference: 'TF-456788', zone: 'R2' },
      { direction: 'Est', reference: 'R-789457', zone: 'R1' },
      { direction: 'Sud', reference: 'Avenue principale', zone: '' },
      { direction: 'Ouest', reference: 'TF-456787', zone: 'R2' }
    ],
    equipementsProches: [
      { nom: 'École primaire', distance: '450m', icon: 'fas fa-school', type: 'Éducation', description: 'École publique' },
      { nom: 'Centre de santé', distance: '800m', icon: 'fas fa-hospital', type: 'Santé', description: 'Centre de soins primaires' },
      { nom: 'Marché', distance: '1.2km', icon: 'fas fa-shopping-cart', type: 'Commerce', description: 'Marché central' },
      { nom: 'Hôtel 4 étoiles', distance: '600m', icon: 'fas fa-hotel', type: 'Hébergement', description: 'Hôtel de luxe' },
      { nom: 'Parc urbain', distance: '300m', icon: 'fas fa-tree', type: 'Espace vert', description: 'Parc municipal' },
      { nom: 'Gare routière', distance: '1.5km', icon: 'fas fa-bus', type: 'Transport', description: 'Gare principale' }
    ],
    voiriesProches: [
      { nom: 'Avenue Hassan II', type: 'Avenue principale', distance: '50m', largeur: '20m', etat: 'Excellent', icon: 'fas fa-road' },
      { nom: 'Rue Mohammed V', type: 'Rue secondaire', distance: '120m', largeur: '12m', etat: 'Bon', icon: 'fas fa-road' },
      { nom: 'Boulevard de la Résistance', type: 'Boulevard', distance: '200m', largeur: '25m', etat: 'Excellent', icon: 'fas fa-road' },
      { nom: 'Rue des Écoles', type: 'Rue résidentielle', distance: '80m', largeur: '8m', etat: 'Moyen', icon: 'fas fa-road' },
      { nom: 'Avenue de la Liberté', type: 'Avenue commerciale', distance: '300m', largeur: '18m', etat: 'Bon', icon: 'fas fa-road' }
    ],
    grandsEspaces: [
      { nom: 'Parc Hassan II', type: 'Parc urbain', distance: '300m', superficie: '15 ha', icon: 'fas fa-tree' },
      { nom: 'Stade municipal', type: 'Équipement sportif', distance: '800m', superficie: '8 ha', icon: 'fas fa-futbol' },
      { nom: 'Cimetière Al Amana', type: 'Cimetière', distance: '1.2km', superficie: '25 ha', icon: 'fas fa-monument' },
      { nom: 'Zone industrielle', type: 'Zone d\'activité', distance: '2km', superficie: '120 ha', icon: 'fas fa-industry' },
      { nom: 'Aéroport Oujda', type: 'Infrastructure aéroportuaire', distance: '5km', superficie: '200 ha', icon: 'fas fa-plane' }
    ],
    coordonneesSommets: [
      { xLambert: 651234.56, yLambert: 372145.78, longitude: -1.908547, latitude: 34.681423, distanceSuivant: 15.67 },
      { xLambert: 651249.23, yLambert: 372158.45, longitude: -1.908432, latitude: 34.681534, distanceSuivant: 22.34 },
      { xLambert: 651270.67, yLambert: 372165.89, longitude: -1.908298, latitude: 34.681601, distanceSuivant: 18.90 },
      { xLambert: 651289.12, yLambert: 372170.23, longitude: -1.908156, latitude: 34.681640, distanceSuivant: 25.78 },
      { xLambert: 651314.89, yLambert: 372175.67, longitude: -1.907987, latitude: 34.681689, distanceSuivant: 19.45 }
    ],
    proprietaires: [
      {
        id: 1,
        nom: 'Rachid ALAOUI',
        cin: 'AB123456',
        adresse: 'Hay Qods, Rue 15, N°42',
        ville: 'Oujda',
        codePostal: '60000',
        quotePart: 60
      },
      {
        id: 2,
        nom: 'Fatima BENALI',
        cin: 'CD789123',
        adresse: 'Avenue Mohammed V, N°156',
        ville: 'Oujda',
        codePostal: '60000',
        quotePart: 40
      }
    ],
    evolutionTarifs: [
      { annee: 2024, tarif: 10.00, evolution: '+11.1%', evolutionClass: 'success', evolutionIcon: 'fas fa-arrow-up' },
      { annee: 2023, tarif: 9.00, evolution: '+12.5%', evolutionClass: 'info', evolutionIcon: 'fas fa-arrow-up' },
      { annee: 2022, tarif: 8.00, evolution: '0%', evolutionClass: 'secondary', evolutionIcon: 'fas fa-minus' }
    ],
    documents: [
      {
        id: 1,
        nom: 'Titre foncier',
        nomFichier: 'TF-456789_original.pdf',
        type: 'pdf',
        taille: 2400000,
        dateCreation: new Date('2024-01-10'),
        ajoutePar: 'admin.fiscal'
      },
      {
        id: 2,
        nom: 'Plan de situation',
        nomFichier: 'plan_situation_456789.jpg',
        type: 'jpg',
        taille: 1800000,
        dateCreation: new Date('2024-01-12'),
        ajoutePar: 'tech.sig'
      },
      {
        id: 3,
        nom: 'Procès-verbal de bornage',
        nomFichier: 'PV_bornage_456789.pdf',
        type: 'pdf',
        taille: 3200000,
        dateCreation: new Date('2024-03-15'),
        ajoutePar: 'geometre.expert'
      },
      {
        id: 4,
        nom: 'Coordonnées géodésiques',
        nomFichier: 'coords_456789.xlsx',
        type: 'xlsx',
        taille: 45000,
        dateCreation: new Date('2024-03-15'),
        ajoutePar: 'tech.sig'
      }
    ],
    historique: [
      {
        id: 1,
        date: new Date('2024-03-15T14:32:00'),
        utilisateur: 'tech.sig',
        roleUtilisateur: 'Technicien SIG',
        action: 'Publication',
        badgeClass: 'success',
        icon: 'fas fa-upload',
        champsModifies: ['statut: Validé → Publié', 'date_publication: null → 15/03/2024'],
        description: 'Validation finale et publication du rôle TNB',
        version: 'v1.3',
        type: 'publication'
      },
      {
        id: 2,
        date: new Date('2024-03-12T09:15:00'),
        utilisateur: 'agent.fiscal',
        roleUtilisateur: 'Agent fiscal',
        action: 'Validation',
        badgeClass: 'warning',
        icon: 'fas fa-check-circle',
        champsModifies: ['statut: Brouillon → Validé', 'date_validation: null → 12/03/2024'],
        description: 'Validation après contrôle des quote-parts',
        version: 'v1.2',
        type: 'validation'
      },
      {
        id: 3,
        date: new Date('2024-03-10T16:45:00'),
        utilisateur: 'tech.sig',
        roleUtilisateur: 'Technicien SIG',
        action: 'Modification',
        badgeClass: 'info',
        icon: 'fas fa-edit',
        champsModifies: ['geometrie: Mise à jour', 'surface_sig: 2450.00 → 2453.67', 'coordonnees: Recalculées'],
        description: 'Correction géométrie suite levé GPS-RTK',
        version: 'v1.1',
        type: 'modification'
      },
      {
        id: 4,
        date: new Date('2024-03-08T11:20:00'),
        utilisateur: 'admin.fiscal',
        roleUtilisateur: 'Administrateur',
        action: 'Propriétaires',
        badgeClass: 'secondary',
        icon: 'fas fa-users',
        champsModifies: ['proprietaires: Ajout indivision', 'quote_parts: 60% / 40%', 'tnb_repartie: Calculée'],
        description: 'Ajout du deuxième propriétaire (succession)',
        version: 'v1.0',
        type: 'proprietaires'
      },
      {
        id: 5,
        date: new Date('2024-03-05T08:30:00'),
        utilisateur: 'admin.fiscal',
        roleUtilisateur: 'Administrateur',
        action: 'Création',
        badgeClass: 'info',
        icon: 'fas fa-plus-circle',
        champsModifies: ['Création initiale', 'Toutes les données de base', 'Propriétaire unique'],
        description: 'Création de la parcelle suite immatriculation',
        version: 'v0.1',
        type: 'creation'
      }
    ],
    coefficientAbattement: 1.0,
    categorieFiscale: 'Terrain nu résidentiel',
    tauxRecouvrement: 100
  };

  loading = false;
  activeTab = 'overview';

  // Subject pour la destruction
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  // =====================================================
  // CYCLE DE VIE
  // =====================================================

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = +params['id'];
        if (id) {
          this.loadParcelleDetails(id);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================

  private loadParcelleDetails(id: number): void {
    this.loading = true;
    console.log('Chargement détails parcelle ID:', id);
    
    // Simulation du chargement
    setTimeout(() => {
      this.loading = false;
      this.showSuccess('Détails de la parcelle chargés');
    }, 1000);
  }

  // =====================================================
  // NAVIGATION ONGLETS
  // =====================================================

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // =====================================================
  // ACTIONS PARCELLE
  // =====================================================

  goBack(): void {
    this.router.navigate(['/parcelles']);
  }

  editParcelle(): void {
    this.router.navigate(['/parcelles/edit', this.parcelle.id]);
  }

  localiserParcelle(): void {
    this.router.navigate(['/parcelles/carte'], {
      queryParams: { 
        parcelle: this.parcelle.referenceFonciere,
        center: 'true'
      }
    });
  }

  // =====================================================
  // ACTIONS SPÉCIFIQUES
  // =====================================================

  editInformationsFoncieres(): void {
    this.showSuccess('Édition des informations foncières');
  }

  genererFichesPDF(): void {
    this.showSuccess('Génération des fiches PDF en cours...');
  }

  pleinEcran(): void {
    this.showSuccess('Mode plein écran activé');
  }

  exportCarte(): void {
    this.showSuccess('Export de la carte en cours...');
  }

  copierCoordonnees(): void {
    this.showSuccess('Coordonnées copiées dans le presse-papiers');
  }

  exportDXF(): void {
    this.showSuccess('Export DXF en cours...');
  }

  modifierProprietaires(): void {
    this.showSuccess('Modification des propriétaires');
  }

  recalculerTNB(): void {
    this.showSuccess('Recalcul de la TNB en cours...');
  }

  ajouterDocument(): void {
    this.showSuccess('Ajout de document');
  }

  telechargerDocument(doc: Document): void {
    this.showSuccess(`Téléchargement: ${doc.nom}`);
  }

  previewDocument(doc: Document): void {
    this.showSuccess(`Prévisualisation: ${doc.nom}`);
  }

  filtrerHistorique(): void {
    this.showSuccess('Filtrage de l\'historique');
  }

  exporterHistorique(): void {
    this.showSuccess('Export de l\'historique en cours...');
  }

  // =====================================================
  // CALCULS ET UTILITAIRES
  // =====================================================

  getTotalQuoteParts(): number {
    return this.parcelle?.proprietaires?.reduce((total, prop) => total + prop.quotePart, 0) || 100;
  }

  calculerTnbIndividuelle(quotePart: number): number {
    return (this.parcelle?.tnbCalculee || 0) * (quotePart / 100);
  }

  getOwnerCardColor(index: number): string {
    const colors = ['var(--success-color)', 'var(--info-color)'];
    return colors[index % colors.length];
  }

  getOwnerBadgeClass(index: number): string {
    const classes = ['success', 'info'];
    return classes[index % classes.length];
  }

  getOwnerTnbBackground(index: number): string {
    const backgrounds = ['rgba(5, 150, 105, 0.1)', 'rgba(14, 165, 233, 0.1)'];
    return backgrounds[index % backgrounds.length];
  }

  getDocumentColor(type: string): string {
    const colors: { [key: string]: string } = {
      'pdf': 'var(--success-color)',
      'jpg': 'var(--info-color)',
      'jpeg': 'var(--info-color)',
      'png': 'var(--info-color)',
      'xlsx': 'var(--gray-300)',
      'docx': 'var(--primary-color)'
    };
    return colors[type] || 'var(--gray-300)';
  }

  getDocumentIconBackground(type: string): string {
    const backgrounds: { [key: string]: string } = {
      'pdf': 'rgba(5, 150, 105, 0.1)',
      'jpg': 'rgba(14, 165, 233, 0.1)',
      'jpeg': 'rgba(14, 165, 233, 0.1)',
      'png': 'rgba(14, 165, 233, 0.1)',
      'xlsx': 'var(--gray-100)',
      'docx': 'rgba(30, 64, 175, 0.1)'
    };
    return backgrounds[type] || 'var(--gray-100)';
  }

  getFileIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'pdf': 'fa-file-pdf',
      'jpg': 'fa-file-image',
      'jpeg': 'fa-file-image',
      'png': 'fa-file-image',
      'xlsx': 'fa-file-excel',
      'docx': 'fa-file-word'
    };
    return icons[type] || 'fa-file';
  }

  getHistoryRowBackground(type: string): string {
    const backgrounds: { [key: string]: string } = {
      'publication': 'rgba(5, 150, 105, 0.05)',
      'creation': 'rgba(14, 165, 233, 0.05)'
    };
    return backgrounds[type] || '';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }

  getNombreUtilisateurs(): number {
    const utilisateurs = new Set(this.parcelle?.historique?.map(h => h.utilisateur) || []);
    return utilisateurs.size;
  }

  getJoursDepuisCreation(): number {
    if (!this.parcelle?.historique?.length) return 0;
    
    const creationDate = this.parcelle.historique[this.parcelle.historique.length - 1].date;
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays;
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 4000,
      panelClass: ['error-snackbar']
    });
  }
}