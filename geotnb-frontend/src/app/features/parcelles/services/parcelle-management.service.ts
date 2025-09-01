// =====================================================
// SERVICE COMPLET DE GESTION DES PARCELLES
// =====================================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, delay, tap } from 'rxjs/operators';
import { Parcelle, EtatValidation, StatutFoncier, StatutOccupation } from '../../../core/models/database.models';

export interface ParcelleFilter {
  search?: string;
  statut?: EtatValidation | 'ALL';
  zone?: string | 'ALL';
  proprietaire?: string;
}

export interface ParcelleListItem {
  id: number;
  reference: string;
  proprietaires: string;
  surface: number;
  zone: string;
  montantTnb: number;
  etat: EtatValidation;
  selected?: boolean;
}

export interface ParcelleDetails {
  parcelle: Parcelle;
  proprietaires: any[];
  documents: any[];
  historique: any[];
  coordonnees: { latitude: number; longitude: number };
}

@Injectable({
  providedIn: 'root'
})
export class ParcelleManagementService {

  // =====================================================
  // ÉTAT DE L'APPLICATION
  // =====================================================

  private parcellesSubject = new BehaviorSubject<ParcelleListItem[]>([]);
  private selectedParcellesSubject = new BehaviorSubject<number[]>([]);
  private filtersSubject = new BehaviorSubject<ParcelleFilter>({});
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Observables publics
  public parcelles$ = this.parcellesSubject.asObservable();
  public selectedParcelles$ = this.selectedParcellesSubject.asObservable();
  public filters$ = this.filtersSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  // =====================================================
  // DONNÉES MOCK POUR DÉMONSTRATION
  // =====================================================

  private mockParcelles: ParcelleListItem[] = [
    {
      id: 1,
      reference: 'TF-478923-B',
      proprietaires: 'ALAMI Mohammed et 2 autres',
      surface: 1250.75,
      zone: 'R+4',
      montantTnb: 5603.75,
      etat: EtatValidation.VALIDE
    },
    {
      id: 2,
      reference: 'R-789456-C',
      proprietaires: 'SARL IMMOBILIER MODERNE',
      surface: 2450.00,
      zone: 'COM',
      montantTnb: 24500.00,
      etat: EtatValidation.PUBLIE
    },
    {
      id: 3,
      reference: 'TF-123789-A',
      proprietaires: 'BENJELLOUN Ahmed',
      surface: 850.25,
      zone: 'R+2',
      montantTnb: 2550.75,
      etat: EtatValidation.BROUILLON
    }
  ];

  private mockProprietaires = [
    {
      id: 1,
      nom: 'ALAMI',
      prenom: 'Mohammed',
      cin: 'PA123456',
      type: 'physique',
      quotePart: 50
    },
    {
      id: 2,
      nom: 'SARL ATLAS CONSTRUCTION',
      rc: '45789',
      type: 'morale',
      quotePart: 30
    },
    {
      id: 3,
      nom: 'BENALI',
      prenom: 'Fatima',
      cin: 'M456789',
      type: 'physique',
      quotePart: 20
    }
  ];

  private mockDocuments = [
    {
      id: 1,
      nom: 'Certificat_Propriete_TF478923.pdf',
      type: 'CERTIFICAT',
      taille: '3.2 MB',
      dateCreation: '15 Nov 2024',
      statut: 'VALIDE'
    },
    {
      id: 2,
      nom: 'Plan_Topographique_Detaille.dwg',
      type: 'PLAN',
      taille: '15.4 MB',
      dateCreation: '10 Nov 2024',
      statut: 'VALIDE'
    },
    {
      id: 3,
      nom: 'Requisition_Immatriculation.pdf',
      type: 'REQUISITION',
      taille: '4.1 MB',
      dateCreation: 'En cours...',
      statut: 'UPLOAD'
    }
  ];

  constructor() {
    // Initialiser avec les données mock
    this.parcellesSubject.next(this.mockParcelles);
  }

  // =====================================================
  // GESTION DE LA LISTE DES PARCELLES
  // =====================================================

