import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('proprietaire')
export class Proprietaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ type: 'enum', enum: ['Physique', 'Morale'] })
  nature: 'Physique' | 'Morale';

  @Column()
  cin_ou_rc: string;

  @Column()
  adresse: string;

  @Column()
  telephone: string;
}
