// =====================================================
// COMPOSANT FICHE DÉTAILLÉE PARCELLE - INTERFACE COMPLÈTE
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

// Interfaces
export interface ParcelleDetail {
  id: number;
  reference: string;
  proprietaire: string;
  zone: string;
  statut: string;
  surface: number;
  surfaceImposable: number;
  tnb: number;
  statutFoncier: string;
  statutOccupation: string;
  adresse: string;
  secteur: string;
  coordonnees: string;
  perimetre: number;
  formeGeometrique: string;
  prixUnitaire: number;
  coefficientAbattement: number;
  anneeFiscale: number;
  exonere: boolean;
  dateExoneration?: Date;
  dureeExoneration?: number;
  motifExoneration?: string;
  proprietaires: Proprietaire[];
  geometry: GeometryInfo;
  documents: Document[];
  historique: HistoryEntry[];
}

export interface Proprietaire {
  id: number;
  nom: string;
  prenom: string;
  type: 'physique' | 'morale';
  cin?: string;
  rc?: string;
  adresse?: string;
  telephone?: string;
  quotePart: number;
}

export interface GeometryInfo {
  nombrePoints: number;
  centroide: { x: number; y: number };
  valide: boolean;
}

export interface Document {
  id: number;
  nom: string;
  type: string;
  taille: string;
  dateAjout: Date;
}

export interface HistoryEntry {
  id: number;
  date: Date;
  action: string;
  details: string;
  type: string;
  utilisateur: string;
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
    MatSnackBarModule
  ],
  templateUrl: './parcelle-detail.component.html',
  styleUrls: ['./parcelle-detail.component.scss']
})
export class ParcelleDetailComponent implements OnInit, OnDestroy {

  // =====================================================
  // PROPRIÉTÉS
  // =====================================================

  parcelleDetails: ParcelleDetail = {
    id: 1,
    reference: 'TF-478923-B',
    proprietaire: 'ALAMI Mohammed, BENALI Fatima',
    zone: 'R+4',
    statut: 'VALIDE',
    surface: 1250.75,
    surfaceImposable: 1180.50,
    tnb: 15680,
    statutFoncier: 'TF - Titre Foncier',
    statutOccupation: 'Terrain nu',
    adresse: 'Avenue Hassan II, Secteur 12',
    secteur: 'Nord-Est',
    coordonnees: '34.6814° N, 1.9086° W',
    perimetre: 142.35,
    formeGeometrique: 'Polygone irrégulier',
    prixUnitaire: 180,
    coefficientAbattement: 15,
    anneeFiscale: 2024,
    exonere: false,
    proprietaires: [
      {
        id: 1,
        nom: 'ALAMI',
        prenom: 'Mohammed',
        type: 'physique',
        cin: 'BE123456',
        adresse: 'Rue Al Andalous, Oujda',
        telephone: '0661234567',
        quotePart: 60
      },
      {
        id: 2,
        nom: 'BENALI',
        prenom: 'Fatima',
        type: 'physique',
        cin: 'BE789012',
        adresse: 'Avenue Mohammed V, Oujda',
        telephone: '0662345678',
        quotePart: 40
      }
    ],
    geometry: {
      nombrePoints: 5,
      centroide: { x: 524802.78, y: 385713.48 },
      valide: true
    },
    documents: [
      {
        id: 1,
        nom: 'Titre_Foncier_TF478923B.pdf',
        type: 'titre-foncier',
        taille: '2.4 MB',
        dateAjout: new Date('2024-01-15')
      },
      {
        id: 2,
        nom: 'Plan_Parcellaire_2024.dwg',
        type: 'plan',
        taille: '5.1 MB',
        dateAjout: new Date('2024-02-20')
      },
      {
        id: 3,
        nom: 'Certificat_Urbanisme.pdf',
        type: 'certificat',
        taille: '1.8 MB',
        dateAjout: new Date('2024-03-10')
      }
    ],
    historique: [
      {
        id: 1,
        date: new Date('2024-03-15T14:30:00'),
        action: 'Validation parcelle',
        details: 'Parcelle validée et prête pour publication',
        type: 'validated',
        utilisateur: 'Ahmed BENNANI'
      },
      {
        id: 2,
        date: new Date('2024-02-28T09:15:00'),
        action: 'Modification surface',
        details: 'Surface mise à jour de 1230.45 m² à 1250.75 m²',
        type: 'updated',
        utilisateur: 'Fatima LAHLOU'
      },
      {
        id: 3,
        date: new Date('2024-01-15T16:45:00'),
        action: 'Création parcelle',
        details: 'Création initiale de la parcelle avec import géométrie',
        type: 'created',
        utilisateur: 'Mohammed TAZI'
      }
    ]
  };

  loading = false;
  activeTab = 'general';

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

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  // =====================================================
  // ACTIONS PARCELLE
  // =====================================================

  retourListe(): void {
    this.router.navigate(['/parcelles']);
  }

  editParcel(): void {
    this.router.navigate(['/parcelles/edit', this.parcelleDetails.id]);
  }

  editGeometry(): void {
    this.router.navigate(['/parcelles/geometry', this.parcelleDetails.id]);
  }

  viewOnMap(): void {
    this.router.navigate(['/parcelles/carte'], {
      queryParams: { 
        parcelle: this.parcelleDetails.reference,
        center: 'true'
      }
    });
  }

  generateFicheTNB(): void {
    this.showSuccess('Génération de la fiche TNB en cours...');
    // TODO: Implémenter la génération de fiche TNB
  }

