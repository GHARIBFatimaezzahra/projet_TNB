import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProprietaireService } from '../../services/proprietaire.service';

@Component({
  selector: 'app-proprietaire-form',
  templateUrl: './proprietaire-form.component.html',
  styleUrls: ['./proprietaire-form.component.scss']
})
export class ProprietaireFormComponent implements OnInit {
  proprietaireForm!: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  proprietaireId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private proprietaireService: ProprietaireService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.proprietaireForm = this.formBuilder.group({
      nom: ['', Validators.required],
      nature: ['', Validators.required],
      cin_ou_rc: ['', Validators.required],
      adresse: [''],
      telephone: ['']
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.proprietaireId = parseInt(id);
      this.loadProprietaire();
    }
  }

  loadProprietaire(): void {
    if (this.proprietaireId) {
      this.proprietaireService.getProprietaire(this.proprietaireId).subscribe({
        next: (proprietaire) => {
          this.proprietaireForm.patchValue(proprietaire);
        },
        error: (error) => {
          this.error = 'Erreur lors du chargement du propriétaire';
        }
      });
    }
  }

  onSubmit(): void {
    if (this.proprietaireForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const request = this.isEditMode
      ? this.proprietaireService.updateProprietaire(this.proprietaireId!, this.proprietaireForm.value)
      : this.proprietaireService.createProprietaire(this.proprietaireForm.value);

    request.subscribe({
      next: () => {
        this.router.navigate(['/proprietaires']);
      },
      error: (error) => {
        this.error = 'Erreur lors de la sauvegarde';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/proprietaires']);
  }
}