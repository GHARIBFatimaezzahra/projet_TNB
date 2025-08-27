// =====================================================
// COMPOSANT DÉTAIL PARCELLE - AFFICHAGE COMPLET
// =====================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

// Services
import { ParcelleService } from '../../services/parcelle.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserProfil } from '../../../../core/models/database.models';

// Models
import { Parcelle, ParcelleProprietaire, DocumentJoint, FicheFiscale, JournalAction } from '../../models/parcelle.models';

// Composants
import { ParcelleMapComponent } from '../map-components/parcelle-map/parcelle-map.component';
import { TaxCalculatorComponent } from '../fiscal/tax-calculator/tax-calculator.component';
import { ValidationSummaryComponent } from '../indivision/validation-summary/validation-summary.component';

// Pipes
import { SurfaceFormatPipe } from '../../pipes/surface-format.pipe';
import { ReferenceFoncierePipe } from '../../pipes/reference-fonciere.pipe';

@Component({
  selector: 'app-parcelle-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatBadgeModule,
    MatExpansionModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule,
    ParcelleMapComponent,
    TaxCalculatorComponent,
    ValidationSummaryComponent,
    SurfaceFormatPipe,
    ReferenceFoncierePipe
  ],
  templateUrl: './parcelle-detail.component.html',
  styleUrls: ['./parcelle-detail.component.scss']
})
export class ParcelleDetailComponent implements OnInit, OnDestroy {
  // État principal
  parcelle: Parcelle | null = null;
  parcelleId!: number;
  isLoading = true;
  selectedTabIndex = 0;
  
  // Vue spécifique (depuis les routes)
  specificView?: string;
  
  // Données associées
  proprietaires: ParcelleProprietaire[] = [];
  documents: DocumentJoint[] = [];
  fichesFiscales: FicheFiscale[] = [];
  journalActions: JournalAction[] = [];
  
  // État des données
  loadingProprietaires = false;
  loadingDocuments = false;
  loadingFiches = false;
  loadingJournal = false;
  
  // Configuration des onglets
  tabs = [
    { id: 'general', label: 'Général', icon: 'info' },
    { id: 'map', label: 'Cartographie', icon: 'map' },
    { id: 'proprietaires', label: 'Propriétaires', icon: 'group' },
    { id: 'fiscal', label: 'Fiscal', icon: 'account_balance' },
    { id: 'documents', label: 'Documents', icon: 'folder' },
    { id: 'history', label: 'Historique', icon: 'history' }
  ];
  
