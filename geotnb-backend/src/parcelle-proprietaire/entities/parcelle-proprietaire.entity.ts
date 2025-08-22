import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  Unique
} from 'typeorm';
import { Parcelle } from '../../parcelle/entities/parcelle.entity';
import { Proprietaire } from '../../proprietaire/entities/proprietaire.entity';

@Entity('parcelle_proprietaires')
@Unique(['parcelleId', 'proprietaireId', 'dateDebut'])
@Index(['parcelleId'])
@Index(['proprietaireId'])
@Index(['estActif'])
export class ParcelleProprietaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parcelle_id' })
  parcelleId: number;

  @Column({ name: 'proprietaire_id' })
  proprietaireId: number;

  @Column({ 
    name: 'quote_part',
    type: 'decimal',
    precision: 5,
    scale: 4,
    comment: 'Quote-part entre 0 et 1 (ex: 0.5 = 50%)'
  })
  quotePart: number;

  @Column({ 
    name: 'montant_individuel',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0
  })
  montantIndividuel: number;

  @Column({ name: 'date_debut', type: 'date', default: () => 'CURRENT_DATE' })
  dateDebut: Date;

  @Column({ name: 'date_fin', type: 'date', nullable: true })
  dateFin: Date;

  @Column({ name: 'est_actif', default: true })
  estActif: boolean;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation: Date;

  // Relations
  @ManyToOne(() => Parcelle, parcelle => parcelle.proprietaires, { 
    onDelete: 'CASCADE',
    eager: false 
  })
  @JoinColumn({ name: 'parcelle_id' })
  parcelle: Parcelle;

  @ManyToOne(() => Proprietaire, proprietaire => proprietaire.parcelles, { 
    onDelete: 'CASCADE',
    eager: false 
  })
  @JoinColumn({ name: 'proprietaire_id' })
  proprietaire: Proprietaire;

  // Relation avec FicheFiscale (One-to-Many)
  @OneToMany('FicheFiscale', 'parcelleProprietaire', { lazy: true })
  fichesFiscales: any[]; // Sera remplacé par FicheFiscale[]

  // Méthodes virtuelles

  /**
   * Calcule le pourcentage de quote-part
   */
  get pourcentageQuotePart(): number {
    return Math.round(this.quotePart * 100);
  }

  /**
   * Vérifie si la relation est active à une date donnée
   */
  estActifADate(date: Date = new Date()): boolean {
    if (!this.estActif) return false;
    if (date < this.dateDebut) return false;
    if (this.dateFin && date > this.dateFin) return false;
    return true;
  }

  /**
   * Calcule le montant TNB pour cette quote-part
   */
  calculerMontantTnb(montantTotalParcelle: number): number {
    return montantTotalParcelle * this.quotePart;
  }

  /**
   * Retourne la période de validité sous forme de chaîne
   */
  get periodeValidite(): string {
    const debut = this.dateDebut.toLocaleDateString();
    const fin = this.dateFin ? this.dateFin.toLocaleDateString() : 'En cours';
    return `${debut} - ${fin}`;
  }

  /**
   * Vérifie si la quote-part est valide (entre 0 et 1)
   */
  get quotePartValide(): boolean {
    return this.quotePart > 0 && this.quotePart <= 1;
  }
}