// =====================================================
// COMPOSANT GESTION DOCUMENTS - UPLOAD ET LISTE
// =====================================================

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services et modèles
import { DocumentService, DocumentJoint, TypeDocument, UploadDocumentDto } from '../../services/document.service';

@Component({
  selector: 'app-document-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './document-manager.component.html',
  styleUrls: ['./document-manager.component.scss']
})
export class DocumentManagerComponent implements OnInit, OnDestroy {

  // =====================================================
  // PROPRIÉTÉS
  // =====================================================

  @Input() parcelleId!: number;
  
  documents: DocumentJoint[] = [];
  loading = false;
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  
  // Types de documents disponibles
  documentTypes = Object.values(TypeDocument);
  
  // Types de fichiers acceptés
  acceptedFileTypes = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', 
    '.jpg', '.jpeg', '.png', '.gif',
    '.dwg', '.dxf', '.zip', '.rar'
  ];
  
  private destroy$ = new Subject<void>();

  // =====================================================
  // CONSTRUCTEUR
  // =====================================================

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.uploadForm = this.createUploadForm();
  }

  // =====================================================
  // CYCLE DE VIE
  // =====================================================

  ngOnInit(): void {
    this.loadDocuments();
    this.subscribeToServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private createUploadForm(): FormGroup {
    return this.fb.group({
      type_document: ['', Validators.required],
      description: [''],
      file: [null, Validators.required]
    });
  }

  private subscribeToServices(): void {
    // Écouter les changements de documents
    this.documentService.documents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(documents => {
        this.documents = documents;
      });

    // Écouter l'état de chargement
    this.documentService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });
  }

  // =====================================================
  // GESTION DES DOCUMENTS
  // =====================================================

  /**
   * Charger les documents de la parcelle
   */
  private loadDocuments(): void {
    if (this.parcelleId) {
      this.documentService.getDocumentsByParcelle(this.parcelleId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('📄 Documents chargés avec succès');
          },
          error: (error) => {
            console.error('❌ Erreur lors du chargement des documents:', error);
            this.showError('Erreur lors du chargement des documents');
          }
        });
    }
  }

  /**
   * Sélection de fichier
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.showError('Le fichier ne peut pas dépasser 10MB');
        return;
      }

      // Vérifier le type
      if (!this.documentService.isFileTypeAccepted(file, this.acceptedFileTypes)) {
        this.showError('Type de fichier non accepté');
        return;
      }

      this.selectedFile = file;
      this.uploadForm.patchValue({ file: file });
      console.log('📎 Fichier sélectionné:', file.name);
    }
  }

  /**
   * Upload d'un document
   */
  onUpload(): void {
    if (this.uploadForm.valid && this.selectedFile && this.parcelleId) {
      const uploadDto: UploadDocumentDto = {
        parcelle_id: this.parcelleId,
        type_document: this.uploadForm.value.type_document,
        description: this.uploadForm.value.description,
        file: this.selectedFile
      };

      this.documentService.uploadDocument(uploadDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (document) => {
            console.log('✅ Document uploadé avec succès:', document);
            this.showSuccess('Document ajouté avec succès');
            this.resetForm();
          },
          error: (error) => {
            console.error('❌ Erreur lors de l\'upload:', error);
            this.showError('Erreur lors de l\'ajout du document');
          }
        });
    } else {
      this.showError('Veuillez remplir tous les champs requis');
    }
  }

  /**
   * Télécharger un document
   */
  downloadDocument(doc: DocumentJoint): void {
    console.log('⬇️ Téléchargement du document:', doc.nom_original);
    
    this.documentService.downloadDocument(doc.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          // Créer un lien de téléchargement
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.nom_original;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('❌ Erreur lors du téléchargement:', error);
          this.showError('Erreur lors du téléchargement');
        }
      });
  }

  /**
   * Supprimer un document
   */
  deleteDocument(doc: DocumentJoint): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${doc.nom_original}" ?`)) {
      this.documentService.deleteDocument(doc.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('🗑️ Document supprimé avec succès');
            this.showSuccess('Document supprimé avec succès');
          },
          error: (error) => {
            console.error('❌ Erreur lors de la suppression:', error);
            this.showError('Erreur lors de la suppression');
          }
        });
    }
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  /**
   * Obtenir l'icône d'un document
   */
  getDocumentIcon(type: TypeDocument): string {
    return this.documentService.getDocumentIcon(type);
  }

  /**
   * Obtenir le libellé d'un type de document
   */
  getDocumentTypeLabel(type: TypeDocument): string {
    return this.documentService.getDocumentTypeLabel(type);
  }

  /**
   * Formater la taille d'un fichier
   */
  formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }

  /**
   * Obtenir la couleur d'un type de document
   */
  getDocumentTypeColor(type: TypeDocument): string {
    switch (type) {
      case TypeDocument.TITRE_FONCIER: return 'primary';
      case TypeDocument.PLAN_TOPOGRAPHIQUE: return 'accent';
      case TypeDocument.PERMIS_CONSTRUIRE: return 'warn';
      default: return 'primary';
    }
  }

  /**
   * Réinitialiser le formulaire
   */
  resetForm(): void {
    this.uploadForm.reset();
    this.selectedFile = null;
    
    // Réinitialiser l'input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Afficher un message de succès
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Afficher un message d'erreur
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * TrackBy function pour optimiser le rendu de la liste
   */
  trackByDocumentId(index: number, doc: DocumentJoint): number {
    return doc.id;
  }
}
