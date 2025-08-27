// =====================================================
// RÉSUMÉ DE VALIDATION - INDIVISION
// =====================================================

import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';

// Models
import { ParcelleProprietaire, Parcelle } from '../../../models/parcelle.models';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  type: 'error' | 'warning' | 'info';
  isValid: boolean;
  message: string;
  details?: string;
  icon: string;
}

export interface ValidationSummary {
  isValid: boolean;
  totalErrors: number;
  totalWarnings: number;
  totalInfos: number;
  completionPercentage: number;
  rules: ValidationRule[];
  quoteParts: {
    total: number;
    expected: number;
    difference: number;
    isValid: boolean;
  };
  proprietaires: {
    total: number;
    active: number;
    inactive: number;
    hasMinimum: boolean;
  };
}

@Component({
  selector: 'app-validation-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatTableModule,
    MatBadgeModule
  ],
  templateUrl: './validation-summary.component.html',
  styleUrls: ['./validation-summary.component.scss']
})
export class ValidationSummaryComponent implements OnInit, OnChanges {
  @Input() quoteParts: ParcelleProprietaire[] = [];
  @Input() parcelle?: Parcelle;
  @Input() showDetails = true;
  @Input() showActions = true;
  @Input() validationMode: 'strict' | 'flexible' = 'strict';

  validationSummary: ValidationSummary = {
    isValid: false,
    totalErrors: 0,
    totalWarnings: 0,
    totalInfos: 0,
    completionPercentage: 0,
    rules: [],
    quoteParts: {
      total: 0,
      expected: 1,
      difference: 0,
      isValid: false
    },
    proprietaires: {
      total: 0,
      active: 0,
      inactive: 0,
      hasMinimum: false
    }
  };

  // Configuration des règles de validation
  private validationRules: Omit<ValidationRule, 'isValid' | 'message'>[] = [
    {
      id: 'quote_parts_sum',
      name: 'Somme des quote-parts',
      description: 'La somme des quote-parts doit être égale à 100%',
      type: 'error',
      details: 'En cas d\'indivision, la somme des quote-parts de tous les propriétaires actifs doit être exactement égale à 100% (1.0)',
      icon: 'pie_chart'
    },
    {
      id: 'minimum_proprietaires',
      name: 'Nombre minimum de propriétaires',
      description: 'Au moins un propriétaire doit être défini',
      type: 'error',
      details: 'Une parcelle doit avoir au minimum un propriétaire actif',
      icon: 'group'
    },
    {
      id: 'active_proprietaires',
      name: 'Propriétaires actifs',
      description: 'Au moins un propriétaire doit être actif',
      type: 'error',
      details: 'Il doit y avoir au moins un propriétaire avec le statut "actif"',
      icon: 'person'
    },
    {
      id: 'quote_parts_positive',
      name: 'Quote-parts positives',
      description: 'Toutes les quote-parts doivent être supérieures à 0',
      type: 'error',
      details: 'Chaque propriétaire actif doit avoir une quote-part supérieure à 0',
      icon: 'add_circle'
    },
    {
      id: 'quote_parts_valid_range',
      name: 'Plage des quote-parts',
      description: 'Chaque quote-part doit être entre 0% et 100%',
      type: 'error',
      details: 'Les quote-parts individuelles ne peuvent pas dépasser 100% (1.0)',
      icon: 'straighten'
    },
    {
      id: 'proprietaires_info_complete',
      name: 'Informations propriétaires',
      description: 'Les informations des propriétaires doivent être complètes',
      type: 'warning',
      details: 'Nom, CIN/RC et autres informations essentielles doivent être renseignées',
      icon: 'info'
    },
    {
      id: 'montants_coherents',
      name: 'Cohérence des montants',
      description: 'Les montants individuels doivent être cohérents avec les quote-parts',
      type: 'warning',
      details: 'La somme des montants individuels doit correspondre au montant total TNB',
      icon: 'account_balance'
    },
    {
      id: 'dates_coherentes',
      name: 'Cohérence des dates',
      description: 'Les dates de début et fin doivent être cohérentes',
      type: 'info',
      details: 'Les dates de fin doivent être postérieures aux dates de début',
      icon: 'schedule'
    }
  ];

  // Colonnes pour le tableau des règles
  rulesColumns = ['status', 'rule', 'message', 'actions'];

