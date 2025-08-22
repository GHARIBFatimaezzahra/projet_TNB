import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { Geometry } from 'geojson';

@Entity('parcelles')
@Index(['referenceFonciere'])
@Index(['zonage'])
@Index(['etatValidation'])
export class Parcelle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reference_fonciere', unique: true })
  referenceFonciere: string;

  @Column({ name: 'surface_totale', type: 'float', nullable: true })
  surfaceTotale: number;

  @Column({ name: 'surface_imposable', type: 'float', nullable: true })
  surfaceImposable: number;

  @Column({ 
    name: 'statut_foncier',
    type: 'varchar',
    length: 50,
    nullable: true
  })
  statutFoncier: 'TF' | 'R' | 'NI' | 'Domanial' | 'Collectif';

  @Column({ 
    name: 'statut_occupation',
    type: 'varchar',
    length: 50,
    nullable: true
  })
  statutOccupation: 'Nu' | 'Construit' | 'En_Construction' | 'Partiellement_Construit';

  @Column({ nullable: true })
  zonage: string;

  @Column({ name: 'categorie_fiscale', nullable: true })
  categorieFiscale: string;

  @Column({ name: 'prix_unitaire_m2', type: 'float', nullable: true })
  prixUnitaireM2: number;

  @Column({ name: 'montant_total_tnb', type: 'float', default: 0 })
  montantTotalTnb: number;

  @Column({ name: 'exonere_tnb', default: false })
  exonereTnb: boolean;

  @Column({ name: 'date_permis', type: 'date', nullable: true })
  datePermis: Date;

  @Column({ name: 'duree_exoneration', nullable: true })
  dureeExoneration: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true
  })
  geometry: Geometry;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification' })
  dateModification: Date;

  @Column({ 
    name: 'etat_validation',
    type: 'varchar',
    length: 20,
    default: 'Brouillon'
  })
  etatValidation: 'Brouillon' | 'Valide' | 'Publie' | 'Archive';

  @Column({ name: 'derniere_mise_a_jour', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  derniereMiseAJour: Date;

  @Column({ default: 1 })
  version: number;

  // Relations avec les autres entités
  
  // Relation avec ParcelleProprietaire (Many-to-Many via table de liaison)
  @OneToMany('ParcelleProprietaire', 'parcelle', { cascade: true, lazy: true })
  proprietaires: any[]; // Typed as any temporairement, sera remplacé par ParcelleProprietaire[]

  // Relation avec DocumentJoint (One-to-Many)
  @OneToMany('DocumentJoint', 'parcelle', { cascade: true, lazy: true })
  documents: any[]; // Typed as any temporairement, sera remplacé par DocumentJoint[]

  // Relation avec FicheFiscale via ParcelleProprietaire
  // Les fiches fiscales sont liées aux ParcelleProprietaire pour gérer l'indivision
  
  // Relation avec JournalAction pour l'audit trail
  @OneToMany('JournalAction', 'parcelleId', { lazy: true })
  journalActions: any[]; // Typed as any temporairement, sera remplacé par JournalAction[]

  // Méthodes virtuelles pour faciliter l'utilisation

  /**
   * Calcule le pourcentage de surface imposable
   */
  get pourcentageSurfaceImposable(): number {
    if (!this.surfaceTotale || this.surfaceTotale === 0) return 0;
    return Math.round((this.surfaceImposable / this.surfaceTotale) * 100);
  }

  /**
   * Indique si la parcelle est exonérée temporairement
   */
  get estExonereeTemporairement(): boolean {
    if (!this.exonereTnb || !this.datePermis || !this.dureeExoneration) return false;
    
    const dateExpiration = new Date(this.datePermis);
    dateExpiration.setFullYear(dateExpiration.getFullYear() + this.dureeExoneration);
    
    return new Date() < dateExpiration;
  }

  /**
   * Retourne la date d'expiration de l'exonération
   */
  get dateExpirationExoneration(): Date | null {
    if (!this.datePermis || !this.dureeExoneration) return null;
    
    const dateExpiration = new Date(this.datePermis);
    dateExpiration.setFullYear(dateExpiration.getFullYear() + this.dureeExoneration);
    
    return dateExpiration;
  }

  /**
   * Calcule le prix TNB par m² si applicable
   */
  get prixTnbParM2(): number {
    if (!this.surfaceImposable || this.surfaceImposable === 0 || this.exonereTnb) return 0;
    return this.montantTotalTnb / this.surfaceImposable;
  }
}