import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Parcelle } from '../../parcelle/entities/parcelle.entity'; // Assurez-vous que l'entité Parcelle existe

@Entity('document_joints')
export class DocumentJoint {
  @PrimaryGeneratedColumn()
  id: number; // Identifiant du document

  @Column()
  parcelleId: number; // Référence de la parcelle concernée

  @Column()
  typeDoc: string; // Type de document (certificat, photo, etc.)

  @Column()
  cheminFichier: string; // Chemin d'accès ou lien du fichier

  @Column({ type: 'date' })
  dateAjout: string; // Date d'ajout du document

  @ManyToOne(() => Parcelle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parcelleId' })
  parcelle: Parcelle; // Relation avec la parcelle
}
