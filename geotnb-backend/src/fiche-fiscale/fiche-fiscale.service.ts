import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FicheFiscale } from './entities/fiche-fiscale.entity';
import { CreateFicheFiscaleDto } from './dto/create-fiche-fiscale.dto';
import { UpdateFicheFiscaleDto } from './dto/update-fiche-fiscale.dto';
import { ParcelleService } from '../parcelle/parcelle.service';

@Injectable()
export class FicheFiscaleService {
  constructor(
    @InjectRepository(FicheFiscale)
    private repo: Repository<FicheFiscale>,
    private parcelleService: ParcelleService,
  ) {}

  // Calcul du montant de la TNB
  async calculerTNB(parcelleId: number): Promise<number> {
    const parcelle = await this.parcelleService.findOne(parcelleId);

    if (!parcelle) {
      throw new NotFoundException('Parcelle non trouvée');
    }

    let montantTNB =
      (parcelle.montantTotalTNB * parcelle.surfaceTotale) /
      parcelle.surfaceImposable;

    if (parcelle.exonereTNB) {
      montantTNB = 0; // Exonéré
    }

    return montantTNB;
  }

  // Génération du PDF de la fiche fiscale
  async generatePDF(ficheFiscaleId: number): Promise<Buffer> {
    const fiche = await this.repo.findOne({
      where: { id: ficheFiscaleId },
      relations: ['parcelle', 'proprietaire'],
    });

    if (!fiche) throw new NotFoundException('Fiche fiscale non trouvée');

    const doc = new PDFDocument();
    const filename = `Fiche_Fiscale_${fiche.id}.pdf`;

    doc.pipe(fs.createWriteStream(`./uploads/${filename}`));
    // Écrire sur le disque

    doc.fontSize(25).text('Fiche Fiscale', { align: 'center' });

    doc
      .fontSize(16)
      .text(`Propriétaire: ${fiche.proprietaire.nom}`, { align: 'left' })
      .text(`Parcelle: ${fiche.parcelle.referenceFonciere}`, { align: 'left' })
      .text(`Montant TNB: ${fiche.montantTNB}`, { align: 'left' })
      .text(`Année: ${fiche.annee}`, { align: 'left' })
      .text(`Statut: ${fiche.statut}`, { align: 'left' })
      .text(
        `Date de génération: ${fiche.dateGeneration.toLocaleDateString()}`,
        { align: 'left' },
      );

    doc.end();

    return fs.promises.readFile(`./uploads/${filename}`); // Retourner le fichier PDF
  }

  // Création de la fiche fiscale
  async create(dto: CreateFicheFiscaleDto): Promise<FicheFiscale> {
    const montantTNB = await this.calculerTNB(dto.parcelleId);

    const ficheFiscale = this.repo.create({
      ...dto,
      montantTNB,
    });

    return this.repo.save(ficheFiscale);
  }

  // Méthodes CRUD classiques
  async findAll() {
    return this.repo.find({ relations: ['parcelle', 'proprietaire'] });
  }

  async findOne(id: number) {
    const ficheFiscale = await this.repo.findOne({
      where: { id },
      relations: ['parcelle', 'proprietaire'],
    });
    if (!ficheFiscale) throw new NotFoundException('Fiche fiscale non trouvée');
    return ficheFiscale;
  }

  async update(id: number, dto: UpdateFicheFiscaleDto): Promise<FicheFiscale> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const ficheFiscale = await this.repo.findOneBy({ id });
    if (!ficheFiscale) throw new NotFoundException('Fiche fiscale non trouvée');
    await this.repo.delete(id);
  }
}