  // Colonnes des tables
  proprietairesColumns = ['nom', 'nature', 'cin_ou_rc', 'quote_part', 'montant_individuel', 'actions'];
  documentsColumns = ['nom_fichier', 'type_doc', 'taille_fichier', 'date_ajout', 'actions'];
  fichesColumns = ['code_unique', 'annee', 'montant_tnb', 'statut_payment', 'date_generation', 'actions'];
  journalColumns = ['action', 'date_heure', 'utilisateur', 'details'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parcelleService: ParcelleService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.parcelleId = +params['id'];
      this.loadParcelle();
    });
    
    // Récupérer la vue spécifique depuis les données de route
    this.specificView = this.route.snapshot.data['view'];
    if (this.specificView) {
      this.selectTabByView(this.specificView);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================

  private loadParcelle(): void {
    this.isLoading = true;
    
    this.parcelleService.getParcelleById(this.parcelleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (parcelle) => {
          this.parcelle = parcelle;
          this.isLoading = false;
          
          // Charger les données associées selon l'onglet actif
          this.loadAssociatedData();
        },
        error: (error: any) => {
          this.handleError('Erreur lors du chargement de la parcelle', error);
          this.isLoading = false;
        }
      });
  }

  private loadAssociatedData(): void {
    // Charger selon l'onglet sélectionné ou la vue spécifique
    const activeTab = this.tabs[this.selectedTabIndex]?.id || this.specificView;
    
    switch (activeTab) {
      case 'proprietaires':
        this.loadProprietaires();
        break;
      case 'documents':
        this.loadDocuments();
        break;
      case 'fiscal':
        this.loadFichesFiscales();
        break;
      case 'history':
        this.loadJournalActions();
        break;
    }
  }

  private loadProprietaires(): void {
    if (this.loadingProprietaires || this.proprietaires.length > 0) return;
    
    this.loadingProprietaires = true;
    
    this.parcelleService.getParcelleProprietaires(this.parcelleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (proprietaires) => {
          this.proprietaires = proprietaires;
          this.loadingProprietaires = false;
        },
        error: (error: any) => {
          this.handleError('Erreur lors du chargement des propriétaires', error);
          this.loadingProprietaires = false;
        }
      });
  }

  private loadDocuments(): void {
    if (this.loadingDocuments || this.documents.length > 0) return;
    
    this.loadingDocuments = true;
    
    this.parcelleService.getParcelleDocuments(this.parcelleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (documents) => {
          this.documents = documents;
          this.loadingDocuments = false;
        },
        error: (error: any) => {
          this.handleError('Erreur lors du chargement des documents', error);
          this.loadingDocuments = false;
        }
      });
  }

  private loadFichesFiscales(): void {
    if (this.loadingFiches || this.fichesFiscales.length > 0) return;
    
    this.loadingFiches = true;
    
    this.parcelleService.getParcelleFichesFiscales(this.parcelleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fiches: any) => {
          this.fichesFiscales = fiches;
          this.loadingFiches = false;
        },
        error: (error: any) => {
          this.handleError('Erreur lors du chargement des fiches fiscales', error);
          this.loadingFiches = false;
        }
      });
  }

  private loadJournalActions(): void {
    if (this.loadingJournal || this.journalActions.length > 0) return;
    
    this.loadingJournal = true;
    
    // Simulation de données pour le journal
    setTimeout(() => {
      this.journalActions = [
        {
          id: 1,
          action: 'creation',
          details: 'Création de la parcelle',
          utilisateur_id: 1,
          date_heure: new Date(),
          id_cible: this.parcelleId,
          table_cible: 'parcelle'
        }
      ];
      this.loadingJournal = false;
    }, 500);
  }

  // =====================================================
  // NAVIGATION ET ONGLETS
  // =====================================================

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
    this.loadAssociatedData();
  }

  private selectTabByView(view: string): void {
    const tabIndex = this.tabs.findIndex(tab => tab.id === view);
    if (tabIndex >= 0) {
      this.selectedTabIndex = tabIndex;
    }
  }

  // =====================================================
  // ACTIONS PRINCIPALES
  // =====================================================

  editParcelle(): void {
    if (!this.canEdit) {
      this.showError('Vous n\'avez pas les permissions pour modifier cette parcelle');
      return;
    }
    
    this.router.navigate(['/parcelles', this.parcelleId, 'edit']);
  }

  viewOnMap(): void {
    this.selectedTabIndex = this.tabs.findIndex(tab => tab.id === 'map');
  }

  duplicateParcelle(): void {
    if (!this.canCreate) {
      this.showError('Vous n\'avez pas les permissions pour créer une parcelle');
      return;
    }
    
    this.parcelleService.duplicateParcelle(this.parcelleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newParcelle) => {
          this.showSuccess('Parcelle dupliquée avec succès');
          this.router.navigate(['/parcelles', newParcelle.id, 'edit']);
        },
        error: (error: any) => {
          this.handleError('Erreur lors de la duplication', error);
        }
      });
  }

  deleteParcelle(): void {
    if (!this.canDelete) {
      this.showError('Vous n\'avez pas les permissions pour supprimer cette parcelle');
      return;
    }
    
    // Ouvrir dialog de confirmation
    // Implémentation simplifiée
    if (confirm(`Êtes-vous sûr de vouloir supprimer la parcelle ${this.parcelle?.reference_fonciere} ?`)) {
      this.parcelleService.deleteParcelle(this.parcelleId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Parcelle supprimée avec succès');
            this.router.navigate(['/parcelles']);
          },
          error: (error: any) => {
            this.handleError('Erreur lors de la suppression', error);
          }
        });
    }
  }

  // =====================================================
  // ACTIONS WORKFLOW
  // =====================================================

  validateParcelle(): void {
    if (!this.canValidate) {
      this.showError('Vous n\'avez pas les permissions pour valider cette parcelle');
      return;
    }
    
    this.executeWorkflowAction('validate', 'Validation de la parcelle');
  }

  publishParcelle(): void {
    if (!this.canPublish) {
      this.showError('Vous n\'avez pas les permissions pour publier cette parcelle');
      return;
    }
    
    this.executeWorkflowAction('publish', 'Publication de la parcelle');
  }

  archiveParcelle(): void {
    if (!this.canArchive) {
      this.showError('Vous n\'avez pas les permissions pour archiver cette parcelle');
      return;
    }
    
    this.executeWorkflowAction('archive', 'Archivage de la parcelle');
  }

  private executeWorkflowAction(action: string, actionLabel: string): void {
    this.parcelleService.executeWorkflowAction(this.parcelleId, {
      action,
      comment: `${actionLabel} effectuée depuis la vue détail`,
      userId: this.authService.currentUser?.id
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedParcelle) => {
          this.parcelle = updatedParcelle;
          this.showSuccess(`${actionLabel} effectuée avec succès`);
          
          // Recharger l'historique si affiché
          if (this.tabs[this.selectedTabIndex]?.id === 'history') {
            this.journalActions = [];
            this.loadJournalActions();
          }
        },
        error: (error: any) => {
          this.handleError(`Erreur lors de ${actionLabel.toLowerCase()}`, error);
        }
      });
  }

  // =====================================================
  // ACTIONS DOCUMENTS
  // =====================================================

  uploadDocument(): void {
    // Implémentation upload de document
    // Ouvrir dialog d'upload
  }

  downloadDocument(documentJoint: DocumentJoint): void {
    this.parcelleService.downloadDocument(documentJoint.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = documentJoint.nom_fichier;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          this.handleError('Erreur lors du téléchargement', error);
        }
      });
  }

  deleteDocument(document: DocumentJoint): void {
    if (confirm(`Supprimer le document ${document.nom_fichier} ?`)) {
      this.parcelleService.deleteDocument(document.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.documents = this.documents.filter(d => d.id !== document.id);
            this.showSuccess('Document supprimé');
          },
          error: (error: any) => {
            this.handleError('Erreur lors de la suppression du document', error);
          }
        });
    }
  }

  // =====================================================
  // ACTIONS FICHES FISCALES
  // =====================================================

  generateFiche(): void {
    if (!this.canGenerateFiche) {
      this.showError('Vous n\'avez pas les permissions pour générer une fiche fiscale');
      return;
    }
    
    this.parcelleService.generateFicheFiscale(this.parcelleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fiche) => {
          this.fichesFiscales = [fiche, ...this.fichesFiscales];
          this.showSuccess('Fiche fiscale générée avec succès');
        },
        error: (error: any) => {
          this.handleError('Erreur lors de la génération de la fiche', error);
        }
      });
  }

  downloadFiche(fiche: FicheFiscale): void {
    this.parcelleService.downloadFiche(fiche.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `fiche_${fiche.code_unique}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          this.handleError('Erreur lors du téléchargement de la fiche', error);
        }
      });
  }

  // =====================================================
  // PERMISSIONS ET ÉTAT
  // =====================================================

  get canEdit(): boolean {
    return this.parcelleService.canEditParcelle();
  }

  get canDelete(): boolean {
    return this.parcelleService.canDeleteParcelle();
  }

  get canCreate(): boolean {
    return this.parcelleService.canCreateParcelle();
  }

  get canValidate(): boolean {
    return this.parcelleService.canValidateParcelle() && 
           this.parcelle?.etat_validation === 'Brouillon';
  }

  get canPublish(): boolean {
    return this.parcelleService.canPublishParcelle() && 
           this.parcelle?.etat_validation === 'Valide';
  }

  get canArchive(): boolean {
    return this.parcelleService.canArchiveParcelle() && 
           this.parcelle?.etat_validation !== 'Archive';
  }

  get canGenerateFiche(): boolean {
    return this.authService.hasPermission(UserProfil.ADMIN, UserProfil.AGENT_FISCAL) &&
           this.parcelle?.etat_validation === 'Publie';
  }

  get parcelleStatus(): { label: string; color: string; icon: string } {
    if (!this.parcelle) return { label: '', color: '', icon: '' };
    
    switch (this.parcelle.etat_validation) {
      case 'Brouillon':
        return { label: 'Brouillon', color: 'warn', icon: 'edit' };
      case 'Valide':
        return { label: 'Validé', color: 'accent', icon: 'check_circle' };
      case 'Publie':
        return { label: 'Publié', color: 'primary', icon: 'public' };
      case 'Archive':
        return { label: 'Archivé', color: '', icon: 'archive' };
      default:
        return { label: this.parcelle.etat_validation, color: '', icon: 'help' };
    }
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getDocumentIcon(type: string): string {
    switch (type) {
      case 'Certificat': return 'verified';
      case 'Photo': return 'photo';
      case 'Requisition': return 'description';
      case 'Plan': return 'map';
      case 'Autorisation': return 'gavel';
      default: return 'insert_drive_file';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'CREATE': return 'add_circle';
      case 'UPDATE': return 'edit';
      case 'DELETE': return 'delete';
      case 'VALIDATE': return 'check_circle';
      case 'PUBLISH': return 'public';
      case 'ARCHIVE': return 'archive';
      default: return 'info';
    }
  }

  // =====================================================
  // GESTION D'ERREURS ET NOTIFICATIONS
  // =====================================================

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.showError(message);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}