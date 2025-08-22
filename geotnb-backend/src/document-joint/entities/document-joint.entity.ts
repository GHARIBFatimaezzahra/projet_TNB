// =====================================================
// MODULE DOCUMENT-JOINT - IMPLEMENTATION COMPLETE
// =====================================================

// src/document-joint/entities/document-joint.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';

@Entity('documents_joints')
@Index(['typeDoc'])
@Index(['dateAjout'])
export class DocumentJoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parcelle_id' })
  parcelleId: number;

  @Column({ name: 'proprietaire_id', nullable: true })
  proprietaireId: number;

  @Column({ 
    name: 'type_doc',
    type: 'varchar',
    length: 50
  })
  typeDoc: 'Certificat' | 'Photo' | 'Requisition' | 'Plan' | 'Autorisation' | 'Autre';

  @Column({ name: 'nom_fichier' })
  nomFichier: string;

  @Column({ name: 'chemin_fichier' })
  cheminFichier: string;

  @Column({ name: 'taille_fichier', type: 'bigint', nullable: true })
  tailleFichier: number;

  @Column({ name: 'mime_type', nullable: true })
  mimeType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'uploader_par', nullable: true })
  uploaderPar: number;

  @CreateDateColumn({ name: 'date_ajout' })
  dateAjout: Date;

  @Column({ name: 'est_valide', default: true })
  estValide: boolean;

  // Relations avec les autres entités
  @ManyToOne('Parcelle', 'documents', { lazy: true })
  @JoinColumn({ name: 'parcelle_id' })
  parcelle: any; // Sera remplacé par Parcelle

  @ManyToOne('Proprietaire', 'documents', { lazy: true })
  @JoinColumn({ name: 'proprietaire_id' })
  proprietaire: any; // Sera remplacé par Proprietaire

  @ManyToOne('User', 'documentsUploades', { lazy: true })
  @JoinColumn({ name: 'uploader_par' })
  uploader: any; // Sera remplacé par User

  // Méthodes virtuelles
  get tailleFichierFormatee(): string {
    if (!this.tailleFichier) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(this.tailleFichier) / Math.log(1024));
    return Math.round(this.tailleFichier / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  get estImage(): boolean {
    return this.mimeType?.startsWith('image/') || false;
  }

  get estPDF(): boolean {
    return this.mimeType === 'application/pdf';
  }

  get extensionFichier(): string {
    return this.nomFichier.split('.').pop()?.toLowerCase() || '';
  }
}