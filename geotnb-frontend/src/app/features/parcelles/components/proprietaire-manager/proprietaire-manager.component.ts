// =====================================================
// COMPOSANT GESTION PROPRIÉTAIRES - AJOUT ET MODIFICATION
// =====================================================

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

// Modèles
import { Proprietaire, ParcelleProprietaire } from '../../../../core/models/database.models';

export interface ProprietaireFormData {
  proprietaire: Proprietaire;
  quote_part: number;
  date_debut: Date;
  est_actif: boolean;
}

@Component({
  selector: 'app-proprietaire-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './proprietaire-manager.component.html',
  styleUrls: ['./proprietaire-manager.component.scss']
})
export class ProprietaireManagerComponent implements OnInit {

  // =====================================================
  // PROPRIÉTÉS
  // =====================================================

  @Input() proprietaires: ProprietaireFormData[] = [];
  @Output() proprietairesChange = new EventEmitter<ProprietaireFormData[]>();
  @Output() quotesPartChange = new EventEmitter<number>();

  proprietaireForm: FormGroup;
  showForm = false;
  editingIndex = -1;

  // Colonnes du tableau
  displayedColumns: string[] = ['nom_prenom', 'nature', 'cin_ou_rc', 'quote_part', 'actions'];

  // Options pour les sélections
  naturesProprietaire = [
    { value: 'Physique', label: 'Personne Physique' },
    { value: 'Morale', label: 'Personne Morale' }
  ];

