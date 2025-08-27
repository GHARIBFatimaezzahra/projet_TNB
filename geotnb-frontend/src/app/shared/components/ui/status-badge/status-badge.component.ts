import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
// Configuration supprimée - utilisation de couleurs par défaut

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() status!: string;
  @Input() type: 'validation' | 'occupation' | 'payment' | 'custom' = 'custom';
  @Input() customColor?: string;
  @Input() customText?: string;
  @Input() showIcon = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  getBadgeClass(): string {
    return `badge-${this.type}-${this.status.toLowerCase()} badge-${this.size}`;
  }

  getBadgeColor(): string {
    if (this.customColor) {
      return this.customColor;
    }

    // Couleurs par défaut pour les différents statuts
    const defaultColors: { [key: string]: { [key: string]: string } } = {
      parcelle: {
        'brouillon': '#ff9800',
        'valide': '#4caf50',
        'publie': '#2196f3',
        'archive': '#9e9e9e'
      },
      workflow: {
        'en_cours': '#ff9800',
        'termine': '#4caf50',
        'suspendu': '#f44336',
        'annule': '#9e9e9e'
      }
    };
    
    const colors = defaultColors[this.type] || {};
    return colors[this.status] || '#666';
  }

  getTextColor(): string {
    return this.isLightColor(this.getBadgeColor()) ? '#333' : '#fff';
  }

  getDisplayText(): string {
    if (this.customText) {
      return this.customText;
    }

    const translations: { [key: string]: string } = {
      'Brouillon': 'Brouillon',
      'Valide': 'Validé',
      'Publie': 'Publié',
      'Archive': 'Archivé',
      'Nu': 'Terrain nu',
      'Construit': 'Construit',
      'En_Construction': 'En construction',
      'Partiellement_Construit': 'Partiellement construit',
      'EnAttente': 'En attente',
      'Paye': 'Payé',
      'Retard': 'En retard',
      'Annule': 'Annulé'
    };

    return translations[this.status] || this.status;
  }

  getIcon(): string {
    const icons: { [key: string]: { [key: string]: string } } = {
      validation: {
        'Brouillon': 'edit',
        'Valide': 'check_circle',
        'Publie': 'publish',
        'Archive': 'archive'
      },
      occupation: {
        'Nu': 'terrain',
        'Construit': 'home',
        'En_Construction': 'construction',
        'Partiellement_Construit': 'home_work'
      },
      payment: {
        'EnAttente': 'schedule',
        'Paye': 'check_circle',
        'Retard': 'warning',
        'Annule': 'cancel'
      }
    };

    return icons[this.type]?.[this.status] || 'label';
  }

  private isLightColor(color: string): boolean {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
  }
}