import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Geometry } from 'geojson';

@Entity('parcelle')
export class Parcelle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  referenceFonciere: string;

  @Column('float')
  surfaceTotale: number;

  @Column('float')
  surfaceImposable: number;

  @Column()
  statutFoncier: string;

  @Column()
  statutOccupation: string;

  @Column()
  zonage: string;

  @Column()
  categorieFiscale: string;

  @Column('float')
  prixUnitaireM2: number;

  @Column('float')
  montantTotalTNB: number;

  @Column()
  exonereTNB: boolean;

  @Column({ type: 'date', nullable: true })
  datePermis: Date;

  @Column({ type: 'int', nullable: true })
  dureeExoneration: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
  })
  geometry: Geometry;

  @CreateDateColumn({ type: 'timestamp' })
  dateCreation: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  dateModification: Date;

  @Column()
  etatValidation: string;
}
