import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';

@Entity('journal_actions')
@Index(['utilisateurId'])
@Index(['dateHeure'])
@Index(['tableCible'])
@Index(['action'])
export class JournalAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'utilisateur_id', nullable: true })
  utilisateurId: number;

  @Column({ length: 100 })
  action: string;

  @CreateDateColumn({ name: 'date_heure' })
  dateHeure: Date;

  @Column({ name: 'table_cible', length: 100 })
  tableCible: string;

  @Column({ name: 'id_cible', nullable: true })
  idCible: number;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  // Relations avec les autres entités
  
  // Relation avec User (Many-to-One)
  @ManyToOne('User', 'journalActions', { lazy: true })
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: any; // Sera remplacé par User

  // Méthodes virtuelles pour faciliter l'utilisation

  /**
   * Retourne une description lisible de l'action
   */
  get descriptionAction(): string {
    const actions = {
      'CREATE': 'Création',
      'UPDATE': 'Modification',
      'DELETE': 'Suppression',
      'LOGIN': 'Connexion',
      'LOGOUT': 'Déconnexion',
      'VIEW': 'Consultation',
      'EXPORT': 'Export',
      'IMPORT': 'Import',
      'VALIDATE': 'Validation',
      'GENERATE': 'Génération'
    };
    return actions[this.action] || this.action;
  }

  /**
   * Retourne le nom de la table en français
   */
  get nomTableCible(): string {
    const tables = {
      'parcelles': 'Parcelles',
      'proprietaires': 'Propriétaires',
      'parcelle_proprietaires': 'Relations Parcelle-Propriétaire',
      'fiches_fiscales': 'Fiches Fiscales',
      'documents_joints': 'Documents',
      'users': 'Utilisateurs',
      'configurations_fiscales': 'Configurations Fiscales',
      'configurations_zones': 'Zones'
    };
    return tables[this.tableCible] || this.tableCible;
  }

  /**
   * Retourne un résumé de l'action
   */
  get resume(): string {
    const description = this.descriptionAction;
    const table = this.nomTableCible;
    const id = this.idCible ? ` (ID: ${this.idCible})` : '';
    return `${description} - ${table}${id}`;
  }

  /**
   * Indique si l'action est critique (modification/suppression)
   */
  get estActionCritique(): boolean {
    return ['DELETE', 'UPDATE', 'VALIDATE'].includes(this.action);
  }

  /**
   * Retourne les détails formatés pour affichage
   */
  get detailsFormates(): string {
    if (!this.details) return '';
    
    try {
      const details = typeof this.details === 'string' ? JSON.parse(this.details) : this.details;
      
      if (details.changes) {
        const changes = Object.entries(details.changes)
          .map(([key, value]: [string, any]) => `${key}: ${value.old} → ${value.new}`)
          .join(', ');
        return `Modifications: ${changes}`;
      }
      
      return JSON.stringify(details, null, 2);
    } catch {
      return String(this.details);
    }
  }
}