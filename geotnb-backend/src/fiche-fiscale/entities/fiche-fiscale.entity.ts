import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Parcelle } from '../../parcelle/entities/parcelle.entity';
import { Proprietaire } from '../../proprietaire/entities/proprietaire.entity';

@Entity('fiche_fiscale')
export class FicheFiscale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Parcelle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parcelleId' })
  parcelle: Parcelle;

  @ManyToOne(() => Proprietaire, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proprietaireId' })
  proprietaire: Proprietaire;

  @Column('float')
  montantTNB: number;

  @Column()
  annee: string;

  @Column()
  statut: string; // Peut être 'payée', 'non payée'

  @CreateDateColumn()
  dateGeneration: Date;
}