  genererFicheTnb(): void {
    this.generateFicheTNB();
  }

  modifierParcelle(): void {
    this.router.navigate(['/parcelles/edit', this.parcelleDetails.id]);
  }

  voirSurCarte(): void {
    this.router.navigate(['/parcelles/sig'], { 
      queryParams: { parcelleId: this.parcelleDetails.id } 
    });
  }

  imprimerDetails(): void {
    window.print();
  }

  changerStatut(): void {
    this.showSuccess('Changement de statut en cours...');
    // TODO: Implémenter le changement de statut
  }

  archiverParcelle(): void {
    if (confirm('Êtes-vous sûr de vouloir archiver cette parcelle ?')) {
      this.showSuccess('Parcelle archivée avec succès');
      // TODO: Implémenter l'archivage
    }
  }

  ajouterDocument(): void {
    this.showSuccess('Ouverture du formulaire d\'ajout de document...');
    // TODO: Ouvrir modal d'ajout de document
  }

  printParcel(): void {
    this.showSuccess('Impression en cours...');
    // TODO: Implémenter l'impression
  }

  shareParcel(): void {
    this.showSuccess('Lien de partage copié');
    // TODO: Implémenter le partage
  }

  // =====================================================
  // GESTION PROPRIÉTAIRES
  // =====================================================

  addProprietaire(): void {
    this.showSuccess('Formulaire d\'ajout de propriétaire');
    // TODO: Ouvrir modal d'ajout de propriétaire
  }

  editProprietaire(index: number): void {
    const prop = this.parcelleDetails.proprietaires[index];
    this.showSuccess(`Édition propriétaire: ${prop.nom} ${prop.prenom}`);
    // TODO: Ouvrir modal d'édition
  }

  deleteProprietaire(index: number): void {
    const prop = this.parcelleDetails.proprietaires[index];
    if (confirm(`Supprimer le propriétaire ${prop.nom} ${prop.prenom} ?`)) {
      this.parcelleDetails.proprietaires.splice(index, 1);
      this.showSuccess('Propriétaire supprimé');
    }
  }

  calculateQuoteAmount(quotePart: number): number {
    return (this.parcelleDetails.tnb * quotePart) / 100;
  }

  getTotalQuotes(): number {
    return this.parcelleDetails.proprietaires.reduce((total, prop) => total + prop.quotePart, 0);
  }

  getTotalQuotesClass(): string {
    const total = this.getTotalQuotes();
    if (total === 100) return 'success';
    if (total < 100) return 'warning';
    return 'error';
  }

  // =====================================================
  // GESTION DOCUMENTS
  // =====================================================

  uploadDocument(): void {
    this.showSuccess('Sélection de document à télécharger...');
    // TODO: Implémenter l'upload de document
  }

  viewDocument(doc: Document): void {
    this.showSuccess(`Ouverture du document: ${doc.nom}`);
    // TODO: Ouvrir le document
  }

  downloadDocument(doc: Document): void {
    this.showSuccess(`Téléchargement: ${doc.nom}`);
    // TODO: Télécharger le document
  }

  deleteDocument(doc: Document): void {
    if (confirm(`Supprimer le document ${doc.nom} ?`)) {
      const index = this.parcelleDetails.documents.findIndex(d => d.id === doc.id);
      if (index > -1) {
        this.parcelleDetails.documents.splice(index, 1);
        this.showSuccess('Document supprimé');
      }
    }
  }

  exportGeometry(): void {
    this.showSuccess('Export de la géométrie en cours...');
    // TODO: Implémenter l'export de géométrie
  }

  // =====================================================
  // CALCULS FISCAUX
  // =====================================================

  getMontantBrut(): number {
    return this.parcelleDetails.surfaceImposable * this.parcelleDetails.prixUnitaire;
  }

  getAbattement(): number {
    return (this.getMontantBrut() * this.parcelleDetails.coefficientAbattement) / 100;
  }

  getCalculatedPercentage(): number {
    return Math.round((this.parcelleDetails.surfaceImposable / this.parcelleDetails.surface) * 100);
  }

  // =====================================================
  // MÉTHODES D'AFFICHAGE
  // =====================================================

  getStatusBadgeClass(statut: string): string {
    switch (statut.toUpperCase()) {
      case 'VALIDE':
        return 'success';
      case 'PUBLIE':
        return 'info';
      case 'BROUILLON':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  getDocumentIcon(type: string): string {
    switch (type) {
      case 'titre-foncier':
        return 'article';
      case 'plan':
        return 'engineering';
      case 'certificat':
        return 'verified';
      case 'photo':
        return 'photo';
      default:
        return 'description';
    }
  }

  getDocumentColor(type: string): string {
    switch (type) {
      case 'titre-foncier':
        return '#ef4444';
      case 'plan':
        return '#3b82f6';
      case 'certificat':
        return '#10b981';
      case 'photo':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  }

  getDocumentTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'titre-foncier': 'Titre foncier',
      'plan': 'Plan technique',
      'certificat': 'Certificat',
      'photo': 'Photographie'
    };
    return labels[type] || 'Document';
  }

  getHistoryIcon(type: string): string {
    switch (type) {
      case 'created':
        return 'add_circle';
      case 'updated':
        return 'edit';
      case 'validated':
        return 'check_circle';
      case 'published':
        return 'publish';
      default:
        return 'history';
    }
  }

  getHistoryMarkerClass(type: string): string {
    return type;
  }

  // =====================================================
  // MÉTHODES DE FORMATAGE
  // =====================================================

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatCoordinate(value: number): string {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
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