  // =====================================================
  // CONSTRUCTEUR
  // =====================================================

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.proprietaireForm = this.createProprietaireForm();
  }

  // =====================================================
  // CYCLE DE VIE
  // =====================================================

  ngOnInit(): void {
    this.calculateTotalQuotePart();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  private createProprietaireForm(): FormGroup {
    return this.fb.group({
      // Informations du propriétaire
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: [''],
      nature: ['Physique', Validators.required],
      cin_ou_rc: ['', [Validators.required, Validators.minLength(6)]],
      adresse: [''],
      telephone: [''],
      email: ['', [Validators.email]],
      
      // Informations de la relation parcelle-propriétaire
      quote_part: [100, [Validators.required, Validators.min(0.01), Validators.max(100)]],
      date_debut: [new Date(), Validators.required]
    });
  }

  // =====================================================
  // GESTION DES PROPRIÉTAIRES
  // =====================================================

  /**
   * Ajouter un nouveau propriétaire
   */
  addProprietaire(): void {
    this.showForm = true;
    this.editingIndex = -1;
    this.proprietaireForm.reset({
      nature: 'Physique',
      quote_part: this.getRemainingQuotePart(),
      date_debut: new Date()
    });
  }

  /**
   * Modifier un propriétaire existant
   */
  editProprietaire(index: number): void {
    const proprietaireData = this.proprietaires[index];
    this.showForm = true;
    this.editingIndex = index;
    
    this.proprietaireForm.patchValue({
      nom: proprietaireData.proprietaire.nom,
      prenom: proprietaireData.proprietaire.prenom,
      nature: proprietaireData.proprietaire.nature,
      cin_ou_rc: proprietaireData.proprietaire.cin_ou_rc,
      adresse: proprietaireData.proprietaire.adresse,
      telephone: proprietaireData.proprietaire.telephone,
      email: proprietaireData.proprietaire.email,
      quote_part: proprietaireData.quote_part,
      date_debut: proprietaireData.date_debut
    });
  }

  /**
   * Sauvegarder le propriétaire
   */
  saveProprietaire(): void {
    if (this.proprietaireForm.valid) {
      const formValue = this.proprietaireForm.value;
      
      // Vérifier que la quote-part totale ne dépasse pas 100%
      const totalQuotePart = this.getTotalQuotePart(this.editingIndex, formValue.quote_part);
      if (totalQuotePart > 100) {
        this.showError(`La quote-part totale ne peut pas dépasser 100%. Restant disponible: ${this.getRemainingQuotePart()}%`);
        return;
      }

      const proprietaireData: ProprietaireFormData = {
        proprietaire: {
          id: this.editingIndex >= 0 ? this.proprietaires[this.editingIndex].proprietaire.id : 0,
          nom: formValue.nom,
          prenom: formValue.prenom || '',
          nature: formValue.nature,
          cin_ou_rc: formValue.cin_ou_rc,
          adresse: formValue.adresse || '',
          telephone: formValue.telephone || '',
          email: formValue.email || '',
          date_creation: this.editingIndex >= 0 ? this.proprietaires[this.editingIndex].proprietaire.date_creation : new Date().toISOString(),
          date_modification: new Date().toISOString(),
          est_actif: true
        },
        quote_part: formValue.quote_part,
        date_debut: formValue.date_debut,
        est_actif: true
      };

      if (this.editingIndex >= 0) {
        // Modification
        this.proprietaires[this.editingIndex] = proprietaireData;
        this.showSuccess('Propriétaire modifié avec succès');
      } else {
        // Ajout
        this.proprietaires.push(proprietaireData);
        this.showSuccess('Propriétaire ajouté avec succès');
      }

      this.proprietairesChange.emit([...this.proprietaires]);
      this.calculateTotalQuotePart();
      this.cancelForm();
    } else {
      this.showError('Veuillez corriger les erreurs dans le formulaire');
    }
  }

  /**
   * Supprimer un propriétaire
   */
  deleteProprietaire(index: number): void {
    const proprietaire = this.proprietaires[index];
    const nomComplet = `${proprietaire.proprietaire.prenom} ${proprietaire.proprietaire.nom}`.trim();
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le propriétaire "${nomComplet}" ?`)) {
      this.proprietaires.splice(index, 1);
      this.proprietairesChange.emit([...this.proprietaires]);
      this.calculateTotalQuotePart();
      this.showSuccess('Propriétaire supprimé avec succès');
    }
  }

  /**
   * Annuler le formulaire
   */
  cancelForm(): void {
    this.showForm = false;
    this.editingIndex = -1;
    this.proprietaireForm.reset();
  }

  // =====================================================
  // CALCULS ET UTILITAIRES
  // =====================================================

  /**
   * Calculer la quote-part totale
   */
  private calculateTotalQuotePart(): void {
    const total = this.proprietaires.reduce((sum, p) => sum + p.quote_part, 0);
    this.quotesPartChange.emit(total);
  }

  /**
   * Obtenir la quote-part totale
   */
  getTotalQuotePart(excludeIndex: number = -1, newValue: number = 0): number {
    let total = 0;
    this.proprietaires.forEach((p, index) => {
      if (index !== excludeIndex) {
        total += p.quote_part;
      }
    });
    return total + newValue;
  }

  /**
   * Obtenir la quote-part restante disponible
   */
  getRemainingQuotePart(): number {
    const total = this.getTotalQuotePart(this.editingIndex);
    return Math.max(0, 100 - total);
  }

  /**
   * Obtenir la quote-part totale limitée à 100% pour l'affichage
   */
  getTotalQuotePartCapped(): number {
    return Math.min(this.getTotalQuotePart(), 100);
  }

  /**
   * Obtenir le nom complet d'un propriétaire
   */
  getNomComplet(proprietaire: Proprietaire): string {
    return `${proprietaire.prenom} ${proprietaire.nom}`.trim();
  }

  /**
   * Obtenir l'erreur d'un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.proprietaireForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} est requis`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} trop court`;
      if (field.errors['email']) return 'Format email invalide';
      if (field.errors['min']) return 'Valeur trop petite';
      if (field.errors['max']) return 'Valeur trop grande';
    }
    return '';
  }

  /**
   * Obtenir le libellé d'un champ
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nom: 'Nom',
      prenom: 'Prénom',
      nature: 'Nature',
      cin_ou_rc: 'CIN/RC',
      adresse: 'Adresse',
      telephone: 'Téléphone',
      email: 'Email',
      quote_part: 'Quote-part',
      date_debut: 'Date de début'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Vérifier si la quote-part totale est valide
   */
  isQuotePartValid(): boolean {
    const total = this.getTotalQuotePart();
    return total <= 100;
  }

  /**
   * Obtenir la classe CSS pour la quote-part totale
   */
  getQuotePartClass(): string {
    const total = this.getTotalQuotePart();
    if (total < 100) return 'quote-part-incomplete';
    if (total === 100) return 'quote-part-complete';
    return 'quote-part-exceeded';
  }

  // =====================================================
  // MESSAGES
  // =====================================================

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