  ngOnInit(): void {
    this.validateQuoteParts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['quoteParts'] || changes['parcelle'] || changes['validationMode']) {
      this.validateQuoteParts();
    }
  }

  // =====================================================
  // VALIDATION PRINCIPALE
  // =====================================================

  private validateQuoteParts(): void {
    // Réinitialiser le résumé
    this.validationSummary = {
      isValid: false,
      totalErrors: 0,
      totalWarnings: 0,
      totalInfos: 0,
      completionPercentage: 0,
      rules: [],
      quoteParts: {
        total: 0,
        expected: 1,
        difference: 0,
        isValid: false
      },
      proprietaires: {
        total: this.quoteParts.length,
        active: this.quoteParts.filter(qp => qp.est_actif).length,
        inactive: this.quoteParts.filter(qp => !qp.est_actif).length,
        hasMinimum: this.quoteParts.length > 0
      }
    };

    // Calculer la somme des quote-parts actives
    const activeQuoteParts = this.quoteParts.filter(qp => qp.est_actif);
    this.validationSummary.quoteParts.total = activeQuoteParts.reduce((sum, qp) => sum + qp.quote_part, 0);
    this.validationSummary.quoteParts.difference = Math.abs(this.validationSummary.quoteParts.total - 1);
    this.validationSummary.quoteParts.isValid = this.validationSummary.quoteParts.difference < 0.001;

    // Exécuter toutes les règles de validation
    this.validationSummary.rules = this.validationRules.map(rule => this.validateRule(rule));

    // Calculer les totaux
    this.validationSummary.totalErrors = this.validationSummary.rules.filter(r => r.type === 'error' && !r.isValid).length;
    this.validationSummary.totalWarnings = this.validationSummary.rules.filter(r => r.type === 'warning' && !r.isValid).length;
    this.validationSummary.totalInfos = this.validationSummary.rules.filter(r => r.type === 'info' && !r.isValid).length;

    // Déterminer si la validation globale est réussie
    this.validationSummary.isValid = this.validationSummary.totalErrors === 0;

    // Calculer le pourcentage de completion
    const totalRules = this.validationSummary.rules.length;
    const validRules = this.validationSummary.rules.filter(r => r.isValid).length;
    this.validationSummary.completionPercentage = totalRules > 0 ? (validRules / totalRules) * 100 : 0;
  }

  private validateRule(ruleTemplate: Omit<ValidationRule, 'isValid' | 'message'>): ValidationRule {
    let isValid = false;
    let message = '';

    const activeQuoteParts = this.quoteParts.filter(qp => qp.est_actif);

    switch (ruleTemplate.id) {
      case 'quote_parts_sum':
        isValid = this.validationSummary.quoteParts.isValid;
        message = isValid 
          ? 'Somme des quote-parts correcte (100%)'
          : `Somme actuelle: ${(this.validationSummary.quoteParts.total * 100).toFixed(2)}% (écart: ${(this.validationSummary.quoteParts.difference * 100).toFixed(2)}%)`;
        break;

      case 'minimum_proprietaires':
        isValid = this.quoteParts.length > 0;
        message = isValid 
          ? `${this.quoteParts.length} propriétaire(s) défini(s)`
          : 'Aucun propriétaire défini';
        break;

      case 'active_proprietaires':
        isValid = activeQuoteParts.length > 0;
        message = isValid 
          ? `${activeQuoteParts.length} propriétaire(s) actif(s)`
          : 'Aucun propriétaire actif';
        break;

      case 'quote_parts_positive':
        const negativeQuoteParts = activeQuoteParts.filter(qp => qp.quote_part <= 0);
        isValid = negativeQuoteParts.length === 0;
        message = isValid 
          ? 'Toutes les quote-parts sont positives'
          : `${negativeQuoteParts.length} quote-part(s) invalide(s) (≤ 0%)`;
        break;

      case 'quote_parts_valid_range':
        const invalidRangeQuoteParts = activeQuoteParts.filter(qp => qp.quote_part > 1);
        isValid = invalidRangeQuoteParts.length === 0;
        message = isValid 
          ? 'Toutes les quote-parts sont dans la plage valide'
          : `${invalidRangeQuoteParts.length} quote-part(s) > 100%`;
        break;

      case 'proprietaires_info_complete':
        const incompleteProprietaires = this.quoteParts.filter(qp => 
          !qp.proprietaire?.nom || 
          !qp.proprietaire?.cin_ou_rc
        );
        isValid = incompleteProprietaires.length === 0;
        message = isValid 
          ? 'Informations des propriétaires complètes'
          : `${incompleteProprietaires.length} propriétaire(s) avec informations incomplètes`;
        break;

      case 'montants_coherents':
        if (this.parcelle?.montant_total_tnb) {
          const totalMontantsIndividuels = activeQuoteParts.reduce((sum, qp) => sum + qp.montant_individuel, 0);
          const difference = Math.abs(totalMontantsIndividuels - this.parcelle.montant_total_tnb);
          isValid = difference < 1; // Tolérance de 1 DH
          message = isValid 
            ? 'Montants cohérents avec le total TNB'
            : `Écart de ${difference.toFixed(2)} DH avec le montant total`;
        } else {
          isValid = true;
          message = 'Montant total TNB non défini';
        }
        break;

      case 'dates_coherentes':
        const datesIncorrect = this.quoteParts.filter(qp => 
          qp.date_fin && qp.date_debut && qp.date_fin <= qp.date_debut
        );
        isValid = datesIncorrect.length === 0;
        message = isValid 
          ? 'Toutes les dates sont cohérentes'
          : `${datesIncorrect.length} propriétaire(s) avec des dates incorrectes`;
        break;

      default:
        isValid = true;
        message = 'Règle non implémentée';
    }

    return {
      ...ruleTemplate,
      isValid,
      message
    };
  }

  // =====================================================
  // ACTIONS DE CORRECTION
  // =====================================================

  fixQuotePartsSum(): void {
    if (this.quoteParts.length === 0) return;

    const activeQuoteParts = this.quoteParts.filter(qp => qp.est_actif);
    if (activeQuoteParts.length === 0) return;

    // Répartition égale
    const equalQuotePart = 1 / activeQuoteParts.length;
    activeQuoteParts.forEach(qp => {
      qp.quote_part = equalQuotePart;
      if (this.parcelle?.montant_total_tnb) {
        qp.montant_individuel = equalQuotePart * this.parcelle.montant_total_tnb;
      }
    });

    this.validateQuoteParts();
  }

  activateAllProprietaires(): void {
    this.quoteParts.forEach(qp => {
      qp.est_actif = true;
    });
    this.validateQuoteParts();
  }

  fixNegativeQuoteParts(): void {
    const activeQuoteParts = this.quoteParts.filter(qp => qp.est_actif);
    const negativeQuoteParts = activeQuoteParts.filter(qp => qp.quote_part <= 0);
    
    if (negativeQuoteParts.length > 0) {
      const minQuotePart = 0.01; // 1% minimum
      negativeQuoteParts.forEach(qp => {
        qp.quote_part = minQuotePart;
      });
      
      // Réajuster les autres pour maintenir 100%
      this.fixQuotePartsSum();
    }
  }

  recalculateMontants(): void {
    if (!this.parcelle?.montant_total_tnb) return;

    this.quoteParts.forEach(qp => {
      if (qp.est_actif) {
        qp.montant_individuel = qp.quote_part * this.parcelle!.montant_total_tnb;
      } else {
        qp.montant_individuel = 0;
      }
    });

    this.validateQuoteParts();
  }

  // =====================================================
  // UTILITAIRES
  // =====================================================

  getRuleStatusIcon(rule: ValidationRule): string {
    if (rule.isValid) {
      return 'check_circle';
    } else {
      switch (rule.type) {
        case 'error': return 'error';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'help';
      }
    }
  }

  getRuleStatusColor(rule: ValidationRule): string {
    if (rule.isValid) {
      return 'primary';
    } else {
      switch (rule.type) {
        case 'error': return 'warn';
        case 'warning': return 'accent';
        case 'info': return '';
        default: return '';
      }
    }
  }

  getOverallStatusIcon(): string {
    if (this.validationSummary.isValid) {
      return 'check_circle';
    } else if (this.validationSummary.totalErrors > 0) {
      return 'error';
    } else if (this.validationSummary.totalWarnings > 0) {
      return 'warning';
    } else {
      return 'info';
    }
  }

  getOverallStatusColor(): string {
    if (this.validationSummary.isValid) {
      return 'primary';
    } else if (this.validationSummary.totalErrors > 0) {
      return 'warn';
    } else if (this.validationSummary.totalWarnings > 0) {
      return 'accent';
    } else {
      return '';
    }
  }

  getOverallStatusLabel(): string {
    if (this.validationSummary.isValid) {
      return 'Validation réussie';
    } else if (this.validationSummary.totalErrors > 0) {
      return 'Erreurs détectées';
    } else if (this.validationSummary.totalWarnings > 0) {
      return 'Avertissements';
    } else {
      return 'Informations';
    }
  }

  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }

  // Getters pour le template
  get hasErrors(): boolean {
    return this.validationSummary.totalErrors > 0;
  }

  get hasWarnings(): boolean {
    return this.validationSummary.totalWarnings > 0;
  }

  get hasInfos(): boolean {
    return this.validationSummary.totalInfos > 0;
  }

  get canAutoFix(): boolean {
    return this.showActions && !this.validationSummary.isValid;
  }

  get errorRules(): ValidationRule[] {
    return this.validationSummary.rules.filter(r => r.type === 'error' && !r.isValid);
  }

  get warningRules(): ValidationRule[] {
    return this.validationSummary.rules.filter(r => r.type === 'warning' && !r.isValid);
  }

  get infoRules(): ValidationRule[] {
    return this.validationSummary.rules.filter(r => r.type === 'info' && !r.isValid);
  }
}
