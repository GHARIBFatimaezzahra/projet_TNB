import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ParcelleService } from '../services/parcelle.service';
import { Parcelle } from '../../../core/models/parcelle.interface';

@Component({
  selector: 'app-parcelle-form',
  templateUrl: './parcelle-form.component.html',
  styleUrls: ['./parcelle-form.component.scss']
})
export class ParcelleFormComponent implements OnInit {
  parcelleForm!: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  parcelleId: number | null = null;

  zonages = [
    { value: 'Résidentiel', label: 'Résidentiel' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Industriel', label: 'Industriel' },
    { value: 'Agricole', label: 'Agricole' }
  ];

  statutsFonciers = [
    { value: 'Privé', label: 'Privé' },
    { value: 'Public', label: 'Public' },
    { value: 'Domanial', label: 'Domanial' }
  ];

  statutsOccupation = [
    { value: 'Nu', label: 'Nu' },
    { value: 'Partiellement construit', label: 'Partiellement construit' },
    { value: 'En construction', label: 'En construction' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private parcelleService: ParcelleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.parcelleForm = this.formBuilder.group({
      referenceFonciere: ['', [Validators.required]],
      surfaceTotale: ['', [Validators.required, Validators.min(0)]],
      surfaceImposable: ['', [Validators.required, Validators.min(0)]],
      statutFoncier: ['', Validators.required],
      statutOccupation: ['', Validators.required],
      zonage: ['', Validators.required],
      categorieFiscale: [''],
      prixUnitaireM2: ['', [Validators.required, Validators.min(0)]],
      exonereTNB: [false],
      datePermis: [''],
      dureeExoneration: ['', [Validators.min(0)]]
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.parcelleId = parseInt(id);
      this.loadParcelle();
    }
  }

  loadParcelle(): void {
    if (this.parcelleId) {
      this.parcelleService.getParcelle(this.parcelleId).subscribe({
        next: (parcelle) => {
          this.parcelleForm.patchValue(parcelle);
        },
        error: (error) => {
          this.error = 'Erreur lors du chargement de la parcelle';
          console.error(error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.parcelleForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const parcelleData = {
      ...this.parcelleForm.value,
      montantTotalTNB: this.calculateMontantTNB()
    };

    const request = this.isEditMode
      ? this.parcelleService.updateParcelle(this.parcelleId!, parcelleData)
      : this.parcelleService.createParcelle(parcelleData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/parcelles']);
      },
      error: (error) => {
        this.error = 'Erreur lors de la sauvegarde';
        this.loading = false;
        console.error(error);
      }
    });
  }

  calculateMontantTNB(): number {
    const surfaceImposable = this.parcelleForm.value.surfaceImposable;
    const prixUnitaire = this.parcelleForm.value.prixUnitaireM2;
    const exonere = this.parcelleForm.value.exonereTNB;
    
    if (exonere) {
      return 0;
    }
    
    return surfaceImposable * prixUnitaire;
  }

  onCancel(): void {
    this.router.navigate(['/parcelles']);
  }
}