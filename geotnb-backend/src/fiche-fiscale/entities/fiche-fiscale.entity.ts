import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';

@Entity('fiches_fiscales')
@Index(['codeUnique'])
@Index(['annee'])
@Index(['statutPayment'])
export class FicheFiscale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parcelle_proprietaire_id' })
  parcelleProprietaireId: number;

  @Column({ name: 'code_unique', unique: true })
  codeUnique: string;

  @Column()
  annee: number;

  @CreateDateColumn({ name: 'date_generation' })
  dateGeneration: Date;

  @Column({ name: 'date_limite_payment', type: 'date' })
  dateLimitePayment: Date;

  @Column({ name: 'montant_tnb', type: 'float' })
  montantTnb: number;

  @Column({ name: 'categorie_fiscale', nullable: true })
  categorieFiscale: string;

  @Column({ name: 'tarif', type: 'float', nullable: true })
  tarif: number;

  @Column({ name: 'surface_imposable', type: 'float', nullable: true })
  surfaceImposable: number;

  @Column({ name: 'montant_paye', type: 'float', default: 0 })
  montantPaye: number;

  @Column({ 
    name: 'statut_payment',
    type: 'varchar',
    length: 20,
    default: 'EnAttente'
  })
  statutPayment: 'EnAttente' | 'Paye' | 'Retard' | 'Annule';

  @Column({ name: 'chemin_fichier_pdf', nullable: true })
  cheminFichierPdf: string;

  @Column({ name: 'genere_par' })
  genereParId: number;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation: Date;

  // Relations avec les autres entités
  
  // Relation avec ParcelleProprietaire (Many-to-One)
  @ManyToOne('ParcelleProprietaire', 'ficheFiscale', { lazy: true })
  @JoinColumn({ name: 'parcelle_proprietaire_id' })
  parcelleProprietaire: import('../../parcelle-proprietaire/entities/parcelle-proprietaire.entity').ParcelleProprietaire;

  // Relation avec User (Many-to-One) - Utilisateur qui a généré la fiche
  @ManyToOne('User', 'fichesGenerees', { lazy: true })
  @JoinColumn({ name: 'genere_par' })
  genereParUtilisateur: import('../../user/entities/user.entity').User;

  // Méthodes virtuelles pour faciliter l'utilisation

  /**
   * Calcule le montant restant à payer
   */
  get montantRestant(): number {
    return Math.max(0, this.montantTnb - this.montantPaye);
  }

  /**
   * Indique si la fiche est entièrement payée
   */
  get estPayee(): boolean {
    return this.montantPaye >= this.montantTnb;
  }

  /**
   * Indique si la fiche est en retard de paiement
   */
  get estEnRetard(): boolean {
    return !this.estPayee && new Date() > this.dateLimitePayment;
  }

  /**
   * Calcule le pourcentage de paiement
   */
  get pourcentagePaiement(): number {
    if (this.montantTnb === 0) return 100;
    return Math.round((this.montantPaye / this.montantTnb) * 100);
  }

  /**
   * Calcule le nombre de jours de retard
   */
  get joursRetard(): number {
    if (!this.estEnRetard) return 0;
    const aujourdHui = new Date();
    const diffTime = aujourdHui.getTime() - this.dateLimitePayment.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Retourne le statut de paiement en français
   */
  get statutPaymentLibelle(): string {
    const libelles = {
      'EnAttente': 'En attente',
      'Paye': 'Payée',
      'Retard': 'En retard',
      'Annule': 'Annulée'
    };
    return libelles[this.statutPayment] || this.statutPayment;
  }
}