  loadParcelles(filters?: ParcelleFilter): Observable<ParcelleListItem[]> {
    this.loadingSubject.next(true);
    
    return of(this.mockParcelles).pipe(
      delay(500), // Simuler un appel API
      map(parcelles => {
        if (!filters) return parcelles;
        
        return parcelles.filter(parcelle => {
          // Filtre par recherche
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = 
              parcelle.reference.toLowerCase().includes(searchLower) ||
              parcelle.proprietaires.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;
          }
          
          // Filtre par statut
          if (filters.statut && filters.statut !== 'ALL') {
            if (parcelle.etat !== filters.statut) return false;
          }
          
          // Filtre par zone
          if (filters.zone && filters.zone !== 'ALL') {
            if (parcelle.zone !== filters.zone) return false;
          }
          
          return true;
        });
      }),
      tap(filteredParcelles => {
        this.parcellesSubject.next(filteredParcelles);
        this.loadingSubject.next(false);
      })
    );
  }

  // =====================================================
  // GESTION DES FILTRES
  // =====================================================

  updateFilters(filters: ParcelleFilter): void {
    this.filtersSubject.next(filters);
    this.loadParcelles(filters).subscribe();
  }

  resetFilters(): void {
    const emptyFilters: ParcelleFilter = {};
    this.filtersSubject.next(emptyFilters);
    this.loadParcelles().subscribe();
  }

  // =====================================================
  // GESTION DE LA SÉLECTION
  // =====================================================

  toggleParcelleSelection(id: number): void {
    const currentSelected = this.selectedParcellesSubject.value;
    const index = currentSelected.indexOf(id);
    
    if (index > -1) {
      // Désélectionner
      currentSelected.splice(index, 1);
    } else {
      // Sélectionner
      currentSelected.push(id);
    }
    
    this.selectedParcellesSubject.next([...currentSelected]);
  }

  selectAllParcelles(): void {
    const allIds = this.parcellesSubject.value.map(p => p.id);
    this.selectedParcellesSubject.next(allIds);
  }

  clearSelection(): void {
    this.selectedParcellesSubject.next([]);
  }

  // =====================================================
  // ACTIONS SUR LES PARCELLES
  // =====================================================

  getParcelleDetails(id: number): Observable<ParcelleDetails> {
    this.loadingSubject.next(true);
    
    return of({
      parcelle: {
        id: id,
        reference_fonciere: 'TF-478923-B',
        surface_totale: 1250.75,
        surface_imposable: 1120.50,
        statut_foncier: StatutFoncier.TF,
        statut_occupation: StatutOccupation.NU,
        zonage: 'R+4 - Résidentiel 4 étages',
        categorie_fiscale: 'Résidentiel',
        prix_unitaire_m2: 5.00,
        montant_total_tnb: 5603.75,
        exonere_tnb: false,
        date_permis: undefined,
        duree_exoneration: 0,
        etat_validation: EtatValidation.VALIDE,
        geometry: {
          type: 'Polygon',
          coordinates: [[[524750, 385642], [524760, 385642], [524760, 385652], [524750, 385652], [524750, 385642]]]
        },
        date_creation: new Date().toISOString(),
        date_modification: new Date().toISOString(),
        derniere_mise_a_jour: new Date().toISOString(),
        version: 1
      } as Parcelle,
      proprietaires: this.mockProprietaires,
      documents: this.mockDocuments,
      historique: [
        {
          date: '15 Nov 2024 14:23',
          action: 'Surface imposable modifiée',
          details: 'Par mohammed.alami : 1.100,50 → 1.120,50 m²',
          utilisateur: 'mohammed.alami'
        }
      ],
      coordonnees: { latitude: 33.5731, longitude: -7.5898 }
    }).pipe(
      delay(300),
      tap(() => this.loadingSubject.next(false))
    );
  }

  exportToExcel(): Observable<Blob> {
    // Simuler l'export Excel
    return of(new Blob(['Export Excel simulé'], { type: 'application/vnd.ms-excel' })).pipe(
      delay(1000)
    );
  }

  // =====================================================
  // ACTIONS GROUPÉES
  // =====================================================

  executeGroupAction(action: string, parcelleIds: number[]): Observable<any> {
    this.loadingSubject.next(true);
    
    return of({ success: true, message: `Action "${action}" exécutée sur ${parcelleIds.length} parcelle(s)` }).pipe(
      delay(1000),
      tap(() => {
        this.loadingSubject.next(false);
        this.clearSelection();
      })
    );
  }

  // =====================================================
  // GESTION DES DOCUMENTS
  // =====================================================

  uploadDocument(parcelleId: number, file: File): Observable<any> {
    // Simuler l'upload
    return of({
      id: Date.now(),
      nom: file.name,
      type: this.getDocumentType(file.name),
      taille: this.formatFileSize(file.size),
      dateCreation: new Date().toLocaleDateString('fr-FR'),
      statut: 'VALIDE'
    }).pipe(
      delay(2000)
    );
  }

  private getDocumentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'CERTIFICAT';
      case 'dwg': return 'PLAN';
      case 'jpg':
      case 'png': return 'PHOTO';
      default: return 'AUTRE';
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // =====================================================
  // WORKFLOW DE VALIDATION
  // =====================================================

  getWorkflowStatus(parcelleId: number): Observable<any> {
    return of({
      etapeActuelle: 4,
      etapes: [
        { numero: 1, nom: 'Création', statut: 'completed', date: '10 Nov 2024' },
        { numero: 2, nom: 'Géométrie', statut: 'completed', date: '11 Nov 2024' },
        { numero: 3, nom: 'Propriétaires', statut: 'completed', date: '12 Nov 2024' },
        { numero: 4, nom: 'Calcul TNB', statut: 'current', date: null },
        { numero: 5, nom: 'Validation', statut: 'pending', date: null },
        { numero: 6, nom: 'Publication', statut: 'pending', date: null }
      ],
      calculTnb: {
        surfaceImposable: 1120.50,
        tarifZone: 5.00,
        calculBase: '1,120.50 × 5.00',
        montantTotal: 5602.50
      }
    }).pipe(delay(300));
  }

  validateWorkflowStep(parcelleId: number, etape: number, commentaire?: string): Observable<any> {
    return of({
      success: true,
      message: `Étape ${etape} validée avec succès`,
      commentaire: commentaire,
      nextStep: etape + 1
    }).pipe(delay(500));
  }
}
