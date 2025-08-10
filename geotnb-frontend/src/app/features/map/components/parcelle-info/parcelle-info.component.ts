import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Parcelle } from '../../../../core/models/parcelle.interface';

@Component({
  selector: 'app-parcelle-info',
  templateUrl: './parcelle-info.component.html',
  styleUrls: ['./parcelle-info.component.scss']
})
export class ParcelleInfoComponent {
  @Input() parcelle!: Parcelle;
  @Output() close = new EventEmitter<void>();

  constructor(private router: Router) {}

  onClose(): void {
    this.close.emit();
  }

  viewDetails(): void {
    this.router.navigate(['/parcelles', this.parcelle.id]);
  }

  generateFiche(): void {
    // TODO: Implement PDF generation
    console.log('Generating fiche for parcelle:', this.parcelle.id);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Brouillon': 'status-draft',
      'Validé': 'status-validated',
      'Publié': 'status-published'
    };
    return classes[status] || '';
  }
}