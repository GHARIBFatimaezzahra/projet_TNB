// =====================================================
// DASHBOARD PARCELLES - CONNECTÉ AU BACKEND
// =====================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-parcelles-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatSnackBarModule
  ],
  templateUrl: './parcelles-dashboard.component.html',
  styleUrls: ['./parcelles-dashboard.component.scss']
})
export class ParcellesDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('Dashboard des parcelles initialisé');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Naviguer vers une interface spécifique
   */
  navigateToInterface(interfaceName: string): void {
    switch (interfaceName) {
      case 'carte-interactive':
        this.router.navigate(['/parcelles/sig']);
        break;
      case 'recherche-avancee':
        this.router.navigate(['/parcelles/recherche']);
        break;
      case 'liste-parcelles':
        this.router.navigate(['/parcelles/liste']);
        break;
      case 'creation-parcelle':
        this.router.navigate(['/parcelles/create']);
        break;
      case 'detail-parcelle':
        this.router.navigate(['/parcelles/detail']);
        break;
      case 'gestion-indivision':
        this.router.navigate(['/parcelles/indivision']);
        break;
      case 'import-export':
        this.router.navigate(['/parcelles/import-export']);
        break;
      default:
        this.showNotification(`Interface ${interfaceName} non implémentée`, 'warning');
        break;
    }
  }

  /**
   * Retourner au dashboard principal
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Afficher toutes les interfaces
   */
  showAllInterfaces(): void {
    this.showNotification('Navigation vers toutes les interfaces', 'info');
    // Ici on pourrait afficher un modal ou une vue avec toutes les interfaces
  }

  /**
   * Afficher une notification
   */
  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: `snackbar-${type}`
    });
  }
}
