import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
@Index(['username'])
@Index(['email'])
@Index(['profil'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column()
  nom: string;

  @Column({ nullable: true })
  prenom: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'Lecteur',
    enum: ['Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur']
  })
  profil: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ name: 'est_actif', default: true })
  estActif: boolean;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification' })
  dateModification: Date;

  @Column({ name: 'dernier_acces', nullable: true })
  dernierAcces: Date;

  // Relations avec les autres entités
  
  // Relation avec JournalAction (One-to-Many) - Actions effectuées par l'utilisateur
  @OneToMany('JournalAction', 'utilisateur', { lazy: true })
  journalActions: any[]; // Sera remplacé par JournalAction[]

  // Relation avec FicheFiscale (One-to-Many) - Fiches générées par l'utilisateur
  @OneToMany('FicheFiscale', 'genereParUtilisateur', { lazy: true })
  fichesGenerees: any[]; // Sera remplacé par FicheFiscale[]

  // Relation avec DocumentJoint (One-to-Many) - Documents uploadés par l'utilisateur
  @OneToMany('DocumentJoint', 'uploaderPar', { lazy: true })
  documentsUploades: any[]; // Sera remplacé par DocumentJoint[]

  // Relation avec ConfigurationsFiscales (One-to-Many) - Configurations créées par l'utilisateur
  @OneToMany('ConfigurationFiscale', 'creerPar', { lazy: true })
  configurationsCreees: any[]; // Sera remplacé par ConfigurationFiscale[]

  // Méthodes virtuelles pour faciliter l'utilisation

  /**
   * Retourne le nom complet de l'utilisateur
   */
  get nomComplet(): string {
    return this.prenom ? `${this.prenom} ${this.nom}` : this.nom;
  }

  /**
   * Vérifie si l'utilisateur est administrateur
   */
  get estAdmin(): boolean {
    return this.profil === 'Admin';
  }

  /**
   * Vérifie si l'utilisateur peut gérer les parcelles
   */
  get peutGererParcelles(): boolean {
    return ['Admin', 'TechnicienSIG'].includes(this.profil);
  }

  /**
   * Vérifie si l'utilisateur peut gérer les aspects fiscaux
   */
  get peutGererFiscal(): boolean {
    return ['Admin', 'AgentFiscal'].includes(this.profil);
  }

  /**
   * Retourne le niveau d'accès de l'utilisateur
   */
  get niveauAcces(): number {
    const niveaux = {
      'Lecteur': 1,
      'TechnicienSIG': 2,
      'AgentFiscal': 3,
      'Admin': 4
    };
    return niveaux[this.profil] || 0;
  }

  /**
   * Indique si l'utilisateur s'est connecté récemment (moins de 7 jours)
   */
  get estActifRecemment(): boolean {
    if (!this.dernierAcces) return false;
    const uneSeamaine = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes
    return (Date.now() - this.dernierAcces.getTime()) < uneSeamaine;
  }
}