import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('configurations_fiscales')
export class ConfigurationFiscale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nom', length: 100 })
  nom: string;

  @ManyToOne(() => User, user => user.configurationsCreees, { lazy: true })
  @JoinColumn({ name: 'creer_par' })
  creerPar: User;
}