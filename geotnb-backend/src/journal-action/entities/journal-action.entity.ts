import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity'; // Chemin corrigé

@Entity('journal_action')
export class JournalAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  action: string; // L'action effectuée

  @Column({ type: 'timestamp' })
  dateHeure: Date;

  @Column({ type: 'varchar', length: 100 })
  tableCible: string;

  @Column({ type: 'int' })
  idCible: number;

  @Column({ type: 'text', nullable: true })
  details: string;

  // Relation ManyToOne : une action appartient à un utilisateur
  @ManyToOne(() => User, (user) => user.journalActions)
  @JoinColumn({ name: 'utilisateurId' })
  utilisateur: User; // Utilisation correcte de l'entité User
}
