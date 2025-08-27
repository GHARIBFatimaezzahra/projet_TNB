// =====================================================
// SERVICE DOCUMENTS - GESTION DES DOCUMENTS PARCELLES
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// Modèles
export interface DocumentJoint {
  id: number;
  parcelle_id: number;
  nom_fichier: string;
  nom_original: string;
  type_document: TypeDocument;
  taille_fichier: number;
  chemin_fichier: string;
  description?: string;
  date_upload: Date;
  uploade_par: number;
  est_actif: boolean;
}

export enum TypeDocument {
  TITRE_FONCIER = 'TITRE_FONCIER',
  PLAN_TOPOGRAPHIQUE = 'PLAN_TOPOGRAPHIQUE',
  PERMIS_CONSTRUIRE = 'PERMIS_CONSTRUIRE',
  CERTIFICAT_PROPRIETE = 'CERTIFICAT_PROPRIETE',
  CONTRAT_VENTE = 'CONTRAT_VENTE',
  ACTE_SUCCESSION = 'ACTE_SUCCESSION',
  PHOTO_TERRAIN = 'PHOTO_TERRAIN',
  RAPPORT_EXPERTISE = 'RAPPORT_EXPERTISE',
  AUTRE = 'AUTRE'
}

export interface UploadDocumentDto {
  parcelle_id: number;
  type_document: TypeDocument;
  description?: string;
  file: File;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  
  private apiUrl = `${environment.apiUrl}/documents`;
  private documentsSubject = new BehaviorSubject<DocumentJoint[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  // Observables publics
  public documents$ = this.documentsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  
  constructor(private http: HttpClient) {}
  
  // =====================================================
  // GESTION DES DOCUMENTS
  // =====================================================
  
  /**
   * Récupérer tous les documents d'une parcelle
   */
  getDocumentsByParcelle(parcelleId: number): Observable<DocumentJoint[]> {
    console.log(`📄 Chargement des documents pour la parcelle ${parcelleId}`);
    this.setLoading(true);
    
    // TEMPORAIRE: Données mockées
    const mockDocuments: DocumentJoint[] = [
      {
        id: 1,
        parcelle_id: parcelleId,
        nom_fichier: 'titre_foncier_001.pdf',
        nom_original: 'Titre Foncier Parcelle R-123789-A.pdf',
        type_document: TypeDocument.TITRE_FONCIER,
        taille_fichier: 2048576, // 2MB
        chemin_fichier: '/uploads/documents/titre_foncier_001.pdf',
        description: 'Titre foncier officiel de la parcelle',
        date_upload: new Date('2024-01-15'),
        uploade_par: 1,
        est_actif: true
      },
      {
        id: 2,
        parcelle_id: parcelleId,
        nom_fichier: 'plan_topo_001.dwg',
        nom_original: 'Plan Topographique Détaillé.dwg',
        type_document: TypeDocument.PLAN_TOPOGRAPHIQUE,
        taille_fichier: 5242880, // 5MB
        chemin_fichier: '/uploads/documents/plan_topo_001.dwg',
        description: 'Plan topographique avec délimitations',
        date_upload: new Date('2024-01-16'),
        uploade_par: 1,
        est_actif: true
      }
    ];
    
    this.setLoading(false);
    this.documentsSubject.next(mockDocuments);
    return of(mockDocuments);
  }
  
  /**
   * Upload d'un nouveau document
   */
  uploadDocument(uploadDto: UploadDocumentDto): Observable<DocumentJoint> {
    console.log('📤 Upload de document:', uploadDto);
    this.setLoading(true);
    
    const formData = new FormData();
    formData.append('file', uploadDto.file);
    formData.append('parcelle_id', uploadDto.parcelle_id.toString());
    formData.append('type_document', uploadDto.type_document);
    if (uploadDto.description) {
      formData.append('description', uploadDto.description);
    }
    
    // TEMPORAIRE: Simulation d'upload
    const mockDocument: DocumentJoint = {
      id: Date.now(),
      parcelle_id: uploadDto.parcelle_id,
      nom_fichier: `doc_${Date.now()}.${uploadDto.file.name.split('.').pop()}`,
      nom_original: uploadDto.file.name,
      type_document: uploadDto.type_document,
      taille_fichier: uploadDto.file.size,
      chemin_fichier: `/uploads/documents/doc_${Date.now()}.${uploadDto.file.name.split('.').pop()}`,
      description: uploadDto.description,
      date_upload: new Date(),
      uploade_par: 1,
      est_actif: true
    };
    
    // Ajouter à la liste locale
    const currentDocs = this.documentsSubject.value;
    this.documentsSubject.next([...currentDocs, mockDocument]);
    
    this.setLoading(false);
    return of(mockDocument);
    
    // Code réel pour l'API (à utiliser plus tard)
    /*
    return this.http.post<DocumentJoint>(`${this.apiUrl}/upload`, formData)
      .pipe(
        tap(document => {
          const currentDocs = this.documentsSubject.value;
          this.documentsSubject.next([...currentDocs, document]);
          this.setLoading(false);
        }),
        catchError(this.handleError)
      );
    */
  }
  
  /**
   * Télécharger un document
   */
  downloadDocument(documentId: number): Observable<Blob> {
    console.log(`⬇️ Téléchargement du document ${documentId}`);
    
    return this.http.get(`${this.apiUrl}/${documentId}/download`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Supprimer un document
   */
  deleteDocument(documentId: number): Observable<boolean> {
    console.log(`🗑️ Suppression du document ${documentId}`);
    this.setLoading(true);
    
    // TEMPORAIRE: Simulation de suppression
    const currentDocs = this.documentsSubject.value;
    const updatedDocs = currentDocs.filter(doc => doc.id !== documentId);
    this.documentsSubject.next(updatedDocs);
    
    this.setLoading(false);
    return of(true);
    
    // Code réel pour l'API (à utiliser plus tard)
    /*
    return this.http.delete<boolean>(`${this.apiUrl}/${documentId}`)
      .pipe(
        tap(() => {
          const currentDocs = this.documentsSubject.value;
          const updatedDocs = currentDocs.filter(doc => doc.id !== documentId);
          this.documentsSubject.next(updatedDocs);
          this.setLoading(false);
        }),
        catchError(this.handleError)
      );
    */
  }
  
  /**
   * Mettre à jour un document
   */
  updateDocument(documentId: number, updateData: Partial<DocumentJoint>): Observable<DocumentJoint> {
    console.log(`✏️ Mise à jour du document ${documentId}:`, updateData);
    this.setLoading(true);
    
    return this.http.put<DocumentJoint>(`${this.apiUrl}/${documentId}`, updateData)
      .pipe(
        tap(updatedDocument => {
          const currentDocs = this.documentsSubject.value;
          const updatedDocs = currentDocs.map(doc => 
            doc.id === documentId ? updatedDocument : doc
          );
          this.documentsSubject.next(updatedDocs);
          this.setLoading(false);
        }),
        catchError(this.handleError)
      );
  }
  
  // =====================================================
  // UTILITAIRES
  // =====================================================
  
  /**
   * Obtenir l'icône pour un type de document
   */
  getDocumentIcon(type: TypeDocument): string {
    switch (type) {
      case TypeDocument.TITRE_FONCIER: return 'description';
      case TypeDocument.PLAN_TOPOGRAPHIQUE: return 'map';
      case TypeDocument.PERMIS_CONSTRUIRE: return 'construction';
      case TypeDocument.CERTIFICAT_PROPRIETE: return 'verified';
      case TypeDocument.CONTRAT_VENTE: return 'handshake';
      case TypeDocument.ACTE_SUCCESSION: return 'family_restroom';
      case TypeDocument.PHOTO_TERRAIN: return 'photo_camera';
      case TypeDocument.RAPPORT_EXPERTISE: return 'assessment';
      default: return 'insert_drive_file';
    }
  }
  
  /**
   * Obtenir le libellé d'un type de document
   */
  getDocumentTypeLabel(type: TypeDocument): string {
    switch (type) {
      case TypeDocument.TITRE_FONCIER: return 'Titre Foncier';
      case TypeDocument.PLAN_TOPOGRAPHIQUE: return 'Plan Topographique';
      case TypeDocument.PERMIS_CONSTRUIRE: return 'Permis de Construire';
      case TypeDocument.CERTIFICAT_PROPRIETE: return 'Certificat de Propriété';
      case TypeDocument.CONTRAT_VENTE: return 'Contrat de Vente';
      case TypeDocument.ACTE_SUCCESSION: return 'Acte de Succession';
      case TypeDocument.PHOTO_TERRAIN: return 'Photo du Terrain';
      case TypeDocument.RAPPORT_EXPERTISE: return 'Rapport d\'Expertise';
      default: return 'Autre Document';
    }
  }
  
  /**
   * Formater la taille de fichier
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Vérifier si un type de fichier est accepté
   */
  isFileTypeAccepted(file: File, acceptedTypes: string[]): boolean {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return acceptedTypes.some(type => 
      type.includes(fileExtension || '') || 
      file.type.includes(type.replace('*', ''))
    );
  }
  
  // =====================================================
  // MÉTHODES PRIVÉES
  // =====================================================
  
  /**
   * Définir l'état de chargement
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }
  
  /**
   * Gestion des erreurs
   */
  private handleError = (error: any): Observable<never> => {
    console.error('Erreur dans DocumentService:', error);
    this.setLoading(false);
    
    let errorMessage = 'Une erreur est survenue lors de la gestion du document';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  };
}
