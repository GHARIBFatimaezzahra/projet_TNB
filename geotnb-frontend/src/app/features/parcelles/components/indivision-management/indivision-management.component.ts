import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-indivision-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ],
  template: `
    <div class="indivision-container">
      <h2>Gestion des Indivisions</h2>
      <p>Interface de gestion des propriétaires multiples et quotes-parts</p>
    </div>
  `,
  styles: [`
    .indivision-container {
      padding: 20px;
    }
  `]
})
export class IndivisionManagementComponent implements OnInit {
  
  constructor() { }

  ngOnInit(): void {
  }
}
