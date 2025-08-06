import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { JournalAction } from '../../journal-action/entities/journal-action.entity'; // Importation correcte depuis 'journal-action/entities'

@Entity('utilisateur') // La table s'appelle 'utilisateur' dans la base de données
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  profil: string;

  @Column({ default: true }) 
  estActif: boolean;

  // Relation OneToMany : un utilisateur peut avoir plusieurs actions dans le journal
  @OneToMany(
    () => JournalAction, // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    (journalAction) => journalAction.utilisateur,
  )
  journalActions!: JournalAction[]; // Cette propriété contiendra toutes les actions de l'utilisateur
}
