import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Parcelle } from '../../parcelle/entities/parcelle.entity';
import { Proprietaire } from '../../proprietaire/entities/proprietaire.entity';

@Entity('parcelle_proprietaire')
export class ParcelleProprietaire {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Parcelle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parcelleId' })
  parcelle: Parcelle;

  @ManyToOne(() => Proprietaire, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proprietaireId' })
  proprietaire: Proprietaire;

  @Column('float')
  quotePart: number;

  @Column('float')
  montantIndividuel: number;
}
