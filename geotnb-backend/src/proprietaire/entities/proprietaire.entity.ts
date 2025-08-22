import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';

@Entity('proprietaires')
@Index(['cinOuRc'])
@Index(['nom'])
@Index(['nature'])
export class Proprietaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ nullable: true })
  prenom: string;

  @Column({ 
    type: 'varchar',
    length: 20,
    default: 'Physique'
  })
  nature: 'Physique' | 'Morale';

  @Column({ name: 'cin_ou_rc', unique: true, nullable: true })
  cinOuRc: string;

  @Column({ type: 'text', nullable: true })
  adresse: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ nullable: true })
  email: string;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification' })
  dateModification: Date;

  @Column({ name: 'est_actif', default: true })
  estActif: boolean;

  // Relations avec les autres entités
  
  // Relation avec ParcelleProprietaire (Many-to-Many via table de liaison)
  @OneToMany('ParcelleProprietaire', 'proprietaire', { cascade: true, lazy: true })
  parcelles: any[]; // Sera remplacé par ParcelleProprietaire[]

  // Relation avec DocumentJoint (One-to-Many) - Documents spécifiques au propriétaire
  @OneToMany('DocumentJoint', 'proprietaire', { lazy: true })
  documents: any[]; // Sera remplacé par DocumentJoint[]

  // Relation avec FicheFiscale via ParcelleProprietaire
  // Les fiches fiscales sont liées aux ParcelleProprietaire pour gérer l'indivision

  // Méthodes virtuelles pour faciliter l'utilisation

  /**
   * Retourne le nom complet du propriétaire
   */
  get nomComplet(): string {
    if (this.nature === 'Morale') {
      return this.nom;
    }
    return this.prenom ? `${this.prenom} ${this.nom}` : this.nom;
  }

  /**
   * Retourne le type de document d'identité
   */
  get typeIdentifiant(): string {
    if (!this.cinOuRc) return 'Non renseigné';
    return this.nature === 'Physique' ? 'CIN' : 'RC';
  }

  /**
   * Valide le format du CIN ou RC selon le type
   */
  get identifiantValide(): boolean {
    if (!this.cinOuRc) return false;
    
    if (this.nature === 'Physique') {
      // Format CIN marocaine : 1-2 lettres + 6-8 chiffres
      return /^[A-Z]{1,2}[0-9]{6,8}$/.test(this.cinOuRc);
    } else {
      // Format RC : chiffres uniquement
      return /^[0-9]+$/.test(this.cinOuRc);
    }
  }

  /**
   * Retourne les informations de contact disponibles
   */
  get contactsDisponibles(): string[] {
    const contacts = [];
    if (this.email) contacts.push(`Email: ${this.email}`);
    if (this.telephone) contacts.push(`Tél: ${this.telephone}`);
    if (this.adresse) contacts.push(`Adresse: ${this.adresse}`);
    return contacts;
  